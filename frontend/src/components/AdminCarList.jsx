import { motion } from 'framer-motion';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function AdminCarList({ cars, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-64 skeleton" />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-2xl text-gray-500 mb-4">No cars added yet</p>
        <p className="text-gray-600">Add your first car to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Car</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Price</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Location</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car, i) => (
            <motion.tr
              key={car._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={car.images?.[0] || 'https://via.placeholder.com/40'}
                    alt={car.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-semibold">{car.title}</p>
                    <p className="text-xs text-gray-500">{car.brand} {car.model}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-bold text-purple-600">{formatPriceCompact(car.price)}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">{car.location}</span>
              </td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  car.availability === 'in-stock'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : car.availability === 'booked'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {car.availability === 'in-stock' ? 'In Stock' : car.availability === 'booked' ? 'Booked' : 'Upcoming'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cars/${car._id}`}
                    target="_blank"
                    className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors border border-purple-100"
                    title="View"
                  >
                    <Eye size={18} />
                  </Link>
                  <button
                    onClick={() => onEdit(car)}
                    className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors border border-purple-100"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(car._id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors border border-red-100"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
