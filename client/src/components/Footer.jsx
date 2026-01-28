import React, { useEffect, useState } from 'react';
import { assets } from "../assets/assets";
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from "../context/AppContext";
import { 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Phone, 
  ArrowRight,
  Instagram,
  Youtube
} from 'lucide-react';

const paymentIcons = [
  "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/fd/Maestro_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b7/Discover_Card_logo.svg"
];

const companyLinks = [
  { text: "About", url: "/about" },
  { text: "Blog", url: "/blog" },
  { text: "Shipping & Returns", url: "/shipping" },
  { text: "Payment", url: "/payment" },
  { text: "Warranty", url: "/warranty" },
  { text: "Location", url: "/location" },
  { text: "Contacts", url: "/contact" }
];

const Footer = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [collectionGroups, setCollectionGroups] = useState([]);

  // Fetch Category Groups for the Footer Menu
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get('/api/category-group/list');
        if (data.success) {
          const sorted = data.groups.sort((a, b) => (a.order || 999) - (b.order || 999));
          setCollectionGroups(sorted);
        }
      } catch (error) {
        console.error("Failed to load footer collections");
      }
    };
    fetchGroups();
  }, [axios]);

  const handleGroupClick = (groupName) => {
    navigate(`/collections/${encodeURIComponent(groupName)}`);
    window.scrollTo(0, 0); 
  };

  return (
    <footer className="mt-20 font-sans">
      {/* --- Top Features Section --- */}
      <div className="border-t border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 md:px-0">
          
          <div className="grid grid-cols-1 md:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="relative flex gap-5 items-start py-10 md:px-8 first:pl-0 
              after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-48 after:h-[1px] after:bg-gray-200 md:after:hidden
              before:content-[''] before:hidden md:before:block before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-12 before:w-[1px] before:bg-gray-200"
            >
              <div className="w-16 h-16 bg-[#F0F4F8] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#1E2A5E]">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E2A5E] text-xl mb-2">Free Shipping</h4>
                <p className="text-[17px] text-[#1E2A5E]/80 leading-relaxed font-medium">
                  Free standard shipping on orders over $50. No hidden fees.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative flex gap-5 items-start py-10 md:px-8
              after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-48 after:h-[1px] after:bg-gray-200 md:after:hidden
              before:content-[''] before:hidden md:before:block before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-12 before:w-[1px] before:bg-gray-200"
            >
              <div className="w-16 h-16 bg-[#F0F4F8] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#1E2A5E]">
                <RotateCcw className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E2A5E] text-xl mb-2">30-day Returns</h4>
                <p className="text-[17px] text-[#1E2A5E]/80 leading-relaxed font-medium">
                  30 days to return your item, no questions asked.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-5 items-start py-10 md:px-8 last:pr-0">
              <div className="w-16 h-16 bg-[#F0F4F8] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#1E2A5E]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E2A5E] text-xl mb-2">Secure Payment</h4>
                <p className="text-[17px] text-[#1E2A5E]/80 leading-relaxed font-medium">
                  Your security is our priority. All payments are encrypted.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Main Footer Content --- */}
      <div className="bg-[#F0F4F8] pt-16 pb-8">
        <div className="container mx-auto px-6 md:px-0">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-gray-200 pb-12">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-4 space-y-6">
              <img className="w-36" src={assets.logo} alt="Logo" />
              
              <div className="flex items-center gap-3 text-[#1E2A5E]">
                <Phone className="w-6 h-6" />
                <span className="text-2xl font-bold">(555) 555-1000</span>
              </div>

              <div className="space-y-1 text-[17px] text-[#1E2A5E] font-medium">
                <p>Open daily from 9:00 AM – 7:00 PM</p>
                <p>123 Madison Avenue, Suite 456,</p>
                <p>New York, NY 10010, USA</p>
              </div>

              <a href="mailto:support@yourstore.com" className="text-[#1E2A5E] hover:text-[#008779] font-bold text-[17px] block transition-colors">
                support@yourstore.com
              </a>
            </div>

            {/* Column 2 & 3: Dynamic Links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              
              {/* Dynamic Collections Menu */}
              <div>
                <h3 className="font-bold text-[#1E2A5E] text-lg mb-6">Collections</h3>
                <ul className="space-y-3">
                  {collectionGroups.length > 0 ? (
                    collectionGroups.map((group) => (
                      <li key={group._id}>
                        <button 
                          onClick={() => handleGroupClick(group.name)}
                          className="text-[17px] font-medium text-[#1E2A5E] hover:text-[#008779] transition-colors text-left"
                        >
                          {group.name}
                        </button>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link to="/products" className="text-[17px] font-medium text-[#1E2A5E] hover:text-[#008779]">All Products</Link></li>
                      <li><Link to="/new-arrivals" className="text-[17px] font-medium text-[#1E2A5E] hover:text-[#008779]">New Arrivals</Link></li>
                    </>
                  )}
                </ul>
              </div>

              {/* Company Menu */}
              <div>
                <h3 className="font-bold text-[#1E2A5E] text-lg mb-6">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link, i) => (
                    <li key={i}>
                      <Link to={link.url} className="text-[17px] font-medium text-[#1E2A5E] hover:text-[#008779] transition-colors">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Column 4: Newsletter */}
            <div className="lg:col-span-4 space-y-5">
              <h3 className="font-bold text-[#1E2A5E] text-xl">Join for Exclusive Toy Offers!</h3>
              
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-[17px] text-[#1E2A5E] placeholder-[#1E2A5E]/50 focus:outline-none focus:border-[#1E2A5E] transition-colors pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2A5E]/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E2A5E] hover:text-[#008779] p-2 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <a href="#" className="w-10 h-10 bg-[#1E2A5E] rounded-full flex items-center justify-center text-white hover:bg-[#008779] transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#1E2A5E] rounded-full flex items-center justify-center text-white hover:bg-[#008779] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1E2A5E] rounded-full flex items-center justify-center text-white hover:bg-[#008779] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* --- Bottom Bar --- */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px] text-[#1E2A5E] font-medium">
            
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
              <span>© {new Date().getFullYear()} Cleverso. All Rights Reserved</span>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/refund" className="hover:text-[#008779] transition-colors">Refund policy</Link>
              <Link to="/privacy" className="hover:text-[#008779] transition-colors">Privacy policy</Link>
              <Link to="/terms" className="hover:text-[#008779] transition-colors">Terms of service</Link>
              <Link to="/shipping-policy" className="hover:text-[#008779] transition-colors">Shipping policy</Link>
              <Link to="/contact" className="hover:text-[#008779] transition-colors">Contact information</Link>
              <Link to="/legal" className="hover:text-[#008779] transition-colors">Legal notice</Link>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;