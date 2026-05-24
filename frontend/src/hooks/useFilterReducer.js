import { useReducer, useCallback, useMemo } from 'react';

const initialState = {
  search: '',
  brand: [],
  fuelType: [],
  transmission: [],
  priceMin: 0,
  priceMax: 50000000,
  yearMin: 2000,
  yearMax: new Date().getFullYear(),
  bodyType: [],
  owner: [],
  location: '',
  category: [],
  page: 1,
};

const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };
    case 'SET_BRAND':
      return { ...state, brand: action.payload, page: 1 };
    case 'SET_FUEL_TYPE':
      return { ...state, fuelType: action.payload, page: 1 };
    case 'SET_TRANSMISSION':
      return { ...state, transmission: action.payload, page: 1 };
    case 'SET_PRICE_RANGE':
      return { ...state, priceMin: action.payload.min, priceMax: action.payload.max, page: 1 };
    case 'SET_YEAR_RANGE':
      return { ...state, yearMin: action.payload.min, yearMax: action.payload.max, page: 1 };
    case 'SET_BODY_TYPE':
      return { ...state, bodyType: action.payload, page: 1 };
    case 'SET_OWNER':
      return { ...state, owner: action.payload, page: 1 };
    case 'SET_LOCATION':
      return { ...state, location: action.payload, page: 1 };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const useFilterReducer = () => {
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  // Callbacks for filter actions
  const setSearch = useCallback((search) => dispatch({ type: 'SET_SEARCH', payload: search }), []);
  const setBrand = useCallback((brand) => dispatch({ type: 'SET_BRAND', payload: brand }), []);
  const setFuelType = useCallback((fuelType) => dispatch({ type: 'SET_FUEL_TYPE', payload: fuelType }), []);
  const setTransmission = useCallback((transmission) => dispatch({ type: 'SET_TRANSMISSION', payload: transmission }), []);
  const setPriceRange = useCallback((min, max) => dispatch({ type: 'SET_PRICE_RANGE', payload: { min, max } }), []);
  const setYearRange = useCallback((min, max) => dispatch({ type: 'SET_YEAR_RANGE', payload: { min, max } }), []);
  const setBodyType = useCallback((bodyType) => dispatch({ type: 'SET_BODY_TYPE', payload: bodyType }), []);
  const setOwner = useCallback((owner) => dispatch({ type: 'SET_OWNER', payload: owner }), []);
  const setLocation = useCallback((location) => dispatch({ type: 'SET_LOCATION', payload: location }), []);
  const setCategory = useCallback((category) => dispatch({ type: 'SET_CATEGORY', payload: category }), []);
  const setPage = useCallback((page) => dispatch({ type: 'SET_PAGE', payload: page }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.brand.length) params.append('brand', filters.brand.join(','));
    if (filters.fuelType.length) params.append('fuelType', filters.fuelType.join(','));
    if (filters.transmission.length) params.append('transmission', filters.transmission.join(','));
    if (filters.priceMin) params.append('priceMin', filters.priceMin);
    if (filters.priceMax) params.append('priceMax', filters.priceMax);
    if (filters.yearMin) params.append('yearMin', filters.yearMin);
    if (filters.yearMax) params.append('yearMax', filters.yearMax);
    if (filters.bodyType.length) params.append('bodyType', filters.bodyType.join(','));
    if (filters.owner.length) params.append('owner', filters.owner.join(','));
    if (filters.location) params.append('location', filters.location);
    if (filters.category.length) params.append('category', filters.category.join(','));
    params.append('page', filters.page);
    params.append('limit', 12);
    return params;
  }, [filters]);

  return {
    filters,
    queryParams,
    setSearch,
    setBrand,
    setFuelType,
    setTransmission,
    setPriceRange,
    setYearRange,
    setBodyType,
    setOwner,
    setLocation,
    setCategory,
    setPage,
    reset,
  };
};
