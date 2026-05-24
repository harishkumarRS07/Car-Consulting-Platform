import { motion } from 'framer-motion';
import { useAuthStore } from '../context/store';
import { User, Mail, Shield, Calendar, Settings, Bell, CreditCard } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'HA';
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const sections = [
    { icon: <User size={20} />, label: 'Personal Information', description: 'Update your name and personal details' },
    { icon: <Shield size={20} />, label: 'Login & Security', description: 'Manage your password and security settings' },
    { icon: <Bell size={20} />, label: 'Notifications', description: 'Choose what updates you want to receive' },
    { icon: <CreditCard size={20} />, label: 'Payments', description: 'Manage your payment methods and billing' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-purple-500/5 border border-purple-100 mb-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-8 ring-purple-50">
            {initials}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
              {displayName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-medium">
              <span className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full text-sm border border-gray-100">
                <Mail size={16} className="text-purple-500" />
                {user?.email}
              </span>
              <span className="flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full text-sm border border-purple-100 text-purple-700">
                <Shield size={16} />
                {user?.role === 'admin' ? 'Elite Admin' : 'Premium Member'}
              </span>
              <span className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full text-sm border border-gray-100">
                <Calendar size={16} className="text-purple-500" />
                Joined March 2024
              </span>
            </div>
          </div>

          <button className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-200">
            Edit Profile
          </button>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white p-6 rounded-[24px] border border-gray-100 hover:border-purple-200 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                {section.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{section.label}</h3>
              <p className="text-sm text-gray-500 font-medium">{section.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
