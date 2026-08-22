#!/usr/bin/env tsx
/**
 * TivoAds Multi-File Bulk SQL Generator & Runner (With Duplicate Skipping)
 * Usage: 
 *   Local D1:  npx tsx scripts/import.ts --file=./data/ads.json
 *   Remote D1: npx tsx scripts/import.ts --file=./data/ads.json --remote
 */

import { createReadStream, existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename, resolve } from 'path';
import csvParser from 'csv-parser';
import { execSync } from 'child_process';

const isRemote = process.argv.includes('--remote');

interface ImportConfig {
  file: string;
  status: string;
  dryRun: boolean;
}

function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 100);
}

function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

function parseDuration(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  if (!s) return null;
  if (s.includes(':')) {
    const parts = s.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  const num = parseInt(s, 10);
  return isNaN(num) ? null : num;
}

function sqlSanitize(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''").replace(/\r?\n/g, ' ');
}

/**
 * Fetch existing titles from D1 database to catch duplicates locally before chunking
 */
async function fetchExistingTitles(isRemoteEnv: boolean): Promise<Set<string>> {
  const titles = new Set<string>();
  try {
    const flag = isRemoteEnv ? '--remote' : '--local';
    const output = execSync(`npx wrangler d1 execute DB ${flag} --command="SELECT title FROM ads;" --json`, {
      stdio: ['pipe', 'pipe', 'ignore']
    }).toString();
    
    const parsed = JSON.parse(output);
    const rows = Array.isArray(parsed) ? (parsed[0]?.results || parsed) : [];
    for (const r of rows) {
      if (r.title) {
        titles.add(r.title.trim().toLowerCase());
      }
    }
  } catch (err) {
    console.warn(`⚠️ Warning: Could not fetch existing database records for duplicate checking. Proceeding without pre-check.`);
  }
  return titles;
}

async function runImport(config: ImportConfig) {
  console.log(`\n🚀 TivoAds Multi-File Bulk SQL Generator (${isRemote ? 'REMOTE' : 'LOCAL'} D1)`);
  console.log(`📁 Target File: ${basename(config.file)}`);

  if (!existsSync(config.file)) {
    console.error(`❌ Error: File not found at ${config.file}`);
    process.exit(1);
  }

  let rows: Record<string, any>[] = [];

  try {
    if (config.file.endsWith('.json')) {
      const rawData = await readFile(config.file, 'utf8');
      const parsed = JSON.parse(rawData);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      await new Promise<void>((resolvePromise, reject) => {
        createReadStream(config.file)
          .pipe(csvParser({
            mapHeaders: ({ header }) => header.toLowerCase().trim().replace(/\s+/g, '_'),
          }))
          .on('data', (row) => rows.push(row))
          .on('end', resolvePromise)
          .on('error', reject);
      });
    }
  } catch (err: any) {
    console.error(`❌ Parse Error: ${err.message}`);
    process.exit(1);
  }

  const total = rows.length;
  console.log(`📋 Total records found: ${total}. Fetching existing titles for duplicate checking...`);

  const existingTitles = await fetchExistingTitles(isRemote);
  console.log(`🔍 Found ${existingTitles.size} existing ad titles in target database.`);
  console.log(`📦 Generating SQL chunks...`);

  const brandSlugSet = new Set<string>();
  const categorySlugSet = new Set<string>();
  const tagSlugSet = new Set<string>();

  const batchId = `batch-${Date.now()}`;
  
  const RECORDS_PER_CHUNK = 1000;
  const sqlChunks: string[][] = [];
  let currentChunk: string[] = [];

  currentChunk.push('PRAGMA foreign_keys = OFF;');
  currentChunk.push('BEGIN TRANSACTION;');
  currentChunk.push(`
    INSERT INTO "import_batches" ("id", "name", "fileName", "fileType", "totalRecords", "status", "createdAt", "updatedAt")
    VALUES ('${batchId}', 'CLI Import: ${basename(config.file)}', '${basename(config.file)}', '${config.file.endsWith('.json') ? 'json' : 'csv'}', ${total}, 'PROCESSING', datetime('now'), datetime('now'));
  `);

  let imported = 0;
  let skipped = 0;
  let duplicates = 0;
  const chunkFilePaths: string[] = [];

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const title = (row.title || '').trim();
    
    if (!title) { 
      skipped++; 
      continue; 
    }

    // --- Duplicate Check matching Prisma script logic ---
    const lowerTitle = title.toLowerCase();
    if (existingTitles.has(lowerTitle)) {
      duplicates++;
      continue; // Skip inserting this duplicate record
    }
    // Prevent inserting duplicates within the same batch file upload payload too
    existingTitles.add(lowerTitle);

    const brandName = (row.brand || '').trim();
    let brandId: string | null = null;
    if (brandName) {
      const brandSlug = row.brand_slug || slugifyText(brandName);
      if (brandSlug) {
        brandId = `brand-${brandSlug}`;
        if (!brandSlugSet.has(brandSlug)) {
          brandSlugSet.add(brandSlug);
          currentChunk.push(`
            INSERT INTO "brands" ("id", "name", "slug", "createdAt", "updatedAt")
            VALUES ('${brandId}', '${sqlSanitize(brandName)}', '${brandSlug}', datetime('now'), datetime('now'))
            ON CONFLICT ("slug") DO UPDATE SET "name" = excluded."name";
          `);
        }
      }
    }

    const categoryName = (row.category_name || row.category || '').trim();
    let categoryId: string | null = null;
    if (categoryName) {
      const catSlug = row.category_slug || slugifyText(categoryName);
      if (catSlug) {
        categoryId = `cat-${catSlug}`;
        if (!categorySlugSet.has(catSlug)) {
          categorySlugSet.add(catSlug);
          currentChunk.push(`
            INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
            VALUES ('${categoryId}', '${sqlSanitize(categoryName)}', '${catSlug}', datetime('now'), datetime('now'))
            ON CONFLICT ("slug") DO UPDATE SET "name" = excluded."name";
          `);
        }
      }
    }

    const videoUrl = (row.video_url || '').trim();
    const ytId = extractYouTubeId(videoUrl);
    const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : videoUrl;
    const sourceType = ytId ? 'YOUTUBE' : (row.source_type || 'IMPORTED');

    const baseSlug = row.slug || slugifyText(title);
    const finalSlug = `${baseSlug}-${i + 1}`;
    const recordId = row.id || `ad-${i + 1}`;

    const descShort = sqlSanitize(row.description?.slice(0, 500) || '');
    const descLong = sqlSanitize(row.description_long || '');
    const campaign = sqlSanitize(row.campaign || '');
    const slogan = sqlSanitize(row.tagline || row.slogan || '');
    const thumbUrl = sqlSanitize(row.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : ''));
    const extVideoId = sqlSanitize(row.external_video_id || ytId || '');
    const duration = parseDuration(row.duration) || 0;
    const year = row.publish_date ? parseInt(String(row.publish_date).slice(0, 4), 10) : null;

    currentChunk.push(`
      INSERT INTO "ads" (
        "id", "slug", "title", "brandId", "categoryId", "descriptionShort", "descriptionLong",
        "campaign", "slogan", "videoUrl", "embedUrl", "thumbnailUrl", "externalVideoId",
        "duration", "year", "sourceType", "status", "importBatchId", "originalId", "createdAt", "updatedAt"
      ) VALUES (
        '${recordId}', '${finalSlug}', '${sqlSanitize(title)}', ${brandId ? `'${brandId}'` : 'NULL'}, ${categoryId ? `'${categoryId}'` : 'NULL'},
        '${descShort}', '${descLong}', '${campaign}', '${slogan}', '${sqlSanitize(videoUrl)}', '${sqlSanitize(embedUrl)}',
        '${thumbUrl}', '${extVideoId}', ${duration}, ${year ? year : 'NULL'}, '${sourceType}', '${config.status}',
        '${batchId}', '${sqlSanitize(row.original_id || row.id || '')}', datetime('now'), datetime('now')
      );
    `);

    const tagsRaw = row.tags || '';
    const tagNames = typeof tagsRaw === 'string'
      ? tagsRaw.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
      : Array.isArray(tagsRaw) ? tagsRaw : [];

    for (const tagName of tagNames) {
      const tSlug = slugifyText(tagName);
      if (!tSlug) continue;
      const tagId = `tag-${tSlug}`;
      if (!tagSlugSet.has(tSlug)) {
        tagSlugSet.add(tSlug);
        currentChunk.push(`
          INSERT INTO "tags" ("id", "name", "slug", "createdAt")
          VALUES ('${tagId}', '${sqlSanitize(tagName)}', '${tSlug}', datetime('now'))
          ON CONFLICT ("slug") DO NOTHING;
        `);
      }
      currentChunk.push(`
        INSERT INTO "ad_tags" ("adId", "tagId") VALUES ('${recordId}', '${tagId}') ON CONFLICT DO NOTHING;
      `);
    }

    imported++;

    // Track records per chunk accurately using modular imported count
    if (imported % RECORDS_PER_CHUNK === 0 || i === total - 1) {
      currentChunk.push('COMMIT;');
      sqlChunks.push(currentChunk);
      currentChunk = ['PRAGMA foreign_keys = OFF;', 'BEGIN TRANSACTION;'];
    }
  }

  // Handle edge case where all items might have been skipped or array was empty
  if (sqlChunks.length === 0) {
    console.log(`⚠️ No new records to import.`);
    return;
  }

  // Append batch completion status metadata to the final chunk
  const lastChunk = sqlChunks[sqlChunks.length - 1];
  lastChunk.splice(lastChunk.length - 1, 0, `
    UPDATE "import_batches" SET "status" = 'COMPLETED', "imported" = ${imported}, "skipped" = ${skipped}, "duplicates" = ${duplicates}, "completedAt" = datetime('now') WHERE "id" = '${batchId}';
  `);

  const tempDir = resolve(process.cwd(), 'sqltemp');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir);
  }

  sqlChunks.forEach((chunk, index) => {
    const filePath = resolve(tempDir, `chunk_${index + 1}.sql`);
    writeFileSync(filePath, chunk.join('\n'), 'utf8');
    chunkFilePaths.push(filePath);
  });

  console.log(`📦 Created ${chunkFilePaths.length} chunk files in /sqltemp directory.`);
  console.log(`🚀 Executing files sequentially via Wrangler (${isRemote ? 'REMOTE' : 'LOCAL'})...\n`);

  try {
    const flag = isRemote ? '--remote' : '--local';
    for (let i = 0; i < chunkFilePaths.length; i++) {
      const file = chunkFilePaths[i];
      process.stdout.write(`⏳ Executing chunk ${i + 1} of ${chunkFilePaths.length}...\r`);
      const command = `npx wrangler d1 execute DB ${flag} --file="${file}"`;
      execSync(command, { stdio: 'pipe' });
    }
    console.log(`\n\n✅ Import Complete!`);
    console.table({
      'Records Processed': total,
      'Imported Successfully': imported,
      'Skipped (No Title)': skipped,
      'Duplicates Found': duplicates,
      'Failed (Errors)': 0
    });
  } catch (err: any) {
    console.error(`\n❌ Execution error: ${err.message}`);
  } finally {
    console.log(`🧹 Cleaning up temporary files from /sqltemp...`);
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    console.log(`✨ Cleanup complete.`);
  }
}

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace('--', '').split('=');
  acc[key] = val || 'true';
  return acc;
}, {} as Record<string, string>);

if (!args.file || args.file === 'true') {
  console.error('❌ Error: Missing --file parameter.');
  process.exit(1);
}

runImport({
  file: args.file,
  status: args.status || 'PUBLISHED',
  dryRun: args['dry-run'] === 'true',
})
.catch(e => { console.error('Fatal Error:', e); process.exit(1); });