import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Youtube, Facebook, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const vcLogo = '/logos/vc-logo.jpeg';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const quickLinks = [
    { label: 'Browse Cars', href: '/cars' },
    { label: 'Sell Your Car', href: '/sell' },
    { label: 'My Wishlist', href: '/wishlist' },
  ];

  return (
    <footer className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white relative overflow-hidden border-t border-white/10 pb-16 md:pb-6">
      {/* Visual Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-8 relative z-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">

          {/* Brand Column */}
          <div className="flex flex-col items-start space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src={vcLogo}
                  alt="VC Logo"
                  className="w-9 h-9 rounded-full group-hover:scale-105 transition-transform shadow-md"
                />
                <div className="absolute inset-0 rounded-full border border-white/20" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block tracking-tight">Mech Doctor</span>
                <span className="text-[10px] text-purple-200 font-bold tracking-widest uppercase">Automation</span>
              </div>
            </Link>
            <p className="text-purple-100/80 text-xs sm:text-sm leading-relaxed max-w-xs font-light">
              Your trusted partner for buying and selling quality cars. Experience transparency and excellence in every transaction.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/mech_doctor_automation_karur?igsh=MXZ0Y3ptMHpvdWNvMQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.youtube.com/@MechDoctorAutomationKarur"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://www.facebook.com/share/1DWZHGwSon/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links Column (Responsive: Grid on Desktop/Tablet, Accordion on Mobile) */}
          <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
            {/* Mobile Header (Button) */}
            <button
              onClick={() => toggleSection('quickLinks')}
              className="flex md:hidden w-full items-center justify-between py-2 text-white font-bold text-sm uppercase tracking-[0.15em] select-none"
            >
              <span>Quick Links</span>
              <motion.div
                animate={{ rotate: openSection === 'quickLinks' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-purple-200" />
              </motion.div>
            </button>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-white font-black mb-5 text-xs uppercase tracking-[0.2em] opacity-90">
              Quick Links
            </h3>

            {/* Content list */}
            <div className="md:block">
              <AnimatePresence initial={false}>
                {(openSection === 'quickLinks' || window.innerWidth >= 768) && (
                  <motion.ul
                    initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 mt-3 md:mt-0 overflow-hidden"
                  >
                    {quickLinks.map((link, i) => (
                      <li key={i}>
                        <Link
                          to={link.href}
                          className="text-purple-100/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-3 group py-1.5 md:py-0"
                        >
                          <div className="w-1 h-1 rounded-full bg-white/40 group-hover:w-3 group-hover:bg-white transition-all duration-300" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Contact Information Column (Responsive: Grid on Desktop/Tablet, Accordion on Mobile) */}
          <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
            {/* Mobile Header (Button) */}
            <button
              onClick={() => toggleSection('contactInfo')}
              className="flex md:hidden w-full items-center justify-between py-2 text-white font-bold text-sm uppercase tracking-[0.15em] select-none"
            >
              <span>Contact Us</span>
              <motion.div
                animate={{ rotate: openSection === 'contactInfo' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-purple-200" />
              </motion.div>
            </button>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-white font-black mb-5 text-xs uppercase tracking-[0.2em] opacity-90">
              Contact Us
            </h3>

            {/* Content list */}
            <div className="md:block">
              <AnimatePresence initial={false}>
                {(openSection === 'contactInfo' || window.innerWidth >= 768) && (
                  <motion.div
                    initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 mt-3 md:mt-0 overflow-hidden"
                  >
                    <a
                      href="tel:+918072028295"
                      className="flex items-center gap-3 text-purple-100/70 hover:text-white transition-colors text-sm group py-1"
                    >
                      <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors backdrop-blur-md flex items-center justify-center">
                        <Phone size={14} className="text-white" />
                      </div>
                      <span className="font-semibold">+91 8072028295</span>
                    </a>

                    <a
                      href="mailto:mechdoctorautomation22@gmail.com"
                      className="flex items-center gap-3 text-purple-100/70 hover:text-white transition-colors text-sm group py-1"
                    >
                      <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors backdrop-blur-md flex items-center justify-center">
                        <Mail size={14} className="text-white" />
                      </div>
                      <span className="font-semibold truncate max-w-[200px] sm:max-w-none">
                        mechdoctorautomation22@gmail.com
                      </span>
                    </a>

                    <div className="flex items-start gap-3 text-purple-100/70 text-sm py-1">
                      <div className="p-2 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center mt-0.5">
                        <MapPin size={14} className="text-white" />
                      </div>
                      <span className="font-semibold">India</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-px bg-white/10 my-6" />

        {/* Bottom Bar Details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-purple-200/50 text-xs font-medium">
            © {currentYear} Mech Doctor Automation. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <p className="text-white/40 text-[9px] uppercase tracking-[0.25em] font-black">
              Quality • Transparency • Excellence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}