import { useState, useCallback } from 'react';
import CheckboxFilter from './CheckboxFilter';
import FilterAccordion from './FilterAccordion';
import { useFilterReducer } from '../hooks/useFilterReducer';
import { motion } from 'framer-motion';
import { Search, RotateCcw } from 'lucide-react';

const BRANDS = ['hyundai', 'maruti', 'honda', 'toyota', 'tata', 'skoda', 'mahindra', 'renault', 'bmw', 'kia', 'volkswagen', 'jeep'];
const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'muv'];
const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric'];
const TRANSMISSION = ['manual', 'automatic'];
const CATEGORIES = ['budget', 'assured', 'luxury'];
const COLORS = ['silver', 'red', 'blue', 'black', 'white', 'grey', 'gold'];
const OWNER_TYPES = ['1st', '2nd', '3rd'];

export default function FilterSidebar({ onFilterChange }) {
  const {
    filters,
    setSearch,
    setBrand,
    setFuelType,
    setTransmission,
    setPriceRange,
    setYearRange,
    setBodyType,
    setCategory,
    reset,
  } = useFilterReducer();

  const [localSearch, setLocalSearch] = useState('');

  const handleSearch = useCallback((value) => {
    setLocalSearch(value);
    const timer = setTimeout(() => {
      setSearch(value);
      onFilterChange();
    }, 500);
    return () => clearTimeout(timer);
  }, [setSearch, onFilterChange]);

  const handleBrandToggle = (brand) => {
    const updated = filters.brand.includes(brand)
      ? filters.brand.filter((b) => b !== brand)
      : [...filters.brand, brand];
    setBrand(updated);
    onFilterChange();
  };

  const handleFuelTypeToggle = (fuel) => {
    const updated = filters.fuelType.includes(fuel)
      ? filters.fuelType.filter((f) => f !== fuel)
      : [...filters.fuelType, fuel];
    setFuelType(updated);
    onFilterChange();
  };

  const handleTransmissionToggle = (transmission) => {
    const updated = filters.transmission.includes(transmission)
      ? filters.transmission.filter((t) => t !== transmission)
      : [...filters.transmission, transmission];
    setTransmission(updated);
    onFilterChange();
  };

  const handleBodyTypeToggle = (bodyType) => {
    const updated = filters.bodyType.includes(bodyType)
      ? filters.bodyType.filter((b) => b !== bodyType)
      : [...filters.bodyType, bodyType];
    setBodyType(updated);
    onFilterChange();
  };

  const handleCategoryToggle = (category) => {
    const updated = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    setCategory(updated);
    onFilterChange();
  };

  const handleReset = () => {
    reset();
    setLocalSearch('');
    onFilterChange();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Filters</h2>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-purple-600 transition-all"
          title="Reset all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Compact Search */}
      <div className="p-4 border-b border-gray-50">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            placeholder="Quick search..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl h-10 pl-10 pr-4 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="overflow-y-auto">

        {/* Price Range */}
        <FilterAccordion title="Price Range" defaultOpen>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Min: ₹{filters.priceMin.toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max="50000000"
                step="50000"
                value={filters.priceMin}
                onChange={(e) => {
                  setPriceRange(parseInt(e.target.value), filters.priceMax);
                  onFilterChange();
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Max: ₹{filters.priceMax.toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max="50000000"
                step="50000"
                value={filters.priceMax}
                onChange={(e) => {
                  setPriceRange(filters.priceMin, parseInt(e.target.value));
                  onFilterChange();
                }}
                className="w-full"
              />
            </div>
          </div>
        </FilterAccordion>

        {/* Brand */}
        <FilterAccordion title="Brand">
          {BRANDS.map((brand) => (
            <CheckboxFilter
              key={brand}
              label={brand}
              checked={filters.brand.includes(brand)}
              onChange={() => handleBrandToggle(brand)}
            />
          ))}
        </FilterAccordion>

        {/* Fuel Type */}
        <FilterAccordion title="Fuel Type">
          {FUEL_TYPES.map((fuel) => (
            <CheckboxFilter
              key={fuel}
              label={fuel}
              checked={filters.fuelType.includes(fuel)}
              onChange={() => handleFuelTypeToggle(fuel)}
            />
          ))}
        </FilterAccordion>

        {/* Transmission */}
        <FilterAccordion title="Transmission">
          {TRANSMISSION.map((transmission) => (
            <CheckboxFilter
              key={transmission}
              label={transmission}
              checked={filters.transmission.includes(transmission)}
              onChange={() => handleTransmissionToggle(transmission)}
            />
          ))}
        </FilterAccordion>

        {/* Body Type */}
        <FilterAccordion title="Body Type">
          {BODY_TYPES.map((bodyType) => (
            <CheckboxFilter
              key={bodyType}
              label={bodyType}
              checked={filters.bodyType.includes(bodyType)}
              onChange={() => handleBodyTypeToggle(bodyType)}
            />
          ))}
        </FilterAccordion>

        {/* Category */}
        <FilterAccordion title="Category">
          {CATEGORIES.map((category) => (
            <CheckboxFilter
              key={category}
              label={category}
              checked={filters.category.includes(category)}
              onChange={() => handleCategoryToggle(category)}
            />
          ))}
        </FilterAccordion>

        {/* Year Range */}
        <FilterAccordion title="Year">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                From: {filters.yearMin}
              </label>
              <input
                type="range"
                min="2000"
                max={new Date().getFullYear()}
                value={filters.yearMin}
                onChange={(e) => {
                  setYearRange(parseInt(e.target.value), filters.yearMax);
                  onFilterChange();
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                To: {filters.yearMax}
              </label>
              <input
                type="range"
                min="2000"
                max={new Date().getFullYear()}
                value={filters.yearMax}
                onChange={(e) => {
                  setYearRange(filters.yearMin, parseInt(e.target.value));
                  onFilterChange();
                }}
                className="w-full"
              />
            </div>
          </div>
        </FilterAccordion>
      </div>
    </motion.div>
  );
}
