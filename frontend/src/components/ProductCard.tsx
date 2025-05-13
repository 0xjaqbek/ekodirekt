import React from 'react';
import { Link } from 'react-router-dom';
import { ProductResponse } from 'shared/types/api';
import { formatPrice } from 'shared/utils';

interface ProductCardProps {
  product: ProductResponse;
  isFarmerView?: boolean;
}

/**
 * Karta produktu wyświetlana na liście produktów
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, isFarmerView = false }) => {
  // Skróć opis do 100 znaków
  const shortDescription = product.description.length > 100
    ? `${product.description.substring(0, 100)}...`
    : product.description;

  // Zdjęcie produktu (pierwsze z listy lub placeholder)
  const productImage = product.images && product.images.length > 0
    ? product.images[0]
    : '/assets/images/product-placeholder.jpg';

  // Odznaka statusu produktu (dla widoku rolnika)
  const getStatusBadge = () => {
    switch (product.status) {
      case 'available':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Dostępny</span>;
      case 'unavailable':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Niedostępny</span>;
      case 'preparing':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">W przygotowaniu</span>;
      case 'shipped':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Wysłany</span>;
      case 'delivered':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Dostarczony</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product._id}`} className="block">
        {/* Zdjęcie produktu */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Odznaka certyfikatu */}
          {product.isCertified && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              Certyfikowany
            </div>
          )}
          
          {/* Odznaka statusu (tylko w widoku rolnika) */}
          {isFarmerView && (
            <div className="absolute top-2 left-2">
              {getStatusBadge()}
            </div>
          )}
        </div>
        
        {/* Informacje o produkcie */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
            <div className="text-lg font-semibold text-primary">
              {formatPrice(product.price)}
              <span className="text-sm text-gray-500 font-normal ml-1">/ {product.unit}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-2">
            {product.category} {product.subcategory && `› ${product.subcategory}`}
          </p>
          
          <p className="text-sm text-gray-600 mb-3">{shortDescription}</p>
          
          {/* Informacje o rolniku */}
          <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
            {product.owner.profileImage ? (
              <img
                src={product.owner.profileImage}
                alt={product.owner.fullName}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center mr-2">
                {product.owner.fullName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">{product.owner.fullName}</p>
              <p className="text-xs text-gray-500">{product.owner.location.address}</p>
            </div>
            
            {/* Ocena produktu */}
            {product.averageRating > 0 && (
              <div className="ml-auto flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="ml-1 text-sm text-gray-600">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Akcje (tylko w widoku rolnika) */}
      {isFarmerView && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
          <Link
            to={`/dashboard/products/edit/${product._id}`}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Edytuj
          </Link>
          
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Szczegóły
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductCard;