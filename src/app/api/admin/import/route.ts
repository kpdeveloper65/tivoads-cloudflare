import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify, extractYouTubeId, getYouTubeThumbnail } from '@/lib/utils';

// Simple CSV parser
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, '').replace(/\s+/g, '_'));

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return headers.reduce((obj, header, i) => ({
      ...obj,
      [header]: values[i]?.trim().replace(/^["']|["']$/g, '') || '',
    }), {} as Record<string, string>);
  }).filter((row) => Object.values(row).some((v) => v !== ''));
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function normalizeFieldName(field: string): string {
  return field.toLowerCase().replace(/[\s_-]+/g, '_');
}

function getField(row: Record<string, string>, ...fieldNames: string[]): string {
  for (const name of fieldNames) {
    const normalized = normalizeFieldName(name);
    for (const key of Object.keys(row)) {
      if (normalizeFieldName(key) === normalized) {
        return row[key] || '';
      }
    }
  }
  return '';
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const defaultStatus = (formData.get('defaultStatus') as string) || 'PUBLISHED';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    let rows: Record<string, string>[];

    if (file.name.endsWith('.json')) {
      rows = JSON.parse(text);
    } else {
      rows = parseCSV(text);
    }

    // Create import batch
    const batch = await prisma.importBatch.create({
      data: {
        name: `Import: ${file.name}`,
        fileName: file.name,
        fileType: file.name.endsWith('.json') ? 'json' : 'csv',
        totalRecords: rows.length,
        status: 'PROCESSING',
        initiatedBy: session.user.id,
        config: { skipDuplicates, defaultStatus } as any,
      },
    });

    let imported = 0;
    let skipped = 0;
    let failed = 0;
    let duplicates = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const title = getField(row, 'title', 'ad_title', 'name');
        if (!title) {
          errors.push(`Row ${i + 2}: Missing title`);
          failed++;
          continue;
        }

        // Generate slug
        let baseSlug = slugify(title);
        let slug = baseSlug;
        let attempt = 0;
        while (await prisma.ad.findUnique({ where: { slug } })) {
          attempt++;
          slug = `${baseSlug}-${attempt}`;
        }

        // Check for duplicates (Removed mode: 'insensitive' for Cloudflare D1 / SQLite compatibility)
        if (skipDuplicates) {
          const existing = await prisma.ad.findFirst({
            where: { title: { equals: title } },
          });
          if (existing) {
            duplicates++;
            await prisma.importLog.create({
              data: {
                batchId: batch.id,
                action: 'duplicate',
                originalData: row as any,
                message: `Duplicate: "${title}" already exists`,
              },
            });
            continue;
          }
        }

        // Find or create brand
        const brandName = getField(row, 'brand', 'brand_name', 'advertiser');
        let brandId: string | undefined;
        if (brandName) {
          const brandSlug = slugify(brandName);
          const brand = await prisma.brand.upsert({
            where: { slug: brandSlug },
            create: { name: brandName, slug: brandSlug },
            update: {},
          });
          brandId = brand.id;
        }

        // Find or create category
        const categoryName = getField(row, 'category', 'category_name', 'industry');
        let categoryId: string | undefined;
        if (categoryName) {
          const catSlug = slugify(categoryName);
          const category = await prisma.category.upsert({
            where: { slug: catSlug },
            create: { name: categoryName, slug: catSlug },
            update: {},
          });
          categoryId = category.id;
        }

        // Process video URL
        const videoUrl = getField(row, 'video_url', 'url', 'video', 'embed_url');
        let embedUrl = videoUrl;
        let externalVideoId: string | undefined;
        let thumbnailUrl = getField(row, 'thumbnail', 'thumbnail_url', 'image', 'image_url');
        let sourceType: 'INTERNAL' | 'YOUTUBE' | 'IMPORTED' = 'IMPORTED';

        if (videoUrl) {
          const ytId = extractYouTubeId(videoUrl);
          if (ytId) {
            externalVideoId = ytId;
            embedUrl = `https://www.youtube.com/embed/${ytId}`;
            sourceType = 'YOUTUBE';
            if (!thumbnailUrl) {
              thumbnailUrl = getYouTubeThumbnail(ytId, 'maxres');
            }
          } else if (videoUrl.includes('vimeo.com')) {
            sourceType = 'INTERNAL';
          }
        }

        // Process duration
        const durationStr = getField(row, 'duration', 'length');
        let duration: number | undefined;
        if (durationStr) {
          if (durationStr.includes(':')) {
            const [mins, secs] = durationStr.split(':').map(Number);
            duration = mins * 60 + secs;
          } else if (durationStr.endsWith('s')) {
            duration = parseInt(durationStr);
          } else {
            duration = parseInt(durationStr);
          }
        }

        // Parse year
        const yearStr = getField(row, 'year', 'date', 'publish_date');
        let year: number | undefined;
        if (yearStr) {
          const parsed = parseInt(yearStr.slice(0, 4));
          if (parsed > 1900 && parsed <= new Date().getFullYear() + 1) {
            year = parsed;
          }
        }

        // Parse tags
        const tagsStr = getField(row, 'tags', 'keywords');
        const tagNames = tagsStr
          ? tagsStr.split(/[,;|]/).map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [];

        // Create ad
        const ad = await prisma.ad.create({
          data: {
            slug,
            title,
            brandId,
            categoryId,
            descriptionShort: getField(row, 'description', 'description_short', 'summary').slice(0, 500) || null,
            descriptionLong: getField(row, 'description_long', 'full_description', 'body') || null,
            campaign: getField(row, 'campaign', 'campaign_name') || null,
            slogan: getField(row, 'slogan', 'tagline') || null,
            videoUrl: videoUrl || null,
            embedUrl: embedUrl || null,
            thumbnailUrl: thumbnailUrl || null,
            externalVideoId: externalVideoId || null,
            duration: duration || null,
            year: year || null,
            sourceType,
            status: defaultStatus as any,
            importBatchId: batch.id,
            originalId: getField(row, 'id', 'original_id') || null,
          },
        });

        // Create tags
        for (const tagName of tagNames) {
          const tagSlug = slugify(tagName);
          if (!tagSlug) continue;
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
            update: {},
          });
          await prisma.adTag.upsert({
            where: { adId_tagId: { adId: ad.id, tagId: tag.id } },
            create: { adId: ad.id, tagId: tag.id },
            update: {},
          });
        }

        await prisma.importLog.create({
          data: {
            batchId: batch.id,
            action: 'import',
            originalData: row as any,
            importedId: ad.id,
            message: `Imported: ${title}`,
          },
        });

        imported++;
      } catch (rowError: any) {
        failed++;
        const errMsg = `Row ${i + 2}: ${rowError?.message || 'Unknown error'}`;
        errors.push(errMsg);
        await prisma.importLog.create({
          data: {
            batchId: batch.id,
            action: 'error',
            originalData: row as any,
            message: errMsg,
          },
        }).catch(() => {});
      }
    }

    // Update batch
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        status: failed === rows.length ? 'FAILED' : 'COMPLETED',
        imported,
        skipped,
        failed,
        duplicates,
        errorLog: errors as any,
        completedAt: new Date(),
      },
    });

    // Update brand/category ad counts
    const brands = await prisma.brand.findMany();
    for (const brand of brands) {
      const count = await prisma.ad.count({ where: { brandId: brand.id, status: 'PUBLISHED' } });
      await prisma.brand.update({ where: { id: brand.id }, data: { adCount: count } });
    }
    const categories = await prisma.category.findMany();
    for (const cat of categories) {
      const count = await prisma.ad.count({ where: { categoryId: cat.id, status: 'PUBLISHED' } });
      await prisma.category.update({ where: { id: cat.id }, data: { adCount: count } });
    }

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      imported,
      skipped,
      failed,
      duplicates,
      errors: errors.slice(0, 50),
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error?.message || 'Import failed' }, { status: 500 });
  }
}