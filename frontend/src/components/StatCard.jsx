import { motion } from 'framer-motion';

export default function StatCard({ label, value, change, icon: Icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-purple-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-500 font-semibold mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-purple-100 rounded-lg">
            <Icon size={24} className="text-purple-600" />
          </div>
        )}
      </div>
      {change && (
        <p className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
          {change}
        </p>
      )}
    </motion.div>
  );
}
