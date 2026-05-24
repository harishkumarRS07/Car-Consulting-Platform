import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NavLinkItem({ to, label, external = false }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (external) {
    return (
      <a
        href={to}
        className={`relative px-1 py-2 font-medium transition-colors duration-300 ${isActive
            ? 'text-white'
            : 'text-purple-100 hover:text-white'
          }`}
      >
        {label}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={`relative px-1 py-2 font-bold text-sm transition-all duration-300 ${isActive
          ? 'text-white'
          : 'text-purple-100/80 hover:text-white'
        }`}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute -bottom-1 left-0 right-0 h-1 bg-white rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}
