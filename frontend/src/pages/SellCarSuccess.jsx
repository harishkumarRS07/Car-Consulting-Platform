import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Home, ClipboardList, Clock, ShieldCheck } from 'lucide-react';

export default function SellCarSuccess() {
  const location = useLocation();
  
  // Retrieve request data from router state
  const { requestId, brand, model, expectedPrice } = location.state || {
    requestId: 'SCR-1001',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    expectedPrice: 4500000
  };

  useEffect(() => {
    document.title = 'Request Submitted | Vishnu Car Consulting';
    
    // Redirect if direct page hit with no state
    if (!location.state) {
      console.warn('Direct access to success page with no state. Using fallback mock data.');
    }
  }, [location]);

  // Stripped dealer number (+91 80720 28295)
  const dealerPhone = '918072028295'; 

  // Format expected price for presentation
  const formattedPrice = Number(expectedPrice).toLocaleString('en-IN');

  // WhatsApp Message template
  const rawMessage = `Hi CarConsult Team,

I have successfully submitted my Sell Car request.

Request ID:
${requestId}

Vehicle:
${brand} ${model}

Expected Price:
₹${formattedPrice}

Please review my request.

Thank you.`;

  const whatsappUrl = `https://wa.me/${dealerPhone}?text=${encodeURIComponent(rawMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7ff] via-white to-[#f5f0ff] flex items-center justify-center p-6 py-28 font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white border border-purple-100/85 rounded-[32px] max-w-[620px] w-full shadow-[0_20px_50px_rgba(109,40,217,0.06)] overflow-hidden"
      >
        {/* Animated Banner Header */}
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-44 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl" />
          
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white p-3.5 rounded-full shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={54} className="text-emerald-500" />
          </motion.div>
        </div>

        {/* Form Body */}
        <div className="p-8 md:p-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[28px] md:text-[32px] font-black text-gray-900 leading-tight mb-2"
          >
            Request Submitted! 🎉
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-gray-500 font-semibold mb-8 text-sm md:text-base"
          >
            We've received your vehicle details. Here is your reference summary:
          </motion.p>

          {/* Reference Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50/20 border border-purple-100/60 rounded-3xl p-6 mb-8 text-left space-y-4 shadow-inner"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-purple-50">
              <span className="text-gray-500 font-bold text-sm tracking-wider uppercase">Request ID</span>
              <span className="font-mono text-xl font-black text-purple-650 bg-purple-50 px-4 py-1.5 rounded-2xl shadow-sm">{requestId}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Vehicle</p>
                <p className="font-bold text-gray-800 text-base">{brand} {model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Expected Price</p>
                <p className="font-bold text-gray-850 text-base">₹{formattedPrice}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-purple-50">
              <Clock className="text-purple-650 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Estimated Review Time</p>
                <p className="font-bold text-gray-800 text-sm">Within 24 Hours</p>
              </div>
            </div>
          </motion.div>

          {/* Next Steps Container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-left mb-10"
          >
            <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" /> Next Steps
            </h4>
            <ul className="space-y-3 text-sm text-gray-650 font-semibold leading-relaxed">
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Click the <strong>Contact Dealer on WhatsApp</strong> button below to open a pre-filled chat in a new tab.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Send the pre-filled message inside your WhatsApp application to directly alert our consulting team.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Our valuation agent will review your request details and chat with you to schedule an inspection.</span>
              </li>
            </ul>
          </motion.div>

          {/* Actions Block */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-[#25D366] hover:bg-[#20ba56] hover:shadow-lg hover:shadow-green-500/10 text-white font-bold rounded-2xl transition duration-300 flex items-center justify-center gap-3 shadow-md transform hover:-translate-y-0.5 text-base border border-green-400"
            >
              <MessageCircle size={22} className="fill-current" />
              Contact Dealer on WhatsApp
            </a>

            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/profile?tab=requirements"
                className="h-12 border-2 border-purple-100 text-purple-650 bg-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 hover:border-purple-200 text-sm hover:shadow-[0_8px_20px_rgba(109,40,217,0.04)]"
              >
                <ClipboardList size={18} />
                View My Request
              </Link>
              <Link 
                to="/"
                className="h-12 border-2 border-gray-150 text-gray-700 hover:bg-gray-50 bg-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Home size={18} />
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
