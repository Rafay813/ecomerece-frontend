import { useState } from "react";
import { Link } from "react-router-dom";

const regions = [
  { name: "Arabic Emirates", domain: "shopname.ae", flag: "🇦🇪" },
  { name: "Australia", domain: "shopname.ae", flag: "🇦🇺" },
  { name: "United States", domain: "shopname.ae", flag: "🇺🇸" },
  { name: "Russia", domain: "shopname.ru", flag: "🇷🇺" },
  { name: "Italy", domain: "shopname.it", flag: "🇮🇹" },
  { name: "Denmark", domain: "denmark.com.dk", flag: "🇩🇰" },
  { name: "France", domain: "shopname.com.fr", flag: "🇫🇷" },
  { name: "Arabic Emirates", domain: "shopname.ae", flag: "🇦🇪" },
  { name: "China", domain: "shopname.ae", flag: "🇨🇳" },
  { name: "Great Britain", domain: "shopname.co.uk", flag: "🇬🇧" },
];

const footerLinks = {
  About: ["About Us", "Find store", "Categories", "Blogs"],
  Partnership: ["About Us", "Find store", "Categories", "Blogs"],
  Information: ["Help Center", "Money Refund", "Shipping", "Contact us"],
  "For users": ["Login", "Register", "Settings", "My Orders"],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer>
      {/* Suppliers by region */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="font-semibold text-gray-800 mb-4">Suppliers by region</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {regions.map((r, i) => (
              <div key={i} className="flex items-center gap-2 cursor-pointer hover:text-blue-600 group">
                <span className="text-xl">{r.flag}</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.domain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gray-100 py-10">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Subscribe on our newsletter</h3>
          <p className="text-sm text-gray-500 mb-5">Get daily news on upcoming offers from many suppliers all over the world</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-white py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-blue-600">Brand</span>
              </Link>
              <p className="text-xs text-gray-500 mb-4">Best information about the company goes here but now lorem ipsum is</p>
              <div className="flex gap-3">
                {["facebook", "twitter", "linkedin", "instagram", "youtube"].map((s) => (
                  <a key={s} href="#" className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-gray-600">
                    <span className="text-xs capitalize">{s[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">{heading}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <Link to="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Get app */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Get app</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-xs font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">GET IT ON</div>
                    <div className="text-xs font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-50 border-t border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-500">
          <span>© 2023 Ecommerce.</span>
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
            <span>🇺🇸</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}