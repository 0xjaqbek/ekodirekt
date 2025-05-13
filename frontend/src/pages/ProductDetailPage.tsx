import React, { useState } from 'react';
import { useProductDetails } from '../hooks/useProductDetails';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, formatDate } from 'shared/utils';

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    product,
    loading,
    error,
    isOwner,
    isAdmin,
    canEdit,
    changeProductStatus,
    removeProduct,
  } = useProductDetails();
  
  // Stan dla modali
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToChange, setStatusToChange] = useState('');
  const [statusNote, setStatusNote] = useState('');
  
  // Stan dla zdjęć w galerii
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Stan dla ilości produktu w koszyku
  const [quantity, setQuantity] = useState(1);
  
  // Obsługa zmiany ilości
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.quantity) {
      setQuantity(value);
    }
  };
  
  // Obsługa zmiany statusu
  const handleStatusChange = async () => {
    if (!statusToChange) return;
    
    const success = await changeProductStatus(statusToChange, statusNote);
    
    if (success) {
      setShowStatusModal(false);
      setStatusToChange('');
      setStatusNote('');
    }
  };
  
  // Obsługa usuwania produktu
  const handleDeleteProduct = async () => {
    const success = await removeProduct();
    
    if (success) {
      setShowDeleteModal(false);
      navigate('/dashboard/products');
    }
  };
  
  // Obsługa dodawania do koszyka
  const handleAddToCart = () => {
    // Implementacja dodawania do koszyka
    alert(`Dodano ${quantity} x ${product?.name} do koszyka`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error || 'Nie udało się załadować produktu.'}
        </div>
        <div className="mt-4">
          <Link to="/products" className="text-primary hover:underline">
            &larr; Wróć do listy produktów
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pasek nawigacji */}
      <div className="mb-6">
        <Link to="/products" className="text-primary hover:underline">
          &larr; Wróć do listy produktów
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Galeria zdjęć */}
          <div className="md:w-1/2">
            <div className="h-96 bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Brak zdjęcia
                </div>
              )}
            </div>
            
            {/* Miniatury zdjęć */}
            {product.images && product.images.length > 1 && (
              <div className="flex p-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`h-20 w-20 flex-shrink-0 cursor-pointer mr-2 rounded-md overflow-hidden ${
                      index === activeImageIndex ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Informacje o produkcie */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-sm text-gray-500 mb-4">
                  {product.category} {product.subcategory && `› ${product.subcategory}`}
                </p>
              </div>
              
              {/* Odznaka certyfikatu */}
              {product.isCertified && (
                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Certyfikowany
                </div>
              )}
            </div>
            
            {/* Cena i dostępność */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
                <span className="text-sm text-gray-500 font-normal ml-1">/ {product.unit}</span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                Dostępność:{' '}
                {product.quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    Dostępny ({product.quantity} {product.unit})
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Niedostępny</span>
                )}
              </p>
              
              {product.harvestDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Data zbioru: {formatDate(product.harvestDate)}
                </p>
              )}
            </div>
            
            {/* Opis produktu */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Opis</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Informacje o rolniku */}
            <div className="mb-6 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                {product.owner.profileImage ? (
                  <img
                    src={product.owner.profileImage}
                    alt={product.owner.fullName}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-light text-white flex items-center justify-center mr-3">
                    {product.owner.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {product.owner.fullName}
                    {product.owner.isVerified && (
                      <span className="ml-1 text-blue-500">✓</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{product.owner.location.address}</p>
                </div>
                
                <Link
                  to={`/farmers/${product.owner._id}`}
                  className="ml-auto text-primary hover:underline"
                >
                  Zobacz profil
                </Link>
              </div>
            </div>
            
            {/* Akcje produktu */}
            {canEdit ? (
              <div className="flex space-x-2">
                <Link
                  to={`/dashboard/products/edit/${product._id}`}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Edytuj produkt
                </Link>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Zmień status
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Usuń produkt
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                {/* Ilość */}
                <div className="flex-shrink-0 w-24">
                  <label htmlFor="quantity" className="sr-only">
                    Ilość
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={product.quantity <= 0}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Dodaj do koszyka */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  Dodaj do koszyka
                </button>
                
                {/* Kup teraz */}
                <button
                  disabled={product.quantity <= 0}
                  className="flex-1 py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary-light hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  Kup teraz
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Certyfikaty i opinie */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex mb-6">
            <button className="px-4 py-2 text-primary border-b-2 border-primary font-medium">
              Szczegóły
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-primary">
              Certyfikaty ({product.certificates?.length || 0})
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-primary">
              Opinie ({product.reviews?.length || 0})
            </button>
          </div>
          
          {/* Kody śledzenia */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Śledzenie produktu</h2>
            <p className="text-gray-700 mb-2">
              Ten produkt posiada unikalny kod śledzenia, który pozwala na weryfikację jego pochodzenia.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Kod śledzenia: <span className="font-medium">{product.trackingId}</span>
              </p>
              <Link
                to={`/tracking/${product.trackingId}`}
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                Sprawdź historię produktu
              </Link>
            </div>
          </div>
          
          {/* Historia statusów (widoczna tylko dla właściciela lub admina) */}
          {canEdit && product.statusHistory && product.statusHistory.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Historia statusów</h2>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notatka
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.statusHistory.map((status, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(status.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {status.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal usuwania produktu */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuń produkt</h2>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć produkt <strong>{product.name}</strong>? Tej operacji nie można cofnąć.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Usuń produkt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal zmiany statusu produktu */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Zmień status produktu</h2>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={statusToChange}
                onChange={(e) => setStatusToChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">Wybierz status</option>
                <option value="available">Dostępny</option>
                <option value="unavailable">Niedostępny</option>
                <option value="preparing">W przygotowaniu</option>
                <option value="shipped">Wysłany</option>
                <option value="delivered">Dostarczony</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Notatka
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Opcjonalna notatka do zmiany statusu..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!statusToChange}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                Zmień status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;