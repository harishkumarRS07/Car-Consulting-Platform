// Brand Logo Mapping - Professional Brand Data
// All logos stored in /public/brands/ with lowercase-hyphen naming

export const brandsData = [
  { name: 'Toyota', logo: '/brands/toyota.png' },
  { name: 'Honda', logo: '/brands/honda.png' },
  { name: 'Hyundai', logo: '/brands/hyundai.png' },
  { name: 'Kia', logo: '/brands/kia.png' },
  { name: 'Nissan', logo: '/brands/nissan.png' },
  { name: 'Suzuki', logo: '/brands/suzuki.png' },
  { name: 'Ford', logo: '/brands/ford.png' },
  { name: 'Mazda', logo: '/brands/mazda.png' },
  { name: 'Mitsubishi', logo: '/brands/mitsubishi.png' },
  { name: 'GMC', logo: '/brands/gmc.png' },
  { name: 'Mercedes-Benz', logo: '/brands/mercedes-benz.png' },
  { name: 'Mopar', logo: '/brands/mopar.png' },
];

// Get logo path for a brand
export const getBrandLogo = (brandName) => {
  const brand = brandsData.find(b => b.name === brandName);
  return brand?.logo || null;
};

// Get all brands
export const getAllBrands = () => brandsData;

// Get brand by name
export const getBrand = (name) => {
  return brandsData.find(b => b.name === name);
};
