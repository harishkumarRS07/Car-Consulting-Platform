import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { carsAPI } from "../services/api";
import { useCarsStore } from "../context/store";
import CarCard from "./CarCard";

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState("best");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        
        if (activeTab === "new") {
          response = await carsAPI.getNewArrivals();
        } else {
          response = await carsAPI.getFeaturedCars();
        }
        
        setCars(response.data.cars || []);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [activeTab]);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  return (
    <section className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Featured Cars
          </h2>
          <p className="text-gray-600">
            Handpicked vehicles curated just for you
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-6 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setActiveTab("best")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === "best"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Best buys for you
            </button>

            <button
              onClick={() => setActiveTab("new")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === "new"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Newly added
            </button>
          </div>
        </motion.div>

        {/* Scrollable Cards Row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-[350px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-semibold">No featured cars available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {cars.map((car, idx) => (
              <motion.div
                key={car._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <CarCard car={car} onWishlist={handleWishlist} isInWishlist={isInWishlist(car._id)} />
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/cars"
              className="inline-block px-8 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300"
            >
              View all cars
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
