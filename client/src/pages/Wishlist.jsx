import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { products, wishlist } = useAppContext();
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    // Filter global products based on wishlist IDs
    const filtered = products.filter(p => wishlist.includes(p._id));
    setWishlistProducts(filtered);
  }, [products, wishlist]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-light text-gray-900 flex items-center gap-2">
          My Wishlist <Heart className="fill-red-500 text-red-500" />
        </h1>
        <p className="text-gray-500 mt-2">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} Saved
        </p>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;