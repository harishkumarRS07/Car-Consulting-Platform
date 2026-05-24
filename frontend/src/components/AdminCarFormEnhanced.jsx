import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Upload, Trash2, Check, AlertCircle, Image as ImageIcon,
  ChevronDown, Plus, Eye, EyeOff
} from 'lucide-react';
import { carsAPI } from '../services/api';

// ==================== CONSTANTS ====================
const FORM_SECTIONS = {
  basic: 'Basic Information',
  specs: 'Specifications',
  pricing: 'Pricing & Condition',
  location: 'Location & Details',
  features: 'Features',
  description: 'Description',
  images: 'Images',
};

const CAR_OPTIONS = {
  brands: [
    'Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Volkswagen',
    'Toyota', 'Datsun', 'Renault', 'Skoda', 'Kia', 'MG', 'BMW', 'Audi'
  ],
  fuelTypes: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
  transmissions: ['Manual', 'Automatic'],
  bodyTypes: ['Sedan', 'SUV', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Sports'],
  owners: ['1st', '2nd', '3rd', 'more'],
  categories: ['Budget', 'Assured', 'Luxury'],
  availability: ['In-Stock', 'Booked', 'Upcoming'],
  features: [
    'Power Steering', 'Power Windows', 'Air Conditioning', 'Airbags',
    'ABS', 'Power Brakes', 'Central Locking', 'Fog Lights',
    'Sunroof', 'Leather Seats', 'Cruise Control', 'Navigation System',
    'Touchscreen Display', 'Backup Camera', 'Park Assist'
  ]
};

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
  color: '#000000',
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

// ==================== FORM FIELD COMPONENTS ====================

const FormInput = ({ label, error, required, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2 rounded-lg border transition-all duration-200
        ${error
          ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
          : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
        }
        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
        placeholder-gray-500 dark:placeholder-gray-400
        focus:outline-none`}
    />
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
        <AlertCircle size={16} />
        {error}
      </div>
    )}
  </div>
);

const FormSelect = ({ label, options, error, required, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full px-4 py-2 rounded-lg border appearance-none transition-all duration-200
          ${error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none cursor-pointer`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 dark:text-gray-400" />
    </div>
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
        <AlertCircle size={16} />
        {error}
      </div>
    )}
  </div>
);

const FormTextarea = ({ label, error, required, maxLength, ...props }) => {
  const [charCount, setCharCount] = useState(props.defaultValue?.length || 0);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxLength && (
          <span className={`text-xs font-medium ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        {...props}
        maxLength={maxLength}
        onChange={(e) => {
          setCharCount(e.target.value.length);
          props.onChange?.(e);
        }}
        className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 resize-none
          ${error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none`}
        rows={4}
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

const FormCheckboxGroup = ({ label, options, error, required, selectedValues, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {options.map(option => (
        <label key={option} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selectedValues, option]);
              } else {
                onChange(selectedValues.filter(v => v !== option));
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {option}
          </span>
        </label>
      ))}
    </div>
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
        <AlertCircle size={16} />
        {error}
      </div>
    )}
  </div>
);

// ==================== IMAGE UPLOAD COMPONENT ====================

