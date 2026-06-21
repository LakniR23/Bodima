import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function About() {
  const [feedback, setFeedback] = useState({ name: '', role: '', message: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'feedbacks'), {
        name: feedback.name,
        role: feedback.role,
        message: feedback.message,
        rating: feedback.rating,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setTimeout(() => {
        setFeedback({ name: '', role: '', message: '', rating: 5 });
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-white to-brand/10 font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side - The Story */}
        <div className="flex-1 lg:sticky lg:top-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-200 text-brand font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            The Story Behind Bodima
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
            Built by a student, <br/>
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-brand via-brand/80 to-brand/90">for students.</span>
          </h1>
          
          <div className="prose prose-lg prose-slate text-slate-600 mb-8">
            <p className="leading-relaxed mb-6">
              Hi, I'm the creator of Bodima. Like many students, I know firsthand how stressful and time-consuming finding a good boarding place can be - and that frustration is exactly why I built this.
            </p>
            <p className="leading-relaxed mb-6">
              I built Bodima as a <strong>personal project</strong> - not a corporate business or a massive community effort. My only goal is to provide a clean, modern, and free platform to connect students with great boarding places effortlessly.
            </p>
            <p className="leading-relaxed font-medium text-slate-900 border-l-4 border-brand pl-5 bg-rose-50/50 p-4 rounded-r-xl mb-6">
              No hidden fees, no messy UI. Just a simple tool built out of a real need, to help you focus on your studies instead of your housing.
            </p>

            {/* Important Notice - Listing Verification */}
            <div className="not-prose flex gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 mb-1.5 uppercase tracking-wide">A Quick but Important Note</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Listings on Bodima are contributed by a growing community of fellow students and contacts, not by a dedicated verification team. Details like availability and pricing are not independently checked, so always <strong>call the property owner directly</strong> to confirm before visiting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Feedback Form */}
        <div className="w-full lg:w-[500px] shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(146,72,122,0.08)] p-8 md:p-10 relative overflow-hidden">
            {/* Background Decorative Blur */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2 relative z-10">Leave Feedback</h3>
            <p className="text-slate-500 mb-8 relative z-10">Found a place? Love the UI? Or found a bug? Let me know to help improve the platform!</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-fade-in relative z-10">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-emerald-900 mb-2">Thank you!</h4>
                <p className="text-emerald-700">Your feedback has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Your Name</label>
                  <input 
                    type="text" required
                    value={feedback.name} onChange={(e) => setFeedback({...feedback, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all shadow-sm"
                    placeholder="e.g. Harini Munasinghe"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Who are you?</label>
                  <input 
                    type="text" required
                    value={feedback.role} onChange={(e) => setFeedback({...feedback, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all shadow-sm"
                    placeholder="e.g. SLIIT Student"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Rating</label>
                  <div className="flex gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedback({...feedback, rating: star})}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg className={`w-8 h-8 ${feedback.rating >= star ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Message</label>
                  <textarea 
                    required rows={4}
                    value={feedback.message} onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all shadow-sm resize-none"
                    placeholder="Tell me how the platform helped you..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand text-white px-8 py-4 rounded-xl font-bold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      Submit Feedback
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}