-- ==========================================
-- HOMEPAGE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS "ads_status_viewCount_idx" ON "ads"("status", "viewCount");
CREATE INDEX IF NOT EXISTS "ads_status_createdAt_idx" ON "ads"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ads_status_isFeatured_viewCount_idx" ON "ads"("status", "isFeatured", "viewCount");
CREATE INDEX IF NOT EXISTS "ads_status_isTrending_trendingScore_idx" ON "ads"("status", "isTrending", "trendingScore");
CREATE INDEX IF NOT EXISTS "ads_status_brandId_idx" ON "ads"("status", "brandId");
CREATE INDEX IF NOT EXISTS "ads_status_categoryId_idx" ON "ads"("status", "categoryId");

-- ==========================================
-- SEARCH & FILTER PAGE INDEXES (NEW)
-- ==========================================
CREATE INDEX IF NOT EXISTS "ads_status_duration_idx" ON "ads"("status", "duration");
CREATE INDEX IF NOT EXISTS "ads_status_year_idx" ON "ads"("status", "year");
CREATE INDEX IF NOT EXISTS "ads_status_categoryId_viewCount_idx" ON "ads"("status", "categoryId", "viewCount" DESC);
CREATE INDEX IF NOT EXISTS "ads_status_brandId_viewCount_idx" ON "ads"("status", "brandId", "viewCount" DESC);