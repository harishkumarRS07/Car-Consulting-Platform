import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, X, Sliders, Search, RotateCcw, Filter
} from 'lucide-react';
import { formatPriceCompact } from '../utils/priceFormatter';

// Filter options constants
const FILTER_OPTIONS = {
  brands: [
    'Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Volkswagen',
    'Toyota', 'Datsun', 'Renault', 'Skoda', 'Kia', 'MG', 'BMW', 'Audi'
  ],
  fuelTypes: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
  transmissions: ['Manual', 'Automatic'],
  bodyTypes: ['Sedan', 'SUV', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Sports'],
  colors: ['White', 'Black', 'Silver', 'Red', 'Blue', 'Green', 'Gold', 'Brown'],
  owners: ['1st', '2nd', '3rd', 'more'],
  locations: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune',
    'Chennai', 'Kolkata', 'Indore', 'Ahmedabad', 'Chandigarh'
  ],
  sortOptions: [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Most Relevant', value: 'title' }
  ]
};

// ==================== ACCORDION COMPONENT ====================

const FilterAccordionItem = ({ title, isOpen, onToggle, children, count }) => (
  <div className="border-b border-gray-200 dark:border-gray-700">
    <button
      onClick={onToggle}
      className={`w-full p-[16px] flex items-center justify-between hover:bg-purple-50 transition-colors ${isOpen ? 'text-[#7C3AED] bg-purple-50' : 'text-gray-900 bg-white'}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{title}</span>
        {count > 0 && (
          <span className="text-xs bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-white"
        >
          <div className="p-[16px] space-y-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ==================== CHECKBOX FILTER ====================

const CheckboxOption = ({ id, label, checked, onChange }) => (
  <motion.label
    whileHover={{ x: 2 }}
    className="flex items-center gap-2 cursor-pointer group"
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] cursor-pointer accent-[#7C3AED] transition-all"
    />
    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
      {label}
    </span>
  </motion.label>
);

// ==================== PRICE RANGE SLIDER ====================

const PriceRangeSlider = ({ minPrice, maxPrice, onMinChange, onMaxChange, min = 100000, max = 50000000, step = 50000 }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
            Min
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 text-xs">
              ₹
            </span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinChange(Math.min(Number(e.target.value), maxPrice))}
              className="w-full pl-6 pr-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min={min}
              max={max}
              step={step}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
            Max
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 text-xs">
              ₹
            </span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxChange(Math.max(Number(e.target.value), minPrice))}
              className="w-full pl-6 pr-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min={min}
              max={max}
              step={step}
            />
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minPrice}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), maxPrice))}
          className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxPrice}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), minPrice))}
          className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          style={{
            marginTop: '-12px'
          }}
        />
      </div>

      {/* Display Range */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-center">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {formatPriceCompact(minPrice)} - {formatPriceCompact(maxPrice)}
        </p>
      </div>
    </div>
  );
};

// ==================== MAIN FILTER SIDEBAR ====================

export default function FilterFormEnhanced({ filters, onFilterChange, onSearch }) {
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    fuel: false,
    transmission: false,
    body: false,
    color: false,
    location: false
  });
  const [sortBy, setSortBy] = useState('-createdAt');

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleBrandToggle = useCallback((brand) => {
    const updatedBrands = filters.brands?.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...(filters.brands || []), brand];
    onFilterChange({ ...filters, brands: updatedBrands });
  }, [filters, onFilterChange]);

  const handleFuelTypeToggle = useCallback((fuel) => {
    const updatedFuels = filters.fuelTypes?.includes(fuel)
      ? filters.fuelTypes.filter(f => f !== fuel)
      : [...(filters.fuelTypes || []), fuel];
    onFilterChange({ ...filters, fuelTypes: updatedFuels });
  }, [filters, onFilterChange]);

  const handleTransmissionToggle = useCallback((transmission) => {
    const updatedTransmissions = filters.transmissions?.includes(transmission)
      ? filters.transmissions.filter(t => t !== transmission)
      : [...(filters.transmissions || []), transmission];
    onFilterChange({ ...filters, transmissions: updatedTransmissions });
  }, [filters, onFilterChange]);

  const handleBodyTypeToggle = useCallback((bodyType) => {
    const updatedBodyTypes = filters.bodyTypes?.includes(bodyType)
      ? filters.bodyTypes.filter(b => b !== bodyType)
      : [...(filters.bodyTypes || []), bodyType];
    onFilterChange({ ...filters, bodyTypes: updatedBodyTypes });
  }, [filters, onFilterChange]);

  const handleColorToggle = useCallback((color) => {
    const updatedColors = filters.colors?.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...(filters.colors || []), color];
    onFilterChange({ ...filters, colors: updatedColors });
  }, [filters, onFilterChange]);

  const handleLocationToggle = useCallback((location) => {
    const updatedLocations = filters.locations?.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...(filters.locations || []), location];
    onFilterChange({ ...filters, locations: updatedLocations });
  }, [filters, onFilterChange]);

  const handlePriceChange = useCallback((minPrice, maxPrice) => {
    onFilterChange({ ...filters, minPrice, maxPrice });
  }, [filters, onFilterChange]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearch(query);
    onSearch?.(query);
  }, [onSearch]);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setSortBy('-createdAt');
    onFilterChange({
      brands: [],
      fuelTypes: [],
      transmissions: [],
      bodyTypes: [],
      colors: [],
      locations: [],
      minPrice: 100000,
      maxPrice: 50000000
    });
  }, [onFilterChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brands?.length) count += filters.brands.length;
    if (filters.fuelTypes?.length) count += filters.fuelTypes.length;
    if (filters.transmissions?.length) count += filters.transmissions.length;
    if (filters.bodyTypes?.length) count += filters.bodyTypes.length;
    if (filters.colors?.length) count += filters.colors.length;
    if (filters.locations?.length) count += filters.locations.length;
    if (filters.minPrice > 100000 || filters.maxPrice < 50000000) count += 1;
    return count;
  }, [filters]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[16px] shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white p-[16px]">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="text-lg font-bold">Advanced Filters</h2>
          {activeFilterCount > 0 && (
            <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-sm font-semibold">
              {activeFilterCount} active
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-[12px] top-[50%] -translate-y-[50%] text-white/80" size={18} />
          <input
            type="text"
            placeholder="Search cars..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-[38px] pr-[12px] py-[10px] rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Sort Options */}
        <div className="px-4 py-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              onFilterChange({ ...filters, sortBy: e.target.value });
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {FILTER_OPTIONS.sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <FilterAccordionItem
          title="Brand"
          isOpen={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
          count={filters.brands?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.brands.map(brand => (
              <CheckboxOption
                key={brand}
                id={brand}
                label={brand}
                checked={filters.brands?.includes(brand) || false}
                onChange={() => handleBrandToggle(brand)}
              />
            ))}
          </div>
        </FilterAccordionItem>

        {/* Price Filter */}
        <FilterAccordionItem
          title="Price Range"
          isOpen={expandedSections.price}
          onToggle={() => toggleSection('price')}
          count={filters.minPrice > 100000 || filters.maxPrice < 50000000 ? 1 : 0}
        >
          <PriceRangeSlider
            minPrice={filters.minPrice || 100000}
            maxPrice={filters.maxPrice || 50000000}
            onMinChange={(min) => handlePriceChange(min, filters.maxPrice || 50000000)}
            onMaxChange={(max) => handlePriceChange(filters.minPrice || 100000, max)}
          />
        </FilterAccordionItem>

        {/* Fuel Type Filter */}
        <FilterAccordionItem
          title="Fuel Type"
          isOpen={expandedSections.fuel}
          onToggle={() => toggleSection('fuel')}
          count={filters.fuelTypes?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.fuelTypes.map(fuel => (
              <CheckboxOption
                key={fuel}
                id={fuel}
                label={fuel}
                checked={filters.fuelTypes?.includes(fuel) || false}
                onChange={() => handleFuelTypeToggle(fuel)}
              />
            ))}
          </div>
        </FilterAccordionItem>

        {/* Transmission Filter */}
        <FilterAccordionItem
          title="Transmission"
          isOpen={expandedSections.transmission}
          onToggle={() => toggleSection('transmission')}
          count={filters.transmissions?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.transmissions.map(transmission => (
              <CheckboxOption
                key={transmission}
                id={transmission}
                label={transmission}
                checked={filters.transmissions?.includes(transmission) || false}
                onChange={() => handleTransmissionToggle(transmission)}
              />
            ))}
          </div>
        </FilterAccordionItem>

        {/* Body Type Filter */}
        <FilterAccordionItem
          title="Body Type"
          isOpen={expandedSections.body}
          onToggle={() => toggleSection('body')}
          count={filters.bodyTypes?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.bodyTypes.map(bodyType => (
              <CheckboxOption
                key={bodyType}
                id={bodyType}
                label={bodyType}
                checked={filters.bodyTypes?.includes(bodyType) || false}
                onChange={() => handleBodyTypeToggle(bodyType)}
              />
            ))}
          </div>
        </FilterAccordionItem>

        {/* Color Filter */}
        <FilterAccordionItem
          title="Color"
          isOpen={expandedSections.color}
          onToggle={() => toggleSection('color')}
          count={filters.colors?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.colors.map(color => (
              <CheckboxOption
                key={color}
                id={color}
                label={color}
                checked={filters.colors?.includes(color) || false}
                onChange={() => handleColorToggle(color)}
              />
            ))}
          </div>
        </FilterAccordionItem>

        {/* Location Filter */}
        <FilterAccordionItem
          title="Location"
          isOpen={expandedSections.location}
          onToggle={() => toggleSection('location')}
          count={filters.locations?.length || 0}
        >
          <div className="space-y-2">
            {FILTER_OPTIONS.locations.map(location => (
              <CheckboxOption
                key={location}
                id={location}
                label={location}
                checked={filters.locations?.includes(location) || false}
                onChange={() => handleLocationToggle(location)}
              />
            ))}
          </div>
        </FilterAccordionItem>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetFilters}
          className="w-full p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
        >
          <RotateCcw size={18} />
          Clear All Filters
        </motion.button>
      )}
    </motion.div>
  );
}

