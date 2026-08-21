-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "name" TEXT,
    "username" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "bio" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "imageUrl" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brandId" TEXT,
    "categoryId" TEXT,
    "descriptionShort" TEXT,
    "descriptionLong" TEXT,
    "campaign" TEXT,
    "slogan" TEXT,
    "videoUrl" TEXT,
    "embedUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "sourceType" TEXT NOT NULL DEFAULT 'INTERNAL',
    "sourcePlatform" TEXT,
    "externalVideoId" TEXT,
    "externalChannelId" TEXT,
    "externalChannelName" TEXT,
    "language" TEXT DEFAULT 'en',
    "country" TEXT,
    "year" INTEGER,
    "publishDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "trendingScore" REAL NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "importBatchId" TEXT,
    "originalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ads_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ads_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_tags" (
    "adId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("adId", "tagId"),
    CONSTRAINT "ad_tags_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ad_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_relations" (
    "fromAdId" TEXT NOT NULL,
    "toAdId" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "reason" TEXT,

    PRIMARY KEY ("fromAdId", "toAdId"),
    CONSTRAINT "ad_relations_fromAdId_fkey" FOREIGN KEY ("fromAdId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ad_relations_toAdId_fkey" FOREIGN KEY ("toAdId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "adCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collection_ads" (
    "collectionId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("collectionId", "adId"),
    CONSTRAINT "collection_ads_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_ads_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "watch_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "watch_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "watch_history_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_follows" (
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "followedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "categoryId"),
    CONSTRAINT "category_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_follows_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "brand_follows" (
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "followedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "brandId"),
    CONSTRAINT "brand_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "brand_follows_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "brandName" TEXT,
    "categoryName" TEXT,
    "videoUrl" TEXT NOT NULL,
    "notes" TEXT,
    "contactEmail" TEXT,
    "submittedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "importedAdId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "youtube_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "youtube_candidates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelName" TEXT,
    "channelId" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "publishedAt" DATETIME,
    "duration" TEXT,
    "durationSeconds" INTEGER,
    "viewCount" INTEGER,
    "rawData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "importedAdId" TEXT,
    "possibleDuplicateId" TEXT,
    "duplicateScore" REAL,
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorLog" TEXT,
    "config" TEXT,
    "initiatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "import_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "originalData" TEXT,
    "importedId" TEXT,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_logs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "import_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "import_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'internal',
    "userId" TEXT,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "adId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_name_idx" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ads_slug_key" ON "ads"("slug");

-- CreateIndex
CREATE INDEX "ads_slug_idx" ON "ads"("slug");

-- CreateIndex
CREATE INDEX "ads_brandId_idx" ON "ads"("brandId");

-- CreateIndex
CREATE INDEX "ads_categoryId_idx" ON "ads"("categoryId");

-- CreateIndex
CREATE INDEX "ads_sourceType_idx" ON "ads"("sourceType");

-- CreateIndex
CREATE INDEX "ads_status_idx" ON "ads"("status");

-- CreateIndex
CREATE INDEX "ads_publishDate_idx" ON "ads"("publishDate");

-- CreateIndex
CREATE INDEX "ads_isFeatured_idx" ON "ads"("isFeatured");

-- CreateIndex
CREATE INDEX "ads_isTrending_idx" ON "ads"("isTrending");

-- CreateIndex
CREATE INDEX "ads_trendingScore_idx" ON "ads"("trendingScore");

-- CreateIndex
CREATE INDEX "ads_externalVideoId_idx" ON "ads"("externalVideoId");

-- CreateIndex
CREATE INDEX "ads_year_idx" ON "ads"("year");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_adId_idx" ON "favorites"("adId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_adId_key" ON "favorites"("userId", "adId");

-- CreateIndex
CREATE INDEX "collections_userId_idx" ON "collections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collections_userId_slug_key" ON "collections"("userId", "slug");

-- CreateIndex
CREATE INDEX "watch_history_userId_idx" ON "watch_history"("userId");

-- CreateIndex
CREATE INDEX "watch_history_adId_idx" ON "watch_history"("adId");

-- CreateIndex
CREATE UNIQUE INDEX "watch_history_userId_adId_key" ON "watch_history"("userId", "adId");

-- CreateIndex
CREATE INDEX "comments_adId_idx" ON "comments"("adId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_cache_queryHash_key" ON "youtube_cache"("queryHash");

-- CreateIndex
CREATE INDEX "youtube_cache_queryHash_idx" ON "youtube_cache"("queryHash");

-- CreateIndex
CREATE INDEX "youtube_cache_expiresAt_idx" ON "youtube_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_candidates_videoId_key" ON "youtube_candidates"("videoId");

-- CreateIndex
CREATE INDEX "youtube_candidates_videoId_idx" ON "youtube_candidates"("videoId");

-- CreateIndex
CREATE INDEX "youtube_candidates_status_idx" ON "youtube_candidates"("status");

-- CreateIndex
CREATE INDEX "import_batches_status_idx" ON "import_batches"("status");

-- CreateIndex
CREATE INDEX "import_logs_batchId_idx" ON "import_logs"("batchId");

-- CreateIndex
CREATE INDEX "search_logs_query_idx" ON "search_logs"("query");

-- CreateIndex
CREATE INDEX "search_logs_createdAt_idx" ON "search_logs"("createdAt");

-- CreateIndex
CREATE INDEX "page_views_adId_idx" ON "page_views"("adId");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");
