import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/home/Hero';
import CategoryBento from '../components/home/CategoryBento';
import CampusProximity from '../components/home/CampusProximity';
import AmenitiesShowcase from '../components/home/AmenitiesShowcase';
import PricingTiers from '../components/home/PricingTiers';
import FeedbackSection from '../components/home/FeedbackSection';
import RecentListings from '../components/home/RecentListings';
import CTAAbout from '../components/home/CTAAbout';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-white to-brand/10 font-sans text-slate-800">
      <Navbar />
      
      {/* 1. Hero */}
      <Hero />

      {/* 2. Recently Added Properties carousel */}
      <RecentListings />

      {/* 3. Property type categories */}
      <CategoryBento />

       
      {/* 4. Campus proximity section */}
      <CampusProximity />

      <CTAAbout />

      {/* 7. Amenities showcase */}
      <AmenitiesShowcase />

      {/* 8. Pricing tiers */}
      <PricingTiers />

      {/* 9. Community testimonials slider */}
      <FeedbackSection />

      {/* 10. CTA: Leave a review — naturally leads into testimonials below */}
      

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      <Footer />
    </div>
  );
}
