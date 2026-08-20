import Link from 'next/link';

export default function AboutPage() {
  return (
    <div id="page-about" className="page-view" style={{ minHeight: '100vh', background: '#080e1a' }}>

      {/* Sticky breadcrumb bar */}
      <div className="sticky top-16 z-30 border-b border-white/5 bg-dark-950/90" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Home
            </Link>
            <span>›</span>
            <span className="text-white/60 font-medium">About</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'radial-gradient(ellipse at 20% 40%, rgba(249,115,22,0.10) 0%, transparent 60%), linear-gradient(135deg, #0f172a 0%, #080e1a 100%)', padding: '5rem 0 4rem' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/8 px-4 py-1.5 text-sm text-brand-400 mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            About TivoAds
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            The World&apos;s Premier<br /><span className="text-gradient">Ad Discovery Platform</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            TivoAds is a searchable archive and discovery library for TV and video advertisements — built for the people who study, create, and buy advertising for a living.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/55 leading-relaxed mb-4">
              Advertising shapes culture. Great ads make people laugh, cry, think, and act. Yet for decades, the world&apos;s most influential commercials were scattered across disconnected websites, hard to find and impossible to search.
            </p>
            <p className="text-white/55 leading-relaxed mb-4">
              TivoAds exists to change that. We&apos;ve built the most comprehensive, searchable archive of TV and digital advertisements — organized by brand, category, year, campaign, and creative style — so that anyone can find the perfect reference in seconds.
            </p>
            <p className="text-white/55 leading-relaxed">
              Whether you&apos;re a CMO benchmarking competitors, a creative director seeking inspiration, or a student writing a thesis on advertising history — TivoAds is built for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-brand-400 mb-1">50K+</div>
              <div className="text-sm text-white/40">Ads Archived</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-brand-400 mb-1">2,000+</div>
              <div className="text-sm text-white/40">Brands</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-brand-400 mb-1">20</div>
              <div className="text-sm text-white/40">Categories</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-brand-400 mb-1">180+</div>
              <div className="text-sm text-white/40">Countries</div>
            </div>
          </div>
        </div>

        {/* What we offer */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What Makes TivoAds Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-xl mb-4">🔍</div>
              <h3 className="font-semibold text-white mb-2">Powerful Search</h3>
              <p className="text-sm text-white/45 leading-relaxed">Full-text search across titles, slogans, campaign names, brands, and tags — with YouTube Discovery as a fallback for ads not yet in our database.</p>
            </div>
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl mb-4">📚</div>
              <h3 className="font-semibold text-white mb-2">Curated Library</h3>
              <p className="text-sm text-white/45 leading-relaxed">Every ad is reviewed, tagged, and enriched with metadata — brand, category, year, campaign name, duration, and creative approach — not just a YouTube link.</p>
            </div>
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl mb-4">🎯</div>
              <h3 className="font-semibold text-white mb-2">Built for Pros</h3>
              <p className="text-sm text-white/45 leading-relaxed">Save ads to collections, track your history, submit missing ads, and get alerts when new work drops from brands you follow.</p>
            </div>
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl mb-4">🆓</div>
              <h3 className="font-semibold text-white mb-2">Free to Browse</h3>
              <p className="text-sm text-white/45 leading-relaxed">The full library is free to explore. Create an account to unlock favorites, collections, submission tools, and personalized recommendations.</p>
            </div>
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-xl mb-4">📺</div>
              <h3 className="font-semibold text-white mb-2">YouTube Integration</h3>
              <p className="text-sm text-white/45 leading-relaxed">Our hybrid search engine scans both our curated archive and YouTube simultaneously, so you always get the most relevant results.</p>
            </div>
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl mb-4">🌍</div>
              <h3 className="font-semibold text-white mb-2">Global Coverage</h3>
              <p className="text-sm text-white/45 leading-relaxed">From iconic Super Bowl spots to regional campaigns in Southeast Asia — we cover advertising from over 180 countries and six decades of history.</p>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <div className="card p-8 sm:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(30,41,59,0.7) 100%)' }}>
          <h2 className="text-2xl font-bold text-white mb-3">Who Uses TivoAds?</h2>
          <p className="text-white/45 max-w-xl mx-auto mb-8">From Fortune 500 marketing teams to independent freelancers — our users span every corner of the advertising industry.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="badge bg-brand-500/15 text-brand-400 px-4 py-2 text-sm rounded-full">📊 Brand Marketers</span>
            <span className="badge bg-blue-500/15 text-blue-400 px-4 py-2 text-sm rounded-full">🎨 Creative Directors</span>
            <span className="badge bg-purple-500/15 text-purple-400 px-4 py-2 text-sm rounded-full">🏢 Ad Agencies</span>
            <span className="badge bg-emerald-500/15 text-emerald-400 px-4 py-2 text-sm rounded-full">📺 Media Buyers</span>
            <span className="badge bg-amber-500/15 text-amber-400 px-4 py-2 text-sm rounded-full">🎓 Students &amp; Academics</span>
            <span className="badge bg-red-500/15 text-red-400 px-4 py-2 text-sm rounded-full">🏪 Business Owners</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Explore?</h2>
          <p className="text-white/45 mb-6">Discover 50,000+ ads from the world&apos;s best advertisers — completely free.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/ads" className="btn-primary py-3 px-8">Browse Ads</Link>
            <Link href="/register" className="btn-outline py-3 px-8">Create Free Account</Link>
          </div>
        </div>

      </div>
    </div>
  );
}