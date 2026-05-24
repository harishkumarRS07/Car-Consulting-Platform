import { useState } from 'react';
import { motion } from 'framer-motion';
import { carsAPI } from '../services/api';
import { X, Save, Upload, Trash2 } from 'lucide-react';

const INITIAL_FORM_DATA = {
  title: '',
  brand: '',
  model: '',
  price: '',
  fuelType: 'petrol',
  transmission: 'manual',
  kmsDriven: '',
  year: new Date().getFullYear(),
  bodyType: 'sedan',
  color: '',
  seats: 5,
  owner: '1st',
  location: '',
  rto: '',
  description: '',
  features: [],
  category: 'budget',
  availability: 'in-stock',
  images: [],
};

export default function AdminCarForm({ car, onClose, onSubmit }) {
  const [formData, setFormData] = useState(car || INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'features') {
      setFormData({
        ...formData,
        features: checked
          ? [...formData.features, value]
          : formData.features.filter((f) => f !== value),
      });
    } else if (name === 'images' && type === 'file') {
      const files = Array.from(e.target.files);
      let addedCount = 0;

      files.forEach((file) => {
        // Check file size (max 2MB per image for base64)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 2) {
          console.warn(`File ${file.name} is too large (${fileSizeMB.toFixed(2)}MB). Max 2MB allowed.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => {
            // Prevent duplicates and limit to 20 images max
            if (prev.images.length >= 20) {
              console.warn('Maximum 20 images allowed');
              return prev;
            }
            return {
              ...prev,
              images: [...prev.images, reader.result],
            };
          });
          addedCount++;
        };
        reader.onerror = () => {
          console.error(`Error reading file ${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value,
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error('Car title is required');
      }
      if (!formData.brand?.trim()) {
        throw new Error('Brand is required');
      }
      if (!formData.model?.trim()) {
        throw new Error('Model is required');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('Valid price is required');
      }
      if (!formData.location?.trim()) {
        throw new Error('Location is required');
      }

      // Validate images (optional but recommended)
      let validImages = [];
      if (formData.images && formData.images.length > 0) {
        validImages = formData.images.filter(img => {
          if (typeof img === 'string') {
            // It's already a base64 string from upload or existing URL
            return img && img.length > 0;
          }
          return false;
        });
      }

      // Prepare data with validated images
      const dataToSend = {
        ...formData,
        images: validImages.length > 0 ? validImages : formData.images || [],
      };

      if (car?._id) {
        await carsAPI.updateCar(car._id, dataToSend);
      } else {
        await carsAPI.createCar(dataToSend);
      }
      
      onSubmit();
    } catch (err) {
      console.error('Error saving car:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error saving car. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-2 text-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-2xl font-bold text-gray-900">{car ? 'Edit Car' : 'Add New Car'}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm space-y-2"
        >
          <p className="font-semibold">❌ Error: {error}</p>
          <p className="text-xs text-red-500">Make sure all required fields are filled correctly.</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Honda City 2021"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 650000"
              required
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Honda"
              required
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., City"
              required
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type *</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input-field">
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="cng">CNG</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission *</label>
            <select name="transmission" value={formData.transmission} onChange={handleChange} className="input-field">
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>

          {/* KMs Driven */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">KMs Driven *</label>
            <input
              type="number"
              name="kmsDriven"
              value={formData.kmsDriven}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 45000"
              required
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="input-field"
              min="2000"
              required
            />
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Body Type *</label>
            <select name="bodyType" value={formData.bodyType} onChange={handleChange} className="input-field">
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="muv">MUV</option>
              <option value="coupe">Coupe</option>
              <option value="convertible">Convertible</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Silver"
            />
          </div>

          {/* Seats */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Seats</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              className="input-field"
              min="2"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Type</label>
            <select name="owner" value={formData.owner} onChange={handleChange} className="input-field">
              <option value="1st">1st Owner</option>
              <option value="2nd">2nd Owner</option>
              <option value="3rd">3rd Owner</option>
              <option value="more">More</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Mumbai"
              required
            />
          </div>

          {/* RTO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">RTO</label>
            <input
              type="text"
              name="rto"
              value={formData.rto}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., MH-01"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="input-field">
              <option value="budget">Budget</option>
              <option value="assured">Assured+</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
            <select name="availability" value={formData.availability} onChange={handleChange} className="input-field">
              <option value="in-stock">In Stock</option>
              <option value="booked">Booked</option>
              <option value="upcoming">Upcoming</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            placeholder="Car details and condition"
            rows="4"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">Car Images (Add Multiple)</label>
          
          {/* Upload Area */}
          <div className="space-y-3">
            {/* Main Upload Button */}
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-all">
              <Upload size={24} className="text-purple-600" />
              <div className="text-center">
                <span className="text-sm font-bold text-purple-600 block">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-500">Select multiple images at once</span>
              </div>
              <input
                type="file"
                name="images"
                onChange={handleChange}
                multiple
                accept="image/*"
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each • Select 3+ images for best results</p>
          </div>

          {/* Image List/Preview */}
          {formData.images.length > 0 && (
            <div className="mt-6 space-y-4">
              {/* Header with Count */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formData.images.length} Image(s) Added</p>
                  <p className="text-xs text-gray-500 mt-1">Preview your car images below</p>
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 border border-purple-400 cursor-pointer transition-all text-sm text-white font-medium">
                  <Upload size={16} />
                  Add More
                  <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Grid Preview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-purple-400 transition-all">
                      <img
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-red-500/90 hover:bg-red-600 p-2 rounded-full"
                        >
                          <Trash2 size={16} className="text-white" />
                        </motion.button>
                      </div>

                      {/* Image Number Badge */}
                      <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {index + 1}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info Box */}
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg mt-4">
                <p className="text-xs text-purple-600 font-medium">
                  💡 Tip: You can always add more images using the "Add More" button. First image will be the main display image.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['sunroof', 'abs', 'airbags', 'power-steering', 'leather-seats', 'climate-control', 'touchscreen', 'gps', 'parking-sensors', 'backup-camera'].map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="features"
                  value={feature}
                  checked={formData.features.includes(feature)}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700 capitalize">{feature.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6 border-t border-purple-500">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary py-3 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Saving...' : car ? 'Update Car' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
}
