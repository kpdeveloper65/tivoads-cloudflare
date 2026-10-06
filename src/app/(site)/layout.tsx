export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script'; // Import the helper

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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