export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-14 flex flex-col items-center text-center">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-1 group mb-5"
        >
          <img
            src="/logo/logo.png"
            alt="Bodima Logo"
            className="h-16 w-16 object-contain invert brightness-0 group-hover:scale-105 transition-transform duration-300"
          />

          <span className="text-2xl font-bold text-white ">
            Bodima
          </span>
        </a>

        {/* Description */}
        <p className="max-w-2xl text-slate-400 leading-relaxed mb-8">
          Your trusted platform for finding boarding houses, annexes,
          and student accommodation. Discover listings and
          connect with property owners easily.
        </p>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <a href="/" className="text-slate-300 hover:text-brand transition-colors">
            Home
          </a>

          <a href="/listings" className="text-slate-300 hover:text-brand transition-colors">
            Listings
          </a>

          <a href="/about" className="text-slate-300 hover:text-brand transition-colors">
            About
          </a>

        </div>

        {/* Divider */}
        <div className="w-full border-t border-slate-800 mb-6"></div>

        {/* Bottom */}
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Bodima. All rights reserved.
        </p>

      </div>
    </footer>
  );
}