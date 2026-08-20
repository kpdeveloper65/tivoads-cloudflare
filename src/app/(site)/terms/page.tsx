import Link from 'next/link';

export default function TermsPage() {
  return (
    <div id="page-terms" className="page-view" style={{ minHeight: '100vh', background: '#080e1a' }}>

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
            <span className="text-white/60 font-medium">Terms of Service</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: March 1, 2025</p>

        <div className="space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using TivoAds (&quot;Service&quot;, &quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>TivoAds is a searchable archive and discovery library for TV and digital video advertisements. The Service allows users to search, browse, save, and share advertisements and related metadata. We integrate with third-party video platforms, including YouTube, to provide video playback.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
            <div className="space-y-3">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Registration</h3>
                <p className="text-sm">To access certain features, you must create an account. You agree to provide accurate, current, and complete information and to keep it updated. You are responsible for maintaining the confidentiality of your credentials.</p>
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Account Security</h3>
                <p className="text-sm">You are responsible for all activities that occur under your account. Notify us immediately at <strong className="text-brand-400">support@tivoads.com</strong> of any unauthorized use.</p>
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-1">Account Termination</h3>
                <p className="text-sm">We reserve the right to suspend or terminate accounts that violate these Terms, engage in abusive behavior, or submit false or misleading content.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to use the Service to:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Submit false, misleading, or fraudulent ad submissions</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Scrape, crawl, or harvest data from the platform without written permission</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Attempt to gain unauthorized access to any part of the Service</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Upload or share content that infringes on third-party intellectual property rights</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Use the Service for any unlawful purpose or in violation of any applicable regulations</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Transmit spam, malware, or any disruptive code</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✕</span><span>Reverse engineer, decompile, or attempt to extract the source code of the platform</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. User-Submitted Content</h2>
            <p className="mb-3">When you submit ad information, descriptions, or other content (&quot;User Content&quot;), you grant TivoAds a worldwide, non-exclusive, royalty-free license to use, display, and distribute that content as part of the Service.</p>
            <p>You represent that you have all necessary rights to submit such content and that it does not infringe any third-party rights. TivoAds does not claim ownership of User Content, and you retain all rights to content you submit.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p className="mb-3">The TivoAds platform, including its design, software, database structure, logo, and original content, is the exclusive property of TivoAds and protected by copyright, trademark, and other intellectual property laws.</p>
            <p>Advertisement content hosted or linked on the platform remains the property of the respective brand owners and is referenced solely for informational, educational, and research purposes under fair use principles.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Third-Party Links &amp; Services</h2>
            <p>Our platform links to and embeds content from YouTube and other third-party services. We are not responsible for the content, privacy practices, or terms of these external services. Your use of third-party services is governed by their respective terms and policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimers</h2>
            <div className="card p-5 border-amber-500/20">
              <p className="text-sm">THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TIVOADS DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <div className="card p-5 border-red-500/20">
              <p className="text-sm">TO THE MAXIMUM EXTENT PERMITTED BY LAW, TIVOADS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL — ARISING OUT OF YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be resolved exclusively in the state or federal courts located in Delaware.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will provide at least 30 days&apos; notice of material changes via email or prominent notice on the platform. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Contact</h2>
            <div className="card p-6">
              <p className="mb-2">For questions about these Terms, contact us at:</p>
              <p className="text-white/80"><strong>TivoAds Legal Team</strong></p>
              <p>Email: <a href="mailto:legal@tivoads.com" className="text-brand-400 hover:text-brand-300">legal@tivoads.com</a></p>
            </div>
          </section>

        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="btn-outline text-sm py-2 px-5">← Back to Home</Link>
          <Link href="/privacy" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}