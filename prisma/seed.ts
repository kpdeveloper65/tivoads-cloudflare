import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Automotive', icon: '🚗', color: '#3b82f6', description: 'Car brands, motorcycles, trucks, and automotive products' },
  { name: 'Food & Beverage', icon: '🍔', color: '#10b981', description: 'Food, drinks, restaurants, and CPG brands' },
  { name: 'Technology', icon: '💻', color: '#8b5cf6', description: 'Consumer tech, software, apps, and electronics' },
  { name: 'Healthcare & Pharma', icon: '💊', color: '#ef4444', description: 'Pharmaceuticals, medical devices, and health products' },
  { name: 'Finance & Insurance', icon: '💰', color: '#f59e0b', description: 'Banking, insurance, fintech, and investment services' },
  { name: 'Retail & E-commerce', icon: '🛒', color: '#ec4899', description: 'Retail chains, online stores, and shopping' },
  { name: 'Entertainment', icon: '🎬', color: '#06b6d4', description: 'Movies, TV shows, streaming services, and media' },
  { name: 'Sports & Fitness', icon: '⚽', color: '#84cc16', description: 'Sports brands, fitness equipment, and athletic wear' },
  { name: 'Travel & Tourism', icon: '✈️', color: '#0ea5e9', description: 'Airlines, hotels, travel agencies, and tourism' },
  { name: 'Fashion & Beauty', icon: '👗', color: '#f43f5e', description: 'Clothing, cosmetics, luxury brands, and accessories' },
  { name: 'Real Estate', icon: '🏠', color: '#64748b', description: 'Property sales, rentals, and home services' },
  { name: 'Telecommunications', icon: '📱', color: '#7c3aed', description: 'Mobile carriers, internet providers, and communication' },
  { name: 'Energy & Utilities', icon: '⚡', color: '#d97706', description: 'Energy companies, utilities, and sustainability' },
  { name: 'Education', icon: '📚', color: '#059669', description: 'Educational institutions, e-learning, and training' },
  { name: 'Non-Profit & Government', icon: '🤝', color: '#6b7280', description: 'Public service, non-profit, and social cause campaigns' },
  { name: 'Gaming', icon: '🎮', color: '#7c3aed', description: 'Video games, gaming hardware, and esports' },
  { name: 'Home & Garden', icon: '🏡', color: '#65a30d', description: 'Home appliances, furniture, and garden products' },
  { name: 'Pets', icon: '🐾', color: '#a16207', description: 'Pet food, accessories, and veterinary services' },
  { name: 'Alcohol & Beverages', icon: '🍺', color: '#dc2626', description: 'Beer, wine, spirits, and non-alcoholic beverages' },
  { name: 'Public Service', icon: '📢', color: '#0284c7', description: 'PSA campaigns and government announcements' },
];

const BRANDS = [
  { name: 'Apple', industry: 'Technology' },
  { name: 'Nike', industry: 'Sports & Fitness' },
  { name: 'Coca-Cola', industry: 'Food & Beverage' },
  { name: 'McDonald\'s', industry: 'Food & Beverage' },
  { name: 'Samsung', industry: 'Technology' },
  { name: 'Amazon', industry: 'Retail & E-commerce' },
  { name: 'Google', industry: 'Technology' },
  { name: 'Microsoft', industry: 'Technology' },
  { name: 'Toyota', industry: 'Automotive' },
  { name: 'Ford', industry: 'Automotive' },
  { name: 'BMW', industry: 'Automotive' },
  { name: 'Pepsi', industry: 'Food & Beverage' },
  { name: 'Budweiser', industry: 'Alcohol & Beverages' },
  { name: 'Old Spice', industry: 'Fashion & Beauty' },
  { name: 'Geico', industry: 'Finance & Insurance' },
  { name: 'State Farm', industry: 'Finance & Insurance' },
  { name: 'Subway', industry: 'Food & Beverage' },
  { name: 'Doritos', industry: 'Food & Beverage' },
  { name: 'Verizon', industry: 'Telecommunications' },
  { name: 'AT&T', industry: 'Telecommunications' },
];

const SAMPLE_ADS = [
  {
    title: "Apple Think Different - 1984 Super Bowl",
    brandName: "Apple",
    categoryName: "Technology",
    descriptionShort: "The iconic '1984' Super Bowl ad that launched the Macintosh computer and redefined advertising.",
    descriptionLong: "Apple's legendary 1984 Super Bowl commercial directed by Ridley Scott drew on themes from George Orwell's novel to announce the Macintosh as a device that would liberate people from the conformity of IBM's dominance. It aired once during the Super Bowl and changed advertising forever.",
    campaign: "1984",
    slogan: "On January 24th, Apple Computer will introduce Macintosh.",
    externalVideoId: "VtvjbmoDx-I",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 60,
    year: 1984,
    tags: ["super bowl", "iconic", "macintosh", "ridley scott", "classic"],
    isFeatured: true,
    isTrending: false,
  },
  {
    title: "Nike: Just Do It - Colin Kaepernick",
    brandName: "Nike",
    categoryName: "Sports & Fitness",
    descriptionShort: "Nike's bold 30th anniversary 'Just Do It' campaign featuring Colin Kaepernick.",
    descriptionLong: "Nike's 2018 campaign marking the 30th anniversary of 'Just Do It' featured Colin Kaepernick, former NFL quarterback and civil rights activist. The campaign sparked massive controversy and became one of the most talked-about ads of the decade.",
    campaign: "Dream Crazy",
    slogan: "Believe in something. Even if it means sacrificing everything.",
    externalVideoId: "Fq2CvmgmwHY",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 120,
    year: 2018,
    tags: ["just do it", "social justice", "controversial", "sports", "inspiration"],
    isFeatured: true,
    isTrending: true,
  },
  {
    title: "Coca-Cola: Share a Coke",
    brandName: "Coca-Cola",
    categoryName: "Food & Beverage",
    descriptionShort: "The personalization campaign that put names on Coke bottles and cans worldwide.",
    descriptionLong: "Launched in Australia in 2011 and globally thereafter, the 'Share a Coke' campaign replaced the Coca-Cola logo on bottles with 250 of Australia's most popular names. It reinvigorated the brand and became a global phenomenon.",
    campaign: "Share a Coke",
    slogan: "Share a Coke",
    externalVideoId: "sdJJwvDJLUM",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 30,
    year: 2014,
    tags: ["personalization", "sharing", "campaign", "global", "summer"],
    isFeatured: false,
    isTrending: true,
  },
  {
    title: "Old Spice: The Man Your Man Could Smell Like",
    brandName: "Old Spice",
    categoryName: "Fashion & Beauty",
    descriptionShort: "The hilarious and iconic Old Spice commercial that went viral instantly.",
    descriptionLong: "Wieden+Kennedy's 2010 campaign for Old Spice Body Wash starring Isaiah Mustafa became an instant viral hit. The 'Man Your Man Could Smell Like' spot garnered millions of views and revitalized the 75-year-old brand with humor and self-awareness.",
    campaign: "Smell Like a Man, Man",
    slogan: "Smell like a man, man.",
    externalVideoId: "owGykVbfgUE",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 32,
    year: 2010,
    tags: ["viral", "humorous", "men's grooming", "classic", "internet famous"],
    isFeatured: true,
    isTrending: false,
  },
  {
    title: "Geico: 15 Minutes Could Save You 15%",
    brandName: "Geico",
    categoryName: "Finance & Insurance",
    descriptionShort: "Geico's memorable caveman and gecko campaigns that defined an era of insurance advertising.",
    descriptionLong: "Geico's sustained campaign with the tagline '15 minutes could save you 15% or more on car insurance' became one of the most recognized slogans in American advertising history.",
    campaign: "15 Minutes",
    slogan: "15 minutes could save you 15% or more on car insurance.",
    externalVideoId: "kIK5NmBHX3M",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 30,
    year: 2015,
    tags: ["insurance", "gecko", "humorous", "slogan", "brand recall"],
    isFeatured: false,
    isTrending: false,
  },
  {
    title: "Budweiser: Puppy Love Super Bowl XLVIII",
    brandName: "Budweiser",
    categoryName: "Alcohol & Beverages",
    descriptionShort: "The heartwarming Super Bowl ad about a puppy and the Budweiser Clydesdales.",
    descriptionLong: "Budweiser's 2014 Super Bowl spot 'Puppy Love' told the story of a Labrador puppy who kept escaping from a farm to visit his horse friend among the Budweiser Clydesdales. It became the most-shared Super Bowl ad at the time.",
    campaign: "Clydesdales",
    slogan: "Best friends.",
    externalVideoId: "apGMBNPBqT0",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 60,
    year: 2014,
    tags: ["super bowl", "emotional", "puppy", "horses", "heartwarming"],
    isFeatured: true,
    isTrending: false,
  },
  {
    title: "Always: #LikeAGirl",
    brandName: "Always",
    categoryName: "Fashion & Beauty",
    descriptionShort: "Always redefines what it means to do something 'like a girl' in this powerful social campaign.",
    descriptionLong: "The '#LikeAGirl' campaign by Always challenged gender stereotypes and the language around puberty. The documentary-style ad went viral, sparking a global conversation about confidence and feminism.",
    campaign: "#LikeAGirl",
    slogan: "Rewrite the rules.",
    externalVideoId: "XjJQBjWYDTs",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 180,
    year: 2014,
    tags: ["feminism", "empowerment", "viral", "social cause", "inspirational"],
    isFeatured: false,
    isTrending: true,
  },
  {
    title: "Dove: Real Beauty Sketches",
    brandName: "Dove",
    categoryName: "Fashion & Beauty",
    descriptionShort: "Dove's powerful social experiment proving women are more beautiful than they think.",
    descriptionLong: "Dove's 'Real Beauty Sketches' campaign had an FBI-trained forensic artist sketch women as they described themselves, and then as strangers described them. The results showed women are more beautiful than they think — and became one of the most watched viral ads ever.",
    campaign: "Real Beauty",
    slogan: "You are more beautiful than you think.",
    externalVideoId: "XpaOjMXyJGk",
    sourcePlatform: "youtube",
    sourceType: "YOUTUBE" as const,
    duration: 180,
    year: 2013,
    tags: ["self-esteem", "real beauty", "social experiment", "viral", "empowerment"],
    isFeatured: true,
    isTrending: false,
  },
];

