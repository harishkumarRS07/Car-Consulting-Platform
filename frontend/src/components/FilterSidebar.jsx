import { useState, useCallback } from 'react';
import CheckboxFilter from './CheckboxFilter';
import FilterAccordion from './FilterAccordion';
import { motion } from 'framer-motion';
import { Search, RotateCcw } from 'lucide-react';

const BRANDS = [
  'hyundai',
  'maruti',
  'honda',
  'toyota',
  'tata',
  'skoda',
  'mahindra',
  'renault',
  'bmw',
  'kia',
  'volkswagen',
  'jeep',
  'audi',
  'mercedes-benz',
  'volvo',
  'jaguar',
  'land-rover',
  'lexus',
  'nissan',
  'mg',
  'citroen',
  'byd',
  'isuzu',
  'force',
  'fiat',
  'ford',
  'mitsubishi',
  'chevrolet',
  'datsun',
  'mini',
  'porsche',
  'maserati',
  'lamborghini',
  'ferrari',
  'bentley',
  'rolls-royce',
  'aston-martin',
  'mclaren'
];
const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'muv', 'coupe', 'convertible', 'sports'];
const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric'];
const TRANSMISSION = ['manual', 'automatic'];
const CATEGORIES = ['budget', 'assured', 'luxury'];

export default function FilterSidebar({
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
  onFilterChange,
  hideHeader = false,
}) {

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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-[18px] ${hideHeader ? '' : 'border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)]'} overflow-hidden w-full`}
    >
      {!hideHeader && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-950 tracking-tight">Filters</h2>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all"
            title="Reset all"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* Compact Search */}
      <div className={`px-5 py-3 border-b border-gray-100 bg-white ${hideHeader ? 'pt-1' : ''}`}>
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            placeholder="Search brand, model..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl h-9 pl-9 pr-4 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Price Range */}
        <FilterAccordion title="Price Range" defaultOpen>
          <div className="space-y-4 pt-1 pb-2">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                Min: <span className="text-purple-650 font-black">₹{filters.priceMin.toLocaleString()}</span>
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
                className="w-full h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                Max: <span className="text-purple-650 font-black">₹{filters.priceMax.toLocaleString()}</span>
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
                className="w-full h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </FilterAccordion>

        {/* Brand */}
        <FilterAccordion title="Brand">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
            {BRANDS.map((brand) => (
              <CheckboxFilter
                key={brand}
                label={brand}
                checked={filters.brand.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
              />
            ))}
          </div>
        </FilterAccordion>

        {/* Fuel Type */}
        <FilterAccordion title="Fuel Type">
          <div className="space-y-2 pt-1 pb-2">
            {FUEL_TYPES.map((fuel) => (
              <CheckboxFilter
                key={fuel}
                label={fuel}
                checked={filters.fuelType.includes(fuel)}
                onChange={() => handleFuelTypeToggle(fuel)}
              />
            ))}
          </div>
        </FilterAccordion>

        {/* Transmission */}
        <FilterAccordion title="Transmission">
          <div className="space-y-2 pt-1 pb-2">
            {TRANSMISSION.map((transmission) => (
              <CheckboxFilter
                key={transmission}
                label={transmission}
                checked={filters.transmission.includes(transmission)}
                onChange={() => handleTransmissionToggle(transmission)}
              />
            ))}
          </div>
        </FilterAccordion>

        {/* Body Type */}
        <FilterAccordion title="Body Type">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
            {BODY_TYPES.map((bodyType) => (
              <CheckboxFilter
                key={bodyType}
                label={bodyType}
                checked={filters.bodyType.includes(bodyType)}
                onChange={() => handleBodyTypeToggle(bodyType)}
              />
            ))}
          </div>
        </FilterAccordion>

        {/* Category */}
        <FilterAccordion title="Category">
          <div className="space-y-2 pt-1 pb-2">
            {CATEGORIES.map((category) => (
              <CheckboxFilter
                key={category}
                label={category}
                checked={filters.category.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
            ))}
          </div>
        </FilterAccordion>

        {/* Year Range */}
        <FilterAccordion title="Year">
          <div className="space-y-4 pt-1 pb-2">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                From: <span className="text-purple-650 font-black">{filters.yearMin}</span>
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
                className="w-full h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                To: <span className="text-purple-650 font-black">{filters.yearMax}</span>
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
                className="w-full h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </FilterAccordion>
      </div>
    </motion.div>
  );
}
