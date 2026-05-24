import { motion } from 'framer-motion';

export default function SidebarNav({ navItems, activeTab, onTabChange, sidebarOpen }) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} />
            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