const TAGS = [
  'super bowl', 'viral', 'iconic', 'emotional', 'humorous', 'inspirational',
  'controversial', 'award-winning', 'classic', 'animation', 'celebrity',
  'social cause', 'holiday', 'summer', 'music', 'storytelling', 'product demo',
  'testimonial', 'comparison', 'nostalgia', 'fear appeal', 'humor', 'satire',
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@tivoads.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@tivoads.com',
      name: 'TivoAds Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name, { lower: true, strict: true });
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
    });
    categoryMap[cat.name] = category.id;
  }
  console.log(`✅ Categories seeded: ${CATEGORIES.length}`);

  // Create brands
  const brandMap: Record<string, string> = {};
  for (const brand of BRANDS) {
    const slug = slugify(brand.name, { lower: true, strict: true });
    const b = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: {
        name: brand.name,
        slug,
        industry: brand.industry,
      },
    });
    brandMap[brand.name] = b.id;
  }

  // Create additional brands from sample ads
  const additionalBrands = ['Always', 'Dove'];
  for (const brandName of additionalBrands) {
    if (!brandMap[brandName]) {
      const slug = slugify(brandName, { lower: true, strict: true });
      const b = await prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name: brandName, slug },
      });
      brandMap[brandName] = b.id;
    }
  }
  console.log(`✅ Brands seeded: ${Object.keys(brandMap).length}`);

  // Create tags
  const tagMap: Record<string, string> = {};
  for (const tagName of TAGS) {
    const slug = slugify(tagName, { lower: true, strict: true });
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    });
    tagMap[tagName] = tag.id;
  }
  console.log(`✅ Tags seeded: ${TAGS.length}`);

  // Create sample ads
  let adCount = 0;
  for (const adData of SAMPLE_ADS) {
    const slug = slugify(adData.title, { lower: true, strict: true });
    
    const brandId = adData.brandName ? brandMap[adData.brandName] : undefined;
    const categoryId = adData.categoryName ? categoryMap[adData.categoryName] : undefined;
    
    const embedUrl = adData.externalVideoId 
      ? `https://www.youtube.com/embed/${adData.externalVideoId}`
      : undefined;
    const thumbnailUrl = adData.externalVideoId
      ? `https://img.youtube.com/vi/${adData.externalVideoId}/maxresdefault.jpg`
      : undefined;
    
    const ad = await prisma.ad.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: adData.title,
        brandId,
        categoryId,
        descriptionShort: adData.descriptionShort,
        descriptionLong: adData.descriptionLong,
        campaign: adData.campaign,
        slogan: adData.slogan,
        embedUrl,
        thumbnailUrl,
        externalVideoId: adData.externalVideoId,
        sourcePlatform: adData.sourcePlatform,
        sourceType: adData.sourceType,
        duration: adData.duration,
        year: adData.year,
        isFeatured: adData.isFeatured,
        isTrending: adData.isTrending,
        viewCount: Math.floor(Math.random() * 50000) + 1000,
        favoriteCount: Math.floor(Math.random() * 1000) + 10,
        trendingScore: Math.random() * 100,
        status: 'PUBLISHED',
      },
    });

    // Add tags
    for (const tagName of adData.tags) {
      const tagSlug = slugify(tagName, { lower: true, strict: true });
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
      }
      await prisma.adTag.upsert({
        where: { adId_tagId: { adId: ad.id, tagId: tag.id } },
        update: {},
        create: { adId: ad.id, tagId: tag.id },
      });
    }
    
    adCount++;
  }
  console.log(`✅ Sample ads seeded: ${adCount}`);

  // Update ad counts on brands and categories
  const brands = await prisma.brand.findMany();
  for (const brand of brands) {
    const count = await prisma.ad.count({
      where: { brandId: brand.id, status: 'PUBLISHED' },
    });
    await prisma.brand.update({
      where: { id: brand.id },
      data: { adCount: count },
    });
  }

  const categories = await prisma.category.findMany();
  for (const category of categories) {
    const count = await prisma.ad.count({
      where: { categoryId: category.id, status: 'PUBLISHED' },
    });
    await prisma.category.update({
      where: { id: category.id },
      data: { adCount: count },
    });
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${CATEGORIES.length} categories`);
  console.log(`   - ${Object.keys(brandMap).length} brands`);
  console.log(`   - ${TAGS.length} tags`);
  console.log(`   - ${adCount} sample ads`);
  console.log(`   - 1 admin user (${admin.email})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
