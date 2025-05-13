import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, UNITS } from 'shared/constants';
import { useAuth } from '../hooks/useAuth';

/**
 * Formularz dodawania/edycji produktu
 */
const ProductForm: React.FC<{ productId?: string; existingProduct?: any }> = ({ 
  productId, 
  existingProduct 
}) => {
  const navigate = useNavigate();
  const { createProduct, updateProduct, loading, error } = useProducts({ autoLoad: false });
  const { user } = useAuth();
  
  // Stan formularza
  const [formData, setFormData] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    price: existingProduct?.price || '',
    quantity: existingProduct?.quantity || '',
    unit: existingProduct?.unit || 'kg',
    category: existingProduct?.category || '',
    subcategory: existingProduct?.subcategory || '',
    harvestDate: existingProduct?.harvestDate ? new Date(existingProduct.harvestDate).toISOString().split('T')[0] : '',
  });
  
  // Stan dla lokalizacji
  const [useCustomLocation, setUseCustomLocation] = useState(!!existingProduct?.location);
  const [location, setLocation] = useState({
    coordinates: existingProduct?.location?.coordinates || [0, 0],
    address: existingProduct?.location?.address || '',
  });
  
  // Stan dla plików zdjęć
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(existingProduct?.images || []);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  
  // Stan dla certyfikatów
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>(
    existingProduct?.certificates?.map((cert: any) => cert._id) || []
  );
  
  // Stan dla błędów walidacji
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pobieranie dostępnych podkategorii na podstawie wybranej kategorii
  const availableSubcategories = formData.category 
    ? PRODUCT_SUBCATEGORIES[formData.category as keyof typeof PRODUCT_SUBCATEGORIES] || []
    : [];
  
  /**
   * Obsługa zmiany pól formularza
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Aktualizacja formData
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Resetuj błąd walidacji dla zmienionego pola
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
    
    // Jeśli zmieniono kategorię, resetuj podkategorię
    if (name === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };
  
  /**
   * Obsługa zmiany pól lokalizacji
   */
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      const index = name === 'lng' ? 0 : 1;
      const newCoordinates = [...location.coordinates];
      newCoordinates[index] = parseFloat(value) || 0;
      
      setLocation(prev => ({ 
        ...prev, 
        coordinates: newCoordinates as [number, number]
      }));
    } else if (name === 'address') {
      setLocation(prev => ({ ...prev, address: value }));
    }
  };
  
  /**
   * Obsługa zmiany plików zdjęć
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };
  
  /**
   * Usunięcie wybranego pliku
   */
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  /**
   * Dodanie/usunięcie istniejącego zdjęcia do listy do usunięcia
   */
  const toggleImageRemoval = (imageUrl: string) => {
    if (imagesToRemove.includes(imageUrl)) {
      setImagesToRemove(prev => prev.filter(url => url !== imageUrl));
    } else {
      setImagesToRemove(prev => [...prev, imageUrl]);
    }
  };
  
  /**
   * Obsługa zmiany certyfikatów
   */
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedCertificates(prev => [...prev, value]);
    } else {
      setSelectedCertificates(prev => prev.filter(id => id !== value));
    }
  };
  
  /**
   * Walidacja formularza
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Walidacja wymaganych pól
    if (!formData.name) errors.name = 'Nazwa produktu jest wymagana';
    else if (formData.name.length < 3) errors.name = 'Nazwa musi mieć co najmniej 3 znaki';
    
    if (!formData.description) errors.description = 'Opis produktu jest wymagany';
    else if (formData.description.length < 10) errors.description = 'Opis musi mieć co najmniej 10 znaków';
    
    if (!formData.price) errors.price = 'Cena jest wymagana';
    else if (parseFloat(formData.price) <= 0) errors.price = 'Cena musi być większa od 0';
    
    if (!formData.quantity) errors.quantity = 'Ilość jest wymagana';
    else if (parseFloat(formData.quantity) <= 0) errors.quantity = 'Ilość musi być większa od 0';
    
    if (!formData.unit) errors.unit = 'Jednostka miary jest wymagana';
    
    if (!formData.category) errors.category = 'Kategoria jest wymagana';
    
    // Walidacja podkategorii tylko jeśli wybrano kategorię i są dostępne podkategorie
    if (formData.category && availableSubcategories.length > 0 && !formData.subcategory) {
      errors.subcategory = 'Podkategoria jest wymagana';
    }
    
    // Walidacja lokalizacji jeśli używana jest niestandardowa lokalizacja
    if (useCustomLocation) {
      const [lng, lat] = location.coordinates;
      
      if (lat < -90 || lat > 90) errors.lat = 'Szerokość geograficzna musi być między -90 a 90';
      if (lng < -180 || lng > 180) errors.lng = 'Długość geograficzna musi być między -180 a 180';
      if (!location.address) errors.address = 'Adres jest wymagany';
    }
    
    // Walidacja zdjęć
    if (!existingProduct && selectedFiles.length === 0) {
      errors.images = 'Dodaj co najmniej jedno zdjęcie produktu';
    }
    
    if (existingProduct && imagesToRemove.length === existingImages.length && selectedFiles.length === 0) {
      errors.images = 'Produkt musi mieć co najmniej jedno zdjęcie';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Przygotowanie danych do wysłania na serwer
   */
  const prepareFormData = () => {
    const formDataToSend = new FormData();
    
    // Dodaj podstawowe dane produktu
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('unit', formData.unit);
    formDataToSend.append('category', formData.category);
    
    if (formData.subcategory) {
      formDataToSend.append('subcategory', formData.subcategory);
    }
    
    if (formData.harvestDate) {
      formDataToSend.append('harvestDate', new Date(formData.harvestDate).toISOString());
    }
    
    // Dodaj lokalizację jeśli używana jest niestandardowa
    if (useCustomLocation) {
      formDataToSend.append('location[coordinates][0]', location.coordinates[0].toString());
      formDataToSend.append('location[coordinates][1]', location.coordinates[1].toString());
      formDataToSend.append('location[address]', location.address);
    }
    
    // Dodaj pliki zdjęć
    selectedFiles.forEach(file => {
      formDataToSend.append('images', file);
    });
    
    // Dodaj listę zdjęć do usunięcia (tylko przy aktualizacji)
    if (existingProduct && imagesToRemove.length > 0) {
      formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove));
    }
    
    // Dodaj certyfikaty
    if (selectedCertificates.length > 0) {
      selectedCertificates.forEach(certId => {
        formDataToSend.append('certificates[]', certId);
      });
    }
    
    return formDataToSend;
  };
  
  /**
   * Obsługa wysłania formularza
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja formularza
    if (!validateForm()) return;
    
    // Przygotuj dane formularza
    const formDataToSend = prepareFormData();
    
    try {
      if (existingProduct && productId) {
        // Aktualizacja istniejącego produktu
        await updateProduct(productId, formDataToSend);
      } else {
        // Dodanie nowego produktu
        await createProduct(formDataToSend);
      }
      
      // Przekieruj do szczegółów produktu lub listy produktów
      navigate('/dashboard/products');
    } catch (error) {
      console.error('Błąd podczas zapisywania produktu:', error);
    }
  };
  
  /**
   * Anuluj edycję/dodawanie i wróć do listy
   */
  const handleCancel = () => {
    navigate(-1);
  };
  
  // Sprawdź, czy użytkownik jest rolnikiem
  if (user && user.role !== 'farmer' && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 rounded-lg mt-10">
        <h2 className="text-xl font-semibold text-red-700">Brak uprawnień</h2>
        <p className="mt-2">Tylko rolnicy mogą dodawać i edytować produkty.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-primary mb-6">
        {existingProduct ? 'Edytuj produkt' : 'Dodaj nowy produkt'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nazwa produktu */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nazwa produktu *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
              validationErrors.name ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>
        
        {/* Opis produktu */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Opis produktu *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
              validationErrors.description ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>
        
        {/* Cena i ilość */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Cena (PLN) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                validationErrors.price ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.price && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Ilość *
            </label>
            <div className="flex">
              <input
                type="number"
                id="quantity"
                name="quantity"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  validationErrors.quantity ? 'border-red-500' : ''
                }`}
              />
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="mt-1 block rounded-r-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            {validationErrors.quantity && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
            )}
          </div>
        </div>
        
        {/* Kategoria i podkategoria */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Kategoria *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                validationErrors.category ? 'border-red-500' : ''
              }`}
            >
              <option value="">Wybierz kategorię</option>
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
              Podkategoria {availableSubcategories.length > 0 && '*'}
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={!formData.category || availableSubcategories.length === 0}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                validationErrors.subcategory ? 'border-red-500' : ''
              }`}
            >
              <option value="">Wybierz podkategorię</option>
              {availableSubcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
            {validationErrors.subcategory && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.subcategory}</p>
            )}
          </div>
        </div>
        
        {/* Data zbioru */}
        <div>
          <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
            Data zbioru
          </label>
          <input
            type="date"
            id="harvestDate"
            name="harvestDate"
            value={formData.harvestDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        {/* Lokalizacja */}
        <div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="useCustomLocation"
              checked={useCustomLocation}
              onChange={() => setUseCustomLocation(!useCustomLocation)}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="useCustomLocation" className="ml-2 block text-sm font-medium text-gray-700">
              Użyj innej lokalizacji niż adres gospodarstwa
            </label>
          </div>
          
          {useCustomLocation && (
            <div className="space-y-3 p-3 border border-gray-200 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
                    Szerokość geograficzna *
                  </label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    step="0.000001"
                    value={location.coordinates[1]}
                    onChange={handleLocationChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                      validationErrors.lat ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.lat && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.lat}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700">
                    Długość geograficzna *
                  </label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    step="0.000001"
                    value={location.coordinates[0]}
                    onChange={handleLocationChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                      validationErrors.lng ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.lng && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.lng}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adres *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={location.address}
                  onChange={handleLocationChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                    validationErrors.address ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Zdjęcia */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Zdjęcia produktu *
          </label>
          
          {/* Istniejące zdjęcia (przy edycji) */}
          {existingImages.length > 0 && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-500 mb-2">Obecne zdjęcia:</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    className={`relative rounded-md overflow-hidden ${
                      imagesToRemove.includes(imageUrl) ? 'opacity-50' : ''
                    }`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Product ${index}`} 
                      className="w-full h-24 object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => toggleImageRemoval(imageUrl)}
                      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        imagesToRemove.includes(imageUrl) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {imagesToRemove.includes(imageUrl) ? '↻' : '×'}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Kliknij na zdjęcie, aby {imagesToRemove.length > 0 ? 'przywrócić' : 'usunąć'}.
              </p>
            </div>
          )}
          
          {/* Dodawanie nowych zdjęć */}
          <div className="mt-2">
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary"
            />
            
            {/* Podgląd wybranych plików */}
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Wybrane zdjęcia:</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`New ${index}`} 
                        className="w-full h-24 object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {validationErrors.images && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.images}</p>
            )}
          </div>
        </div>
        
        {/* Certyfikaty */}
        {/* Tu powinien być komponent do wyboru certyfikatów rolnika */}
        {/* Uproszczona wersja: */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certyfikaty ekologiczne
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Ta sekcja będzie zawierać wybór certyfikatów rolnika.
          </p>
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : existingProduct ? 'Zapisz zmiany' : 'Dodaj produkt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;