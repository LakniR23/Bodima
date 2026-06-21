import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function FeedbackSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const data: any[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            name: d.name,
            role: d.role || "Verified User",
            text: d.content || d.message,
            rating: d.rating || 5
          });
        });
        if (data.length > 0) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-8 lg:py-16 relative overflow-hidden bg-gradient-to-br from-slate-50 to-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-200 text-brand font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            Community Love
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Hear From Our <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand via-brand/80 to-brand/90">Students</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Discover how Bodima is helping students easily find their perfect stay.
          </p>
        </div>

        {/* Featured Review Slider */}
        <div className="relative w-full min-h-[240px] flex items-center justify-center">
          {reviews.map((t, idx) => (
            <div
              key={t.id}
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center ${idx === currentIndex ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' : 'opacity-0 translate-y-8 pointer-events-none scale-95'}`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < t.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <svg className="w-10 h-10 text-brand/10 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
              </svg>

              <p className="text-xl md:text-2xl text-slate-800 font-bold leading-relaxed max-w-3xl mb-8 tracking-tight">
                "{t.text}"
              </p>

              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">{t.name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Dots */}
        {reviews.length > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${i === currentIndex ? 'w-10 bg-brand shadow-md shadow-brand/20' : 'w-2.5 bg-slate-300 hover:bg-slate-400 hover:scale-125'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* CTA to About */}
        <div className="mt-14 text-center">
          <a href="/about" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-brand transition-colors shadow-lg hover:shadow-xl hover:shadow-brand/30 group">
            Share Your Experience
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>

      </div>
    </section>
  );
}
