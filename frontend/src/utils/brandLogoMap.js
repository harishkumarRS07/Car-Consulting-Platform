// Brand Logo Mapping - Professional Brand Data
// All logos stored in /public/brands/ with lowercase-hyphen naming

export const brandsData = [
  { name: 'Maruti Suzuki', logo: '/brands/maruti-suzuki.png' },
  { name: 'Hyundai', logo: '/brands/hyundai.png' },
  { name: 'Tata', logo: '/brands/tata.png' },
  { name: 'Mahindra', logo: '/brands/mahindra.png' },
  { name: 'Honda', logo: '/brands/honda.png' },
  { name: 'Toyota', logo: '/brands/toyota.png' },
  { name: 'Kia', logo: '/brands/kia.png' },
  { name: 'Volkswagen', logo: '/brands/volkswagen.png' },
  { name: 'Skoda', logo: '/brands/skoda.png' },
  { name: 'Renault', logo: '/brands/renault.png' },
  { name: 'BMW', logo: '/brands/BMW.png' },
  { name: 'Audi', logo: '/brands/audi.png' },
  { name: 'Mercedes-Benz', logo: '/brands/benz.png' },
  { name: 'Jeep', logo: '/brands/jeep.png' },
  { name: 'MG', logo: '/brands/mg.png' },
  { name: 'Land Rover', logo: '/brands/Land Rover.png' },
  { name: 'Nissan', logo: '/brands/nissan.png' },
  { name: 'Ford', logo: '/brands/ford.png' },
  { name: 'Fiat', logo: '/brands/fiat.png' },
  { name: 'Chevrolet', logo: '/brands/chevrolet.png' },
  { name: 'Volvo', logo: '/brands/volvo.png' },
  { name: 'Jaguar', logo: '/brands/jaguar.png' },
  { name: 'Lexus', logo: '/brands/Lexus.png' },
  { name: 'Porsche', logo: '/brands/porsche.png' },
  { name: 'Mini Cooper', logo: '/brands/minicooper.png' },
  { name: 'Citroen', logo: '/brands/Citroen.png' },
  { name: 'Datsun', logo: '/brands/datsun.png' },
  { name: 'Isuzu', logo: '/brands/izuzu.png' },
  { name: 'Force', logo: '/brands/force.png' },
  { name: 'Mitsubishi', logo: '/brands/mitsubishi.png' },
];

// Get logo path for a brand
export const getBrandLogo = (brandName) => {
  const brand = brandsData.find(b => b.name.toLowerCase() === brandName.toLowerCase());
  return brand?.logo || null;
};

// Get all brands
export const getAllBrands = () => brandsData;

// Get brand by name
export const getBrand = (name) => {
  return brandsData.find(b => b.name.toLowerCase() === name.toLowerCase());
};
