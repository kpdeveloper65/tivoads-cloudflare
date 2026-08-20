import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Cleaning up content tables (handling dependencies)...")

  // 1. Delete "junction" and "child" tables first
  const deleteImportLogs = prisma.importLog.deleteMany()
  const deleteAdTags = prisma.adTag.deleteMany()
  const deleteAdRelations = prisma.adRelation.deleteMany()
  const deleteCollectionAds = prisma.collectionAd.deleteMany()
  const deleteCategoryFollows = prisma.categoryFollow.deleteMany()
  const deleteBrandFollows = prisma.brandFollow.deleteMany()
  
  // 2. Delete tables that are referenced by others
  const deleteFavorites = prisma.favorite.deleteMany()
  const deleteWatchHistory = prisma.watchHistory.deleteMany()
  const deleteComments = prisma.comment.deleteMany()
  const deleteSubmissions = prisma.submission.deleteMany()
  const deleteYouTubeCandidates = prisma.youTubeCandidate.deleteMany()
  
  // 3. Delete the main content entities
  const deleteAds = prisma.ad.deleteMany()
  const deleteBrands = prisma.brand.deleteMany()
  const deleteCategories = prisma.category.deleteMany()
  const deleteTags = prisma.tag.deleteMany()
  
  // 4. Finally delete the metadata/infrastructure tables
  const deleteImportBatches = prisma.importBatch.deleteMany()
  const deleteYouTubeCache = prisma.youTubeCache.deleteMany()

  // Execute in the correct dependency order
  await prisma.$transaction([
    deleteImportLogs,
    deleteAdTags,
    deleteAdRelations,
    deleteCollectionAds,
    deleteCategoryFollows,
    deleteBrandFollows,
    deleteFavorites,
    deleteWatchHistory,
    deleteComments,
    deleteSubmissions,
    deleteYouTubeCandidates,
    deleteAds,
    deleteBrands,
    deleteCategories,
    deleteTags,
    deleteImportBatches,
    deleteYouTubeCache
  ])

  console.log("Cleanup complete. Content cleared, Users preserved.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect())