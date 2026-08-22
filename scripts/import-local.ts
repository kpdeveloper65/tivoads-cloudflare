#!/usr/bin/env tsx
/**
 * TivoAds Database Import Script - High Volume Optimized (With Pre-loaded & File-Self Duplicate Check)
 * Usage: npx tsx scripts/import-local.ts --file=./data/ads.json [--status=PUBLISHED] [--dry-run] [--skip-duplicates=true]
 */

import { PrismaClient } from '@prisma/client';
import { createReadStream, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();

interface ImportConfig {
  file: string;
  status: 'PUBLISHED' | 'PENDING' | 'DRAFT';
  dryRun: boolean;
  skipDuplicates: boolean;
}

/** * HELPERS  */
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

/**
 * MAIN IMPORT FUNCTION
 */
async function runImport(config: ImportConfig) {
  console.log(`\n🚀 TivoAds Bulk Import Tool (Prisma)`);
  console.log(`📁 Target: ${basename(config.file)}`);

  if (!existsSync(config.file)) {
    console.error(`❌ Error: File not found at ${config.file}`);
    process.exit(1);
  }

  let rows: Record<string, any>[] = [];

  // --- 1. PARSING ---
  try {
    if (config.file.endsWith('.json')) {
      const rawData = await readFile(config.file, 'utf8');
      const parsed = JSON.parse(rawData);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      await new Promise<void>((resolve, reject) => {
        createReadStream(config.file)
          .pipe(csvParser({
            mapHeaders: ({ header }) => header.toLowerCase().trim().replace(/\s+/g, '_'),
          }))
          .on('data', (row) => rows.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    }
  } catch (err: any) {
    console.error(`❌ Parse Error: ${err.message}`);
    process.exit(1);
  }

  const total = rows.length;
  console.log(`📋 Total records found: ${total}`);

  // Pre-load existing titles into memory Set for blazing fast case-insensitive duplicate checking
  const existingTitles = new Set<string>();
  if (config.skipDuplicates) {
    console.log(`🔍 Fetching existing titles from database for duplicate checking...`);
    const dbAds = await prisma.ad.findMany({ select: { title: true } });
    for (const ad of dbAds) {
      if (ad.title) {
        existingTitles.add(ad.title.trim().toLowerCase());
      }
    }
    console.log(`📦 Found ${existingTitles.size} existing titles in database.\n`);
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let duplicates = 0;
  const errors: string[] = [];

  // Create batch record in DB
  const batch = config.dryRun ? null : await prisma.importBatch.create({
    data: {
      name: `CLI Import: ${basename(config.file)}`,
      fileName: basename(config.file),
      fileType: config.file.endsWith('.json') ? 'json' : 'csv',
      totalRecords: total,
      status: 'PROCESSING',
      config: JSON.stringify(config),
    },
  });

  // --- 2. PROCESSING LOOP ---
  for (let i = 0; i < total; i++) {
    const row = rows[i];
    
    // Silent progress indicator
    if (i % 50 === 0 || i === total - 1) {
      const percent = Math.round(((i + 1) / total) * 100);
      process.stdout.write(`\r⏳ Progress: ${percent}% (${i + 1}/${total}) processing...`);
    }

    try {
      const title = (row.title || '').trim();
      if (!title) { skipped++; continue; }

      // --- Duplicate Check (Memory Set for speed & matching case-insensitive behavior) ---
      if (config.skipDuplicates) {
        const lowerTitle = title.toLowerCase();
        if (existingTitles.has(lowerTitle)) {
          duplicates++;
          errors.push(`Row ${i + 1}: Duplicate found for title "${title}"`);
          continue;
        }
        // Add to Set immediately to catch internal double-entries inside the import file itself
        existingTitles.add(lowerTitle);
      }

      if (config.dryRun) { imported++; continue; }

      // Brand Upsert
      const brandName = (row.brand || '').trim();
      let brandId: string | undefined;
      if (brandName) {
        const brandSlug = row.brand_slug || slugifyText(brandName);
        const brand = await prisma.brand.upsert({
          where: { slug: brandSlug },
          create: { name: brandName, slug: brandSlug },
          update: {},
        });
        brandId = brand.id;
      }

      // Category Upsert
      const categoryName = (row.category_name || row.category || '').trim();
      let categoryId: string | undefined;
      if (categoryName) {
        const catSlug = row.category_slug || slugifyText(categoryName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          create: { name: categoryName, slug: catSlug },
          update: {},
        });
        categoryId = category.id;
      }

      // Video/Source logic
      const videoUrl = (row.video_url || '').trim();
      const ytId = extractYouTubeId(videoUrl);
      const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : videoUrl;
      const sourceType = ytId ? 'YOUTUBE' : (row.source_type || 'IMPORTED');
      
      // Slug uniqueness
      let baseSlug = row.slug || slugifyText(title);
      let finalSlug = baseSlug;
      let attempt = 1;
      while (await prisma.ad.findUnique({ where: { slug: finalSlug }, select: { id: true } })) {
        finalSlug = `${baseSlug}-${attempt}`;
        attempt++;
      }

      // Create Ad
      const ad = await prisma.ad.create({
        data: {
          slug: finalSlug,
          title,
          brandId,
          categoryId,
          descriptionShort: row.description?.slice(0, 500) || null,
          descriptionLong: row.description_long || null,
          campaign: row.campaign || null,
          slogan: row.tagline || row.slogan || null,
          videoUrl: videoUrl || null,
          embedUrl: embedUrl || null,
          thumbnailUrl: row.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null),
          externalVideoId: row.external_video_id || ytId || null,
          duration: parseDuration(row.duration),
          year: row.publish_date ? parseInt(String(row.publish_date).slice(0, 4), 10) : null,
          sourceType: sourceType as any,
          status: config.status,
          importBatchId: batch?.id,
          originalId: String(row.original_id || row.id || ''),
        },
      });

      // Tags logic
      const tagsRaw = row.tags || '';
      const tagNames = typeof tagsRaw === 'string' 
        ? tagsRaw.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
        : Array.isArray(tagsRaw) ? tagsRaw : [];

      for (const name of tagNames) {
        const tSlug = slugifyText(name);
        if (!tSlug) continue;
        const tag = await prisma.tag.upsert({
          where: { slug: tSlug },
          create: { name, slug: tSlug },
          update: {},
        });
        await prisma.adTag.upsert({
          where: { adId_tagId: { adId: ad.id, tagId: tag.id } },
          create: { adId: ad.id, tagId: tag.id },
          update: {},
        }).catch(() => {});
      }

      imported++;
    } catch (err: any) {
      failed++;
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  // --- 3. FINALIZATION ---
  if (batch) {
    await prisma.importBatch.update({
      where: {
        id: batch.id
      },
      data: {
        status: failed > 0 && imported === 0 ? "FAILED" : "COMPLETED",
        imported: imported,
        skipped: skipped,
        failed: failed,
        duplicates: duplicates,
        errorLog: errors.length > 0 ? errors.join('\n') : null,
        completedAt: new Date()
      }
    });

    console.log('\n\n📊 Refreshing stats counters...');
    
    const allBrands = await prisma.brand.findMany({ select: { id: true } });
    for (const brand of allBrands) {
      const count = await prisma.ad.count({ where: { brandId: brand.id, status: 'PUBLISHED' } });
      await prisma.brand.update({ where: { id: brand.id }, data: { adCount: count } });
    }

    const allCategories = await prisma.category.findMany({ select: { id: true } });
    for (const cat of allCategories) {
      const count = await prisma.ad.count({ where: { categoryId: cat.id, status: 'PUBLISHED' } });
      await prisma.category.update({ where: { id: cat.id }, data: { adCount: count } });
    }
  }

  console.log(`\n✅ Import Complete!`);
  console.table({
    'Records Processed': total,
    'Imported Successfully': imported,
    'Skipped (No Title)': skipped,
    'Duplicates Found': duplicates,
    'Failed (Errors)': failed
  });

  if (errors.length > 0) {
    console.log(`\n❌ Summary of First 5 Errors:`);
    errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
  }
}

// ARGS PARSING
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
  status: (args.status as any) || 'PUBLISHED',
  dryRun: args['dry-run'] === 'true',
  skipDuplicates: args['skip-duplicates'] !== 'false',
})
.catch(e => { console.error('Fatal Error:', e); process.exit(1); })
.finally(() => prisma.$disconnect());