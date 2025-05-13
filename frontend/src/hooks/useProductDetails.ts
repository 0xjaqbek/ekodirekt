import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook do zarządzania szczegółami produktu
 */
export const useProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProductStatus, deleteProduct, loading: productsLoading, error: productsError } = useProducts({ autoLoad: false });
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sprawdź czy zalogowany użytkownik jest właścicielem produktu
  const isOwner = user && product && user._id === product.owner._id;
  
  // Sprawdź czy zalogowany użytkownik jest adminem
  const isAdmin = user && user.role === 'admin';
  
  // Sprawdź czy zalogowany użytkownik może edytować produkt
  const canEdit = isOwner || isAdmin;
  
  // Pobierz szczegóły produktu
  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);
  
  /**
   * Pobierz szczegóły produktu
   */
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await getProductById(id!);
      
      if (productData) {
        setProduct(productData);
      } else {
        setError('Nie udało się pobrać szczegółów produktu');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas pobierania szczegółów produktu');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Aktualizuj status produktu
   */
  const changeProductStatus = async (status: string, note?: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedProduct = await updateProductStatus(id, status, note);
      
      if (updatedProduct) {
        setProduct(updatedProduct);
        return true;
      } else {
        setError('Nie udało się zaktualizować statusu produktu');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas aktualizacji statusu produktu');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Usuń produkt
   */
  const removeProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const success = await deleteProduct(id);
      
      if (success) {
        // Po pomyślnym usunięciu przejdź do listy produktów
        navigate('/products');
        return true;
      } else {
        setError('Nie udało się usunąć produktu');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas usuwania produktu');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    product,
    loading: loading || productsLoading,
    error: error || productsError,
    isOwner,
    isAdmin,
    canEdit,
    loadProduct,
    changeProductStatus,
    removeProduct,
  };
};