import { motion } from 'framer-motion';

export default function CheckboxFilter({ label, checked, onChange }) {
  return (
    <motion.label
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 cursor-pointer group py-1"
    >
      <div
        className={`w-4 h-4 rounded border transition-all duration-300 ${checked
          ? 'bg-purple-600 border-purple-600'
          : 'border-gray-300 group-hover:border-purple-500'
          }`}
      >
        {checked && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
      </div>
      <span className="text-gray-600 group-hover:text-gray-900 transition-colors text-sm capitalize">
        {label}
      </span>
    </motion.label>
  );
}
