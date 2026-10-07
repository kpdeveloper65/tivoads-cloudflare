export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script'; // Import the helper
import { headers } from 'next/headers'; // 1. IMPORT HEADERS TO CAPTURE USER AGENT


// 2. HELPER LOGIC TO DETECT UNWANTED BOTS
async function isDisallowedBot(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const uaLower = userAgent.toLowerCase();

  // Flag anything explicitly trying to look like a generic crawler, spider, or bot
  const isGenericBot = 
    uaLower.includes('curl') ||
    uaLower.includes('bot') || 
    uaLower.includes('crawl') || 
    uaLower.includes('spider') || 
    uaLower.includes('python-requests') ||
    uaLower.includes('scraper');

  // Explicitly allowlist only Google and Bing
  const isAllowedSearchEngine = uaLower.includes('googlebot') || uaLower.includes('bingbot');

  // If it is a bot, but NOT Google or Bing, intercept it
  if (isGenericBot && !isAllowedSearchEngine) {
    return true;
  }

  return false;
}



export default async function SiteLayout({ children }: { children: React.ReactNode }) {

  // 3. THIS RUNS FIRST: STOP UNVERIFIED BOTS IMMEDIATELY BEFORE ANY PRISMA CALLS EXECUTE
  if (await isDisallowedBot()) {
    return (
      <div className="section-container py-20 text-center min-h-[400px] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Automated data scraping is prohibited on this platform.
        </p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col">

      {/* Google Analytics Script */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CC90K5FHYS"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CC90K5FHYS');
        `}
      </Script>


      {/* Using next/script with strategy="beforeInteractive" or "afterInteractive" 
          effectively places the script logic in the document head/early load sequence.
      */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6950484744639563"
        strategy="afterInteractive"
      />

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}