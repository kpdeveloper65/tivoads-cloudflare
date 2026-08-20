import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tivoads.com';

export async function GET() {
  const [ads, categories, brands] = await Promise.all([
    prisma.ad.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10000,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/ads', changefreq: 'daily', priority: '0.9' },
    { url: '/trending', changefreq: 'daily', priority: '0.8' },
    { url: '/categories', changefreq: 'weekly', priority: '0.8' },
    { url: '/brands', changefreq: 'weekly', priority: '0.7' },
    { url: '/search', changefreq: 'weekly', priority: '0.6' },
    { url: '/submit', changefreq: 'monthly', priority: '0.5' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${categories.map((cat) => `  <url>
    <loc>${BASE_URL}/categories/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
  </url>`).join('\n')}
${brands.map((brand) => `  <url>
    <loc>${BASE_URL}/brands/${brand.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${brand.updatedAt.toISOString()}</lastmod>
  </url>`).join('\n')}
${ads.map((ad) => `  <url>
    <loc>${BASE_URL}/ads/${ad.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${ad.updatedAt.toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400',
    },
  });
}
