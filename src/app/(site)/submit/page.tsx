'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Send, CheckCircle, AlertCircle, Loader2, Video, Plus } from 'lucide-react';

export default function SubmitAdPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    brandName: '',
    categoryName: '',
    videoUrl: '',
    notes: '',
    contactEmail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: session?.user.id,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORIES = [
    'Automotive', 'Food & Beverage', 'Technology', 'Healthcare & Pharma',
    'Finance & Insurance', 'Retail & E-commerce', 'Entertainment', 'Sports & Fitness',
    'Travel & Tourism', 'Fashion & Beauty', 'Telecommunications', 'Gaming',
    'Home & Garden', 'Pets', 'Alcohol & Beverages', 'Education', 'Other',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-12 px-4">
        <div className="section-container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 mb-6">
            <Plus className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="heading-2 text-white mb-3">Submit a Missing Ad</h1>
          <p className="text-white/60 text-lg">
            Found an ad that&apos;s not in our database? Submit it here and our team will review it for inclusion.
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Submission Received!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for contributing to TivoAds. Our team will review your submission and add it to the database if approved.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/ads" className="btn btn-primary btn-md">Browse Ads</Link>
                <button
                  onClick={() => { setSubmitted(false); setForm({ title: '', brandName: '', categoryName: '', videoUrl: '', notes: '', contactEmail: '' }); }}
                  className="btn btn-outline btn-md"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ad Title */}
                  <div>
                    <label className="label mb-1.5 block" htmlFor="title">
                      Ad Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Nike - Just Do It 2023"
                      className="input-base"
                    />
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="label mb-1.5 block" htmlFor="brandName">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="brandName"
                      name="brandName"
                      type="text"
                      value={form.brandName}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Nike"
                      className="input-base"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="label mb-1.5 block" htmlFor="categoryName">
                      Category / Industry
                    </label>
                    <select
                      id="categoryName"
                      name="categoryName"
                      value={form.categoryName}
                      onChange={handleChange}
                      className="input-base"
                    >
                      <option value="">Select a category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="label mb-1.5 block" htmlFor="videoUrl">
                      Video URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="videoUrl"
                      name="videoUrl"
                      type="url"
                      value={form.videoUrl}
                      onChange={handleChange}
                      required
                      placeholder="https://youtube.com/watch?v=..."
                      className="input-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      YouTube, Vimeo, or other video hosting URL
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="label mb-1.5 block" htmlFor="notes">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Campaign name, year, any additional context..."
                      className="input-base resize-none"
                    />
                  </div>

                  {/* Contact Email */}
                  {!session && (
                    <div>
                      <label className="label mb-1.5 block" htmlFor="contactEmail">
                        Contact Email (optional)
                      </label>
                      <input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={form.contactEmail}
                        onChange={handleChange}
                        placeholder="your@email.com — so we can notify you when approved"
                        className="input-base"
                      />
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Ad'}
                  </button>
                </form>
              </div>

              {/* Info */}
              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">What happens next?</h3>
                <ol className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-500 flex-shrink-0">1.</span>
                    Our team reviews your submission for quality and accuracy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-500 flex-shrink-0">2.</span>
                    We verify the video URL and ad information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-500 flex-shrink-0">3.</span>
                    Approved ads are added to the TivoAds database
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-500 flex-shrink-0">4.</span>
                    You&apos;ll be credited if you provided a contact email
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
