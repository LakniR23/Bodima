export default function PricingTiers() {
  const tiers = [
    {
      title: "Budget Friendly",
      price: "Under Rs. 15,000",
      desc: "Perfect for students. Basic amenities, shared spaces, and great community vibes.",
      color: "bg-slate-50 border-slate-200",
      btnClass: "bg-slate-900 text-white hover:bg-slate-800",
      url: "/listings?maxPrice=15000"
    },
    {
      title: "Standard Comfort",
      price: "Rs. 15k - 25k",
      desc: "The sweet spot. Better privacy, more facilities, and very comfortable living.",
      color: "bg-white border-brand/20 shadow-xl shadow-brand/5 relative",
      badge: "Most Popular",
      btnClass: "bg-brand text-white hover:bg-brand/90",
      url: "/listings?minPrice=15000&maxPrice=25000"
    },
    {
      title: "Premium Living",
      price: "Above Rs. 25,000",
      desc: "Top-tier annexes and private studios. Complete independence and luxury.",
      color: "bg-slate-900 border-slate-800 text-white",
      btnClass: "bg-white text-slate-900 hover:bg-slate-100",
      textClass: "text-slate-400",
      url: "/listings?minPrice=25000"
    }
  ];

  return (
    <section className="py-8 md:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">Find Your Price Point</h2>
          <p className="text-lg text-slate-500">
            From affordable shared rooms to premium private annexes, explore options that match your budget without compromising on safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, idx) => (
            <div key={idx} className={`rounded-[2rem] p-8 border ${tier.color} transition-transform duration-300 hover:-translate-y-2`}>
              {tier.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  {tier.badge}
                </span>
              )}
              
              <h3 className={`text-xl font-bold mb-2 ${tier.textClass ? 'text-white' : 'text-slate-900'}`}>{tier.title}</h3>
              <div className={`text-3xl font-extrabold mb-4 ${tier.textClass ? 'text-white' : 'text-brand'}`}>
                {tier.price} <span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
              <p className={`mb-8 ${tier.textClass || 'text-slate-500'} h-16`}>
                {tier.desc}
              </p>
              
              <a href={tier.url} className={`block text-center w-full py-4 rounded-xl font-bold transition-colors shadow-sm ${tier.btnClass}`}>
                Browse Listings
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
