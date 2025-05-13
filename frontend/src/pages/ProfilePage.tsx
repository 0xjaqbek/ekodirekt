import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import { formatDate } from 'shared/utils';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    location: {
      address: '',
      coordinates: [0, 0] as [number, number]
    }
  });
  const [activeTab, setActiveTab] = useState<string>('info');

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userService.getMyProfile();
        
        if (response.success) {
          setProfile(response.user);
          // Initialize form data with current values
          setFormData({
            fullName: response.user.fullName,
            phoneNumber: response.user.phoneNumber || '',
            bio: response.user.bio || '',
            location: {
              address: response.user.location?.address || '',
              coordinates: response.user.location?.coordinates || [0, 0]
            }
          });
        } else {
          setError('Nie udało się pobrać danych profilu');
        }
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd podczas pobierania profilu');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle coordinates change
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseFloat(e.target.value);
    const newCoordinates = [...formData.location.coordinates];
    newCoordinates[index] = value;
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: newCoordinates as [number, number]
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateProfile(formData);
      
      if (response.success) {
        setProfile(response.user);
        setIsEditing(false);
      } else {
        setError(response.message || 'Nie udało się zaktualizować profilu');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas aktualizacji profilu');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        location: {
          address: profile.location?.address || '',
          coordinates: profile.location?.coordinates || [0, 0]
        }
      });
    }
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
          Zaloguj się, aby zobaczyć swój profil.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Twój profil</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile header */}
        <div className="p-6 sm:p-8 bg-primary text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.fullName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-light text-white flex items-center justify-center text-3xl font-bold border-4 border-white">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="ml-0 sm:ml-6 text-center sm:text-left">
              <h2 className="text-xl font-semibold">{profile.fullName}</h2>
              <p className="text-primary-light">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-primary-dark rounded-full text-xs font-medium">
                  {profile.role === 'farmer' ? 'Rolnik' : profile.role === 'consumer' ? 'Konsument' : 'Administrator'}
                </span>
                
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-medium">
                    Zweryfikowany
                  </span>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto mt-4 sm:mt-0 px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100"
              >
                Edytuj profil
              </button>
            )}
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Informacje
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Zamówienia
            </button>
            
            {profile.role === 'farmer' && (
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'products'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Produkty
              </button>
            )}
            
            {profile.role === 'farmer' && (
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'certificates'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Certyfikaty
              </button>
            )}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Profile information */}
          {activeTab === 'info' && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* General information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Informacje ogólne</h3>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                            Imię i nazwisko
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Numer telefonu
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Krótki opis o sobie lub swoim gospodarstwie.
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Lokalizacja</h3>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                            Adres
                          </label>
                          <input
                            type="text"
                            id="location.address"
                            name="location.address"
                            value={formData.location.address}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                              Długość geograficzna
                            </label>
                            <input
                              type="number"
                              id="longitude"
                              name="longitude"
                              step="0.000001"
                              value={formData.location.coordinates[0]}
                              onChange={(e) => handleCoordinateChange(e, 0)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                              Szerokość geograficzna
                            </label>
                            <input
                              type="number"
                              id="latitude"
                              name="latitude"
                              step="0.000001"
                              value={formData.location.coordinates[1]}
                              onChange={(e) => handleCoordinateChange(e, 1)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex justify-end space-x-3">
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
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                      >
                        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informacje ogólne</h3>
                    
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Imię i nazwisko</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.fullName}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Numer telefonu</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.phoneNumber || '—'}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Data rejestracji</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(profile.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bio</h3>
                    <p className="text-sm text-gray-700">
                      {profile.bio || 'Brak informacji o profilu.'}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lokalizacja</h3>
                    
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Adres</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.location?.address || '—'}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Współrzędne</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {profile.location?.coordinates ? (
                            <>
                              {profile.location.coordinates[1].toFixed(6)}, {profile.location.coordinates[0].toFixed(6)}
                            </>
                          ) : (
                            '—'
                          )}
                        </dd>
                      </div>
                    </dl>

                    {/* Simple map placeholder */}
                    {profile.location?.coordinates && (
                      <div className="mt-4 h-48 bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Mapa lokalizacji (do implementacji)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Twoje zamówienia</h3>
                <Link
                  to="/orders"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Zobacz wszystkie
                </Link>
              </div>

              {/* Check if there are orders */}
              {profile.orders && profile.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Zamówienia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wartość
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.orders.slice(0, 5).map((order: any) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'paid' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'delivered' ? 'Dostarczono' :
                               order.status === 'shipped' ? 'Wysłano' :
                               order.status === 'processing' ? 'W przygotowaniu' :
                               order.status === 'paid' ? 'Opłacono' :
                               order.status === 'cancelled' ? 'Anulowano' :
                               'Oczekuje'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.totalPrice.toFixed(2)} PLN
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/orders/${order._id}`} className="text-primary hover:text-primary-dark">
                              Szczegóły
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-gray-600">Brak zamówień.</p>
                </div>
              )}
            </div>
          )}

          {/* Products (for farmers) */}
          {activeTab === 'products' && profile.role === 'farmer' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Twoje produkty</h3>
                <Link
                  to="/dashboard/products"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Zarządzaj produktami
                </Link>
              </div>

              {/* Check if there are products */}
              {profile.createdProducts && profile.createdProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.createdProducts.slice(0, 6).map((product: any) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Status: 
                          <span className={`ml-1 ${
                            product.status === 'available' ? 'text-green-600' :
                            product.status === 'unavailable' ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {product.status === 'available' ? 'Dostępny' : 'Niedostępny'}
                          </span>
                        </p>
                        <p className="mt-1 text-sm font-medium text-primary">{product.price.toFixed(2)} PLN</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-gray-600">Nie masz jeszcze żadnych produktów.</p>
                  <Link
                    to="/dashboard/products/new"
                    className="mt-2 inline-block text-primary hover:text-primary-dark font-medium"
                  >
                    Dodaj pierwszy produkt
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Certificates (for farmers) */}
          {activeTab === 'certificates' && profile.role === 'farmer' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Twoje certyfikaty</h3>
                <Link
                  to="/dashboard/certificates"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Zarządzaj certyfikatami
                </Link>
              </div>

              {/* Check if there are certificates */}
              {profile.certificates && profile.certificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.certificates.map((certificate: any) => (
                    <div key={certificate._id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-light text-white">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{certificate.name}</h4>
                          <p className="mt-1 text-xs text-gray-500">
                            Wystawca: {certificate.issuingAuthority}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Typ: {certificate.type}
                          </p>
                          <p className="mt-1 text-xs">
                            Ważny do: <span className="text-gray-900">{formatDate(certificate.validUntil)}</span>
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              certificate.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {certificate.isVerified ? 'Zweryfikowany' : 'Weryfikacja w toku'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-gray-600">Nie masz jeszcze żadnych certyfikatów.</p>
                  <Link
                    to="/dashboard/certificates"
                    className="mt-2 inline-block text-primary hover:text-primary-dark font-medium"
                  >
                    Dodaj certyfikat
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;