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
  Youtube,
  Plus,
  Minus,
  Mail,
  MapPin,
  Music2
} from 'lucide-react';

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
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);

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

  const toggleMobileMenu = (menuName) => {
    // Only apply toggle logic if on mobile/tablet (less than 1024px)
    if (window.innerWidth < 1024) {
      setActiveMobileMenu(activeMobileMenu === menuName ? null : menuName);
    }
  };

  return (
    <footer className=" font-sans">
      {/* --- Top Features Section --- */}
      <div className=" bg-white">
       <div className="px-4 md:px-4 lg:px-4 xl:px-12 2xl:px-40">
          <div className="grid grid-cols-1 md:grid-cols-3 ">
            {[
              { icon: <Truck />, title: "Free Shipping", desc: "Enjoy free standard shipping when you spend $50 or more. No hidden fees — just more value with every order." },
              { icon: <RotateCcw />, title: "30-day Returns", desc: "Changed your mind? No problem. You have 30 days to return your item, no questions asked." },
              { icon: <ShieldCheck />, title: "Secure Payment", desc: "Your security is our priority. All payments are encrypted and processed securely — we never store your payment details." }
            ].map((f, i) => (
              <div key={i} className="relative flex gap-5 items-start py-10 md:px-8 first:pl-0 last:pr-0 
              md:after:content-[''] md:after:absolute md:after:right-0 md:after:top-1/2 md:after:-translate-y-1/2 
            md:after:h-20 md:after:w-[1px] md:after:bg-[#16255C]/30 last:md:after:hidden">
                <div className="w-16 h-16 bg-[#ECF2FE] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#16255C]">
                  {React.cloneElement(f.icon, { size: 32 })}
                </div>
                <div>
                  <h4 className="font-bold text-[#16255C] text-xl mb-2">{f.title}</h4>
                  <p className="text-[17px] text-[#16255C]/80 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Footer Content --- */}
      <div className="bg-[#ECF2FE] lg:pt-16 pb-8">
       <div className="px-4 md:px-4 lg:px-4 xl:px-12 2xl:px-40">

          {/* Mobile: gap-0 to prevent overlap; Desktop: Equal 4 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8 border-b border-[#16255C]/20 pb-12">

            {/* Column 1: Contact Info */}
            <div className="border-b lg:border-none border-[#16255C]/20">
              <div
                className="flex lg:hidden justify-between items-center cursor-pointer h-[53px]"
                onClick={() => toggleMobileMenu('contact')}
              >
                <h3 className="font-bold text-[#16255C] text-lg  tracking-tight">Contact Information</h3>
                <span className="text-[#16255C]">
                  {activeMobileMenu === 'contact' ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
              </div>

              <div className="hidden lg:block mb-6">
                <img className="h-10 w-auto object-contain" src={assets.logo} alt="Logo" />
              </div>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden lg:max-h-none ${activeMobileMenu === 'contact' ? 'max-h-[500px] opacity-100 pb-8 mt-4' : 'max-h-0 opacity-0 lg:opacity-100'}`}>
                <img className="lg:hidden h-8 w-auto object-contain mb-6" src={assets.logo} alt="Logo" />
                <div className="flex items-center gap-3 text-[#16255C] mb-4">
                  <Phone className="w-5 h-5 text-[#16255C]" />
                  <span className="text-2xl font-bold  md:leading-none">(555) 555-1000</span>
                </div>
                <div className="space-y-3 text-[17px] text-[#16255C] font-medium">
                  <div className="flex gap-3"><MapPin className="w-5 h-5 flex-shrink-0" /><p>123 Madison Ave, Suite 456, NY</p></div>
                  <div className="flex gap-3"><Mail className="w-5 h-5 flex-shrink-0" /><p>support@yourstore.com</p></div>
                </div>
              </div>
            </div>

            {/* Column 2: Collections */}
            <div className="border-b lg:border-none border-[#16255C]/20">
              <div
                className="flex lg:hidden justify-between items-center cursor-pointer h-[53px]"
                onClick={() => toggleMobileMenu('collections')}
              >
                <h3 className="font-bold text-[#16255C] text-lg  tracking-tight">Collections</h3>
                <span className="text-[#16255C]">
                  {activeMobileMenu === 'collections' ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
              </div>

              <h3 className="hidden lg:block font-bold text-[#16255C] text-xl mb-6">Collections</h3>

              <ul className={`space-y-3 transition-all duration-300 ease-in-out overflow-hidden lg:max-h-none ${activeMobileMenu === 'collections' ? 'max-h-[500px] opacity-100 pb-8 mt-4' : 'max-h-0 opacity-0 lg:opacity-100'}`}>
                {collectionGroups.map((g) => (
                  <li key={g._id}>
                    <button onClick={() => navigate(`/collections/${encodeURIComponent(g.name)}`)} className="text-[16px]  text-[#16255C] hover:text-[#008779] text-left">
                      {g.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="border-b lg:border-none border-[#16255C]/20">
              <div
                className="flex lg:hidden justify-between items-center cursor-pointer h-[53px]"
                onClick={() => toggleMobileMenu('company')}
              >
                <h3 className="font-bold text-[#16255C] text-lg  tracking-tight">Company</h3>
                <span className="text-[#16255C]">
                  {activeMobileMenu === 'company' ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
              </div>

              <h3 className="hidden lg:block font-bold text-[#16255C] text-xl mb-6 ">Company</h3>

              <ul className={`space-y-3 transition-all duration-300 ease-in-out overflow-hidden lg:max-h-none ${activeMobileMenu === 'company' ? 'max-h-[500px] opacity-100 pb-8 mt-4' : 'max-h-0 opacity-0 lg:opacity-100'}`}>
                {companyLinks.map((l, i) => (
                  <li key={i}>
                    <Link to={l.url} className="text-[16px]  text-[#16255C] hover:text-[#008779]">
                      {l.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="mt-10 lg:mt-0">
              <h3 className="font-bold text-[#16255C] text-2xl   md:leading-[1.4] tracking-wide  mb-6">
                Join for Exclusive Toy Offers!
              </h3>
              <div className="space-y-6">
                <div className="relative w-full lg:max-w-[330px] h-[50px]">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full h-full bg-white  rounded-lg px-4 text-[17px] text-[#16255C] pl-12 focus:outline-none placeholder-[#16255C] placeholder-opacity-100"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#16255C]" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16255C] hover:text-[#008779]">
                    <ArrowRight size={24} />
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  {/* Instagram */}
                  <a
                    href="#"
                    className="w-[30px] h-[30px] bg-[#16255C] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all"
                  >
                    <Instagram size={18} />
                  </a>

                  {/* Youtube */}
                  <a
                    href="#"
                    className="w-[30px] h-[30px] bg-[#16255C] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all"
                  >
                    <Youtube size={18} />
                  </a>

                  {/* TikTok (Music2 is the standard Lucide icon for TikTok) */}
                  <a
                    href="#"
                    className="w-[30px] h-[30px] bg-[#16255C] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all"
                  >
                    <Music2 size={18} />
                  </a>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px] text-[#16255C] font-medium">
            <span>© {new Date().getFullYear()} Cleverso. All Rights Reserved</span>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/refund" className="hover:text-[#008779]">Refund policy</Link>
              <Link to="/privacy" className="hover:text-[#008779]">Privacy policy</Link>
              <Link to="/terms" className="hover:text-[#008779]">Terms of service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;