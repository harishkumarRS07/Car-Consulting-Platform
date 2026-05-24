// Comprehensive Car Brands and Models Mapping
// Used for the Sell a Car feature to provide complete model lists

export const carBrandsWithModels = {
  Toyota: [
    'Corolla',
    'Camry',
    'Yaris',
    'Fortuner',
    'Innova',
    'Hilux',
    'Land Cruiser',
    'Prius',
    'RAV4',
    'Urban Cruiser',
    'Glanza',
    'Etios',
    'Vellfire',
  ],
  Honda: [
    'City',
    'Civic',
    'Accord',
    'Amaze',
    'Jazz',
    'WR-V',
    'CR-V',
    'BR-V',
    'Elevate',
  ],
  Hyundai: [
    'i10',
    'Grand i10',
    'i20',
    'Verna',
    'Creta',
    'Venue',
    'Alcazar',
    'Tucson',
    'Aura',
    'Exter',
    'Santro',
    'Elantra',
  ],
  Kia: [
    'Seltos',
    'Sonet',
    'Carens',
    'Carnival',
    'EV6',
    'Syros',
  ],
  Nissan: [
    'Magnite',
    'Kicks',
    'Sunny',
    'Micra',
    'Terrano',
    'GT-R',
    'X-Trail',
  ],
  Suzuki: [
    'Swift',
    'Baleno',
    'Dzire',
    'Brezza',
    'Ertiga',
    'Ciaz',
    'Alto',
    'WagonR',
    'Fronx',
    'Jimny',
    'Ignis',
    'XL6',
  ],
  Ford: [
    'EcoSport',
    'Endeavour',
    'Figo',
    'Aspire',
    'Mustang',
    'Ranger',
    'Everest',
  ],
  Mazda: [
    'Mazda2',
    'Mazda3',
    'Mazda6',
    'CX-3',
    'CX-5',
    'CX-9',
    'MX-5 Miata',
    'RX-8',
  ],
  Mitsubishi: [
    'Pajero',
    'Outlander',
    'Lancer',
    'Xpander',
    'Montero',
    'Eclipse Cross',
  ],
  GMC: [
    'Sierra',
    'Yukon',
    'Terrain',
    'Acadia',
    'Hummer EV',
    'Canyon',
  ],
  'Mercedes-Benz': [
    'A-Class',
    'C-Class',
    'E-Class',
    'S-Class',
    'GLA',
    'GLC',
    'GLE',
    'GLS',
    'Maybach S-Class',
    'AMG GT',
    'EQS',
  ],
  Mopar: [
    'Charger',
    'Challenger',
    'Durango',
    '300',
    'Pacifica',
    'RAM 1500',
    'Jeep Wrangler',
    'Jeep Compass',
  ],
};

// Get models for a specific brand
export const getModelsByBrand = (brand) => {
  return carBrandsWithModels[brand] || [];
};

// Get all available brands
export const getAllBrandsWithModels = () => {
  return Object.keys(carBrandsWithModels);
};

// Check if a model exists for a brand
export const isValidModel = (brand, model) => {
  const models = carBrandsWithModels[brand] || [];
  return models.includes(model);
};