const ImageUploadSection = ({ images, onAddImages, onRemoveImage, error }) => {
  const fileInputRef = useCallback(ref => ref?.click(), []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];

    files.forEach(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 2) {
        console.warn(`File ${file.name} exceeds 2MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        validFiles.push(reader.result);
        if (validFiles.length === files.length) {
          onAddImages(validFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        Car Images
        <span className="text-red-500 ml-1">*</span>
      </label>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
        onClick={() => {
          const input = document.getElementById('image-upload');
          input?.click();
        }}>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <ImageIcon size={32} className="mx-auto text-gray-400 group-hover:text-blue-400 transition-colors mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click to upload or drag and drop images
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max 2MB per image, up to 20 images
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500 mt-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Images: {images.length}/20
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={image}
                  alt={`Car ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN FORM COMPONENT ====================

export default function AdminCarFormEnhanced({ car, onClose, onSubmit }) {
  const [formData, setFormData] = useState(car || INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [success, setSuccess] = useState(false);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.transmission) newErrors.transmission = 'Transmission is required';
    if (!formData.kmsDriven) newErrors.kmsDriven = 'KMs driven is required';
    if (!formData.bodyType) newErrors.bodyType = 'Body type is required';

    // Numeric validations
    if (formData.price && parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.kmsDriven && parseFloat(formData.kmsDriven) < 0) {
      newErrors.kmsDriven = 'KMs cannot be negative';
    }

    // Images validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least 1 image is required';
    } else if (formData.images.length > 20) {
      newErrors.images = 'Maximum 20 images allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'features') {
      setFormData(prev => ({
        ...prev,
        features: checked
          ? [...prev.features, value]
          : prev.features.filter(f => f !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? parseFloat(value) : '') : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleAddImages = useCallback((newImages) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 20)
    }));
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setActiveSection('basic');
      return;
    }

    setLoading(true);

    try {
      if (car?._id) {
        await carsAPI.updateCar(car._id, formData);
      } else {
        await carsAPI.createCar(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmit?.();
        onClose?.();
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to save car' });
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'basic',
      title: FORM_SECTIONS.basic,
      fields: ['title', 'brand', 'model', 'year']
    },
    {
      id: 'specs',
      title: FORM_SECTIONS.specs,
      fields: ['fuelType', 'transmission', 'bodyType', 'color', 'seats']
    },
    {
      id: 'pricing',
      title: FORM_SECTIONS.pricing,
      fields: ['price', 'kmsDriven', 'owner', 'category']
    },
    {
      id: 'location',
      title: FORM_SECTIONS.location,
      fields: ['location', 'rto', 'availability']
    },
    {
      id: 'features',
      title: FORM_SECTIONS.features,
      fields: ['features']
    },
    {
      id: 'description',
      title: FORM_SECTIONS.description,
      fields: ['description']
    },
    {
      id: 'images',
      title: FORM_SECTIONS.images,
      fields: ['images']
    }
  ];

  const sectionProgress = useMemo(() => {
    const completedSections = sections.filter(section => {
      return section.fields.every(field => {
        const value = formData[field];
        if (Array.isArray(value)) return value.length > 0;
        return value !== '' && value !== null;
      });
    }).length;
    return Math.round((completedSections / sections.length) * 100);
  }, [formData, sections]);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {car ? 'Car Updated' : 'Car Created'} Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your car listing has been saved.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 overflow-auto z-50"
    >
      <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 text-white p-6 rounded-t-xl flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold">
                {car ? 'Edit Car Listing' : 'Add New Car'}
              </h2>
              <p className="text-blue-100 mt-1">
                Completion: {sectionProgress}%
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sectionProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Section Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map(section => {
                const isCompleted = section.fields.every(field => {
                  const value = formData[field];
                  if (Array.isArray(value)) return value.length > 0;
                  return value !== '' && value !== null;
                });

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {isCompleted && <Check size={16} className="inline mr-1" />}
                    {section.title}
                  </button>
                );
              })}
            </div>

            {/* Basic Information Section */}
            {activeSection === 'basic' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {FORM_SECTIONS.basic}
                </h3>
                <FormInput
                  label="Car Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., 2018 Maruti Swift"
                  error={errors.title}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    options={CAR_OPTIONS.brands}
                    error={errors.brand}
                    required
                  />
                  <FormInput
                    label="Model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Swift"
                    error={errors.model}
                    required
                  />
                </div>
                <FormInput
                  label="Year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  min="1990"
                  max={new Date().getFullYear()}
                  error={errors.year}
                  required
                />
              </motion.div>
            )}

            {/* Specifications Section */}
            {activeSection === 'specs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {FORM_SECTIONS.specs}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Fuel Type"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    options={CAR_OPTIONS.fuelTypes}
                    error={errors.fuelType}
                    required
                  />
                  <FormSelect
                    label="Transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    options={CAR_OPTIONS.transmissions}
                    error={errors.transmission}
                    required
                  />
                  <FormSelect
                    label="Body Type"
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleChange}
                    options={CAR_OPTIONS.bodyTypes}
                    error={errors.bodyType}
                    required
                  />
                  <FormInput
                    label="Color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>
                <FormInput
                  label="Seats"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </motion.div>
            )}

            {/* Pricing Section */}
            {activeSection === 'pricing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {FORM_SECTIONS.pricing}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 500000"
                    error={errors.price}
                    required
                  />
                  <FormInput
                    label="KMs Driven"
                    name="kmsDriven"
                    type="number"
                    value={formData.kmsDriven}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    error={errors.kmsDriven}
                    required
                  />
                  <FormSelect
                    label="Owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    options={CAR_OPTIONS.owners}
                    error={errors.owner}
                    required
                  />
                  <FormSelect
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={CAR_OPTIONS.categories}
                    error={errors.category}
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Location Section */}
            {activeSection === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {FORM_SECTIONS.location}
                </h3>
                <FormInput
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Downtown, Mumbai"
                  error={errors.location}
                  required
                />
                <FormInput
                  label="RTO Code"
                  name="rto"
                  value={formData.rto}
                  onChange={handleChange}
                  placeholder="e.g., MH-01"
                />
                <FormSelect
                  label="Availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  options={CAR_OPTIONS.availability}
                  error={errors.availability}
                  required
                />
              </motion.div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {FORM_SECTIONS.features}
                </h3>
                <FormCheckboxGroup
                  label="Select Features"
                  options={CAR_OPTIONS.features}
                  selectedValues={formData.features}
                  onChange={(features) => setFormData(prev => ({ ...prev, features }))}
                  error={errors.features}
                />
              </motion.div>
            )}

            {/* Description Section */}
            {activeSection === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {FORM_SECTIONS.description}
                </h3>
                <FormTextarea
                  label="Car Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the car condition, history, and any special features..."
                  maxLength={2000}
                  error={errors.description}
                />
              </motion.div>
            )}

            {/* Images Section */}
            {activeSection === 'images' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {FORM_SECTIONS.images}
                </h3>
                <ImageUploadSection
                  images={formData.images}
                  onAddImages={handleAddImages}
                  onRemoveImage={handleRemoveImage}
                  error={errors.images}
                />
              </motion.div>
            )}

            {/* Global Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3"
              >
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                  <p className="text-red-700 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              </motion.div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {car ? 'Update Car' : 'Add Car'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

