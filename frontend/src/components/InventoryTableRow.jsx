import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function InventoryTableRow({ car, onEdit, onDelete, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-200 hover:bg-gray-50 transition-all"
    >
      {/* Vehicle Info */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={car.images?.[0] || 'https://via.placeholder.com/50x50?text=Car'}
              alt={car.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{car.title}</p>
            <p className="text-xs text-gray-500 capitalize">{car.brand || 'N/A'}</p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-5">
        <p className="font-bold text-gray-900">{formatPriceCompact(car.price)}</p>
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          car.availability === 'in-stock'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : car.availability === 'booked'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {car.availability?.toUpperCase() || 'UNKNOWN'}
        </span>
      </td>

      {/* Listing Date */}
      <td className="px-6 py-5 text-sm text-gray-500">
        {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'N/A'}
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(car)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 size={18} className="text-gray-500 hover:text-purple-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(car._id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}
