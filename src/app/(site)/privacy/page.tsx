import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div id="page-privacy" className="page-view" style={{ minHeight: '100vh', background: '#080e1a' }}>
      
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
            <span className="text-white/60 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: March 1, 2025</p>

        <div className="space-y-10 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>Welcome to TivoAds (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit <strong className="text-white/80">tivoads.com</strong> and use our services.</p>
            <p className="mt-3">Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect information about you in the following ways:</p>
            <div className="space-y-3">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Personal Data You Provide</h3>
                <p className="text-sm">When you register for an account, we collect your name, email address, and password. If you submit an ad or contact us, we collect the information you provide in those forms.</p>
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Usage Data</h3>
                <p className="text-sm">We automatically collect certain information when you visit the site — including your IP address, browser type, operating system, pages viewed, search queries entered, and time spent on pages.</p>
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Cookies &amp; Tracking Technologies</h3>
                <p className="text-sm">We use cookies, web beacons, and similar technologies to enhance your experience, remember preferences, and analyze site usage. You can control cookies through your browser settings.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To create and manage your account and authenticate your identity</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To deliver and improve our ad discovery and search services</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To personalize your experience and recommend relevant ads</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To send transactional emails (account confirmation, password resets)</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To send marketing emails if you&apos;ve opted in (you may unsubscribe at any time)</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To analyze usage patterns and improve the platform</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>To comply with legal obligations and enforce our Terms of Service</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Sharing Your Information</h2>
            <p className="mb-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span><strong className="text-white/80">Service Providers:</strong> Third-party vendors who assist in operating the platform (hosting, analytics, email delivery), bound by confidentiality obligations.</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span><strong className="text-white/80">Legal Requirements:</strong> If required by law, court order, or governmental authority.</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span><strong className="text-white/80">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with appropriate confidentiality protections.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p>Our platform integrates with YouTube (Google LLC) to surface video content. When you interact with embedded YouTube players, YouTube&apos;s own privacy policy and terms apply. We are not responsible for YouTube&apos;s data practices. Please review <Link href="https://policies.google.com/privacy" target="_blank" className="text-brand-400 hover:text-brand-300">Google&apos;s Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active, or as needed to provide services. Search and usage logs are retained for up to 24 months. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the following rights:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Access</p><p className="text-xs text-white/40">Request a copy of the personal data we hold about you.</p></div>
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Correction</p><p className="text-xs text-white/40">Request correction of inaccurate or incomplete data.</p></div>
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Deletion</p><p className="text-xs text-white/40">Request erasure of your personal data (&quot;right to be forgotten&quot;).</p></div>
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Portability</p><p className="text-xs text-white/40">Receive your data in a machine-readable format.</p></div>
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Objection</p><p className="text-xs text-white/40">Object to processing of your data for direct marketing.</p></div>
              <div className="card p-4"><p className="text-sm font-medium text-white mb-1">Restriction</p><p className="text-xs text-white/40">Request restriction of processing in certain circumstances.</p></div>
            </div>
            <p className="mt-4">To exercise any of these rights, please contact us at <strong className="text-brand-400">privacy@tivoads.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Security</h2>
            <p>We implement industry-standard security measures including SSL/TLS encryption, bcrypt password hashing, and regular security audits. However, no system is completely secure. We encourage you to use a strong, unique password and to contact us immediately if you suspect unauthorized account access.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>TivoAds is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify registered users of material changes via email. The &quot;Last updated&quot; date at the top of this page reflects when the policy was last revised. Continued use of the platform after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact Us</h2>
            <div className="card p-6">
              <p className="mb-2">For privacy-related inquiries, contact us at:</p>
              <p className="text-white/80"><strong>TivoAds Privacy Team</strong></p>
              <p>Email: <a href="mailto:privacy@tivoads.com" className="text-brand-400 hover:text-brand-300">privacy@tivoads.com</a></p>
              <p className="mt-2 text-sm text-white/40">We aim to respond to all privacy requests within 30 days.</p>
            </div>
          </section>

        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="btn-outline text-sm py-2 px-5">← Back to Home</Link>
          <Link href="/terms" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View Terms of Service →</Link>
        </div>
      </div>
    </div>
  );
}