export default function CampusProximity() {
  const distances = [
    {
      title: "Walking Distance (< 500m)",
      desc: "Roll out of bed and walk directly to your lectures. Ultimate convenience.",
      time: "2-5 mins",
      icon: "🚶",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      tag: "bg-emerald-500",
      url: "/listings?location=Near%20SLIIT&distance=0.5"
    },
    {
      title: "Short Commute (1 - 2km)",
      desc: "A quick tuk or bus ride away. The perfect balance of price and proximity.",
      time: "10 mins",
      icon: "🚌",
      color: "bg-blue-50 text-blue-600 border-blue-100",
      tag: "bg-blue-500",
      url: "/listings?location=Near%20SLIIT&distance=2"
    },
    {
      title: "Quiet Suburbs (3km+)",
      desc: "Peaceful environments for deep study. Better facilities for lower prices.",
      time: "20 mins",
      icon: "🚲",
      color: "bg-purple-50 text-purple-600 border-purple-100",
      tag: "bg-purple-500",
      url: "/listings?location=Near%20SLIIT&distance=10"
    }
  ];

  return (
    <section className="py-8 md:py-16 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Distance to SLIIT</h2>
            <p className="text-lg text-slate-500">
              Location is everything. Whether you want to wake up 5 minutes before your lecture or prefer the quiet of the outer suburbs, find the distance that fits your lifestyle.
            </p>
          </div>
          <a href="/listings?location=Near%20SLIIT" className="text-brand font-bold flex items-center gap-2 hover:bg-rose-50 px-6 py-3 rounded-full transition-colors whitespace-nowrap border border-rose-100">
            View More Listings
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {distances.map((item, idx) => (
            <a href={item.url} key={idx} className={`block p-8 rounded-[2rem] border bg-white shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300 cursor-pointer relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 text-8xl opacity-5">{item.icon}</div>
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${item.color}`}>
                {item.icon}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
              </div>
              
              <p className="text-slate-500 mb-8 leading-relaxed">
                {item.desc}
              </p>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg. Travel Time</span>
                <span className={`px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm ${item.tag}`}>
                  {item.time}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
