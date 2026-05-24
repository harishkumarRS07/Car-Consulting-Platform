import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const vcLogo = '/logos/vc-logo.jpeg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Browse Cars', href: '/cars' },
    { label: 'Sell Your Car', href: '/sell' },
    { label: 'My Wishlist', href: '/wishlist' },
  ];

  return (
    <footer className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Enhanced Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2.5 group mb-6">
              <div className="relative">
                <img src={vcLogo} alt="VC Logo" className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-black/20" />
                <div className="absolute inset-0 rounded-lg border border-white/20 group-hover:border-white/50 transition-colors" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block tracking-tight">Vishnu Car</span>
                <span className="text-xs text-purple-200 font-medium tracking-widest uppercase">Consulting</span>
              </div>
            </Link>
            <p className="text-purple-100/80 text-sm leading-relaxed max-w-xs">
              Your trusted partner for buying and selling quality cars. Experience transparency and excellence in every transaction.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.href}
                    className="text-purple-100/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-3 group"
                  >
                    <div className="w-1 h-1 rounded-full bg-purple-400 group-hover:w-3 group-hover:bg-white transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Contact Us
            </h3>
            <div className="space-y-4">
              <a href="tel:+919566728834" className="flex items-center gap-4 text-purple-100/70 hover:text-white transition-colors text-sm group">
                <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors border border-white/5">
                  <Phone size={16} className="text-white" />
                </div>
                <span className="font-medium">+91 9566728834</span>
              </a>
              <a href="mailto:contact@vishnucar.com" className="flex items-center gap-4 text-purple-100/70 hover:text-white transition-colors text-sm group">
                <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors border border-white/5">
                  <Mail size={16} className="text-white" />
                </div>
                <span className="font-medium">contact@vishnucar.com</span>
              </a>
              <div className="flex items-start gap-4 text-purple-100/70 text-sm group">
                <div className="p-2.5 rounded-xl bg-white/10 transition-colors border border-white/5">
                  <MapPin size={16} className="text-white" />
                </div>
                <span className="mt-2 font-medium">India</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-purple-200/50 text-xs font-medium">
            © {currentYear} Vishnu Car Consulting. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <p className="text-purple-200/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Quality • Transparency • Excellence
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
