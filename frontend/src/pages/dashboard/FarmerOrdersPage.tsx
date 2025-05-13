import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from 'shared/utils';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import apiClient from '../../services/apiClient';

interface Order {
  _id: string;
  buyer: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
      owner: {
        _id: string;
        fullName: string;
      };
    };
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalPrice: number;
  status: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentStatus: string;
  createdAt: string;
  farmerTotal?: number; // Total for this farmer's products only
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const FarmerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch farmer orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const status = activeTab !== 'all' ? activeTab : undefined;
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        if (status) params.append('status', status);

        const response = await apiClient.get<OrdersResponse>(`/api/orders/farmer?${params.toString()}`);
        
        if (response.data.success) {
          setOrders(response.data.orders);
          setPagination(response.data.pagination);
        } else {
          setError('Nie udało się pobrać zamówień');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania zamówień');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, activeTab, pagination.page, pagination.limit]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle status update
  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
    setIsStatusModalOpen(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setStatusUpdating(true);
      
      const response = await apiClient.put(`/api/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote
      });

      if (response.data.success) {
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, status: newStatus } 
              : order
          )
        );
        setIsStatusModalOpen(false);
      } else {
        setError('Nie udało się zaktualizować statusu zamówienia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji statusu');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Oczekujące</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Opłacone</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">W realizacji</span>;
      case 'shipped':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Wysłane</span>;
      case 'delivered':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Dostarczone</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Anulowane</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Oczekująca</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Zakończona</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Nieudana</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Zwrócona</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get next available status options based on current status
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'paid':
        return ['processing'];
      case 'processing':
        return ['shipped'];
      case 'shipped':
        return ['delivered'];
      default:
        return [];
    }
  };

  // Check if user is farmer
  if (user && user.role !== 'farmer' && user.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Brak uprawnień</h2>
        <p className="text-gray-700">Ta strona jest dostępna tylko dla rolników.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Zamówienia</h1>
        <p className="text-gray-600 mt-1">Zarządzaj zamówieniami Twoich produktów</p>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          <button
            onClick={() => handleTabChange('all')}
            className={`py-4 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => handleTabChange('paid')}
            className={`py-4 px-4 text-sm font-medium ${
              activeTab === 'paid'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Opłacone
          </button>
          <button
            onClick={() => handleTabChange('processing')}
            className={`py-4 px-4 text-sm font-medium ${
              activeTab === 'processing'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            W realizacji
          </button>
          <button
            onClick={() => handleTabChange('shipped')}
            className={`py-4 px-4 text-sm font-medium ${
              activeTab === 'shipped'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wysłane
          </button>
          <button
            onClick={() => handleTabChange('delivered')}
            className={`py-4 px-4 text-sm font-medium ${
              activeTab === 'delivered'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dostarczone
          </button>
        </nav>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mt-4 mx-6 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-6 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Brak zamówień</h3>
          <p className="mt-1 text-sm text-gray-500">
            Nie znaleziono zamówień spełniających kryteria.
          </p>
        </div>
      ) : (
        <>
          {/* Orders table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Zamówienia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {order.buyer.profileImage ? (
                          <img
                            src={order.buyer.profileImage}
                            alt={order.buyer.fullName}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">{order.buyer.fullName.charAt(0)}</span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {order.buyer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{order.buyer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items
                          .filter(item => item.product.owner._id === user?._id)
                          .map((item, index, arr) => (
                            <span key={`${order._id}-${item.product._id}`}>
                              {item.quantity} × {item.product.name}
                              {index < arr.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.farmerTotal && formatPrice(order.farmerTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(order.status)}
                        <div className="text-xs text-gray-500">
                          Płatność: {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          Szczegóły
                        </Link>
                        {getNextStatusOptions(order.status).length > 0 && (
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-primary hover:text-primary-dark"
                          >
                            Zmień status
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Pokazuje <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> do{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    z <span className="font-medium">{pagination.total}</span> wyników
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Poprzednia</span>
                      &laquo;
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-primary text-white border-primary'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Następna</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status update modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Zmień status zamówienia
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Aktualny status: {getStatusBadge(selectedOrder.status)}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Nowy status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="">Wybierz status</option>
                        {getNextStatusOptions(selectedOrder.status).map((status) => (
                          <option key={status} value={status}>
                            {status === 'processing' && 'W realizacji'}
                            {status === 'shipped' && 'Wysłane'}
                            {status === 'delivered' && 'Dostarczone'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                        Notatka (opcjonalnie)
                      </label>
                      <textarea
                        id="note"
                        name="note"
                        rows={3}
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="mt-1 block w-full sm:text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        placeholder="Dodaj notatkę do zmiany statusu..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={updateOrderStatus}
                  disabled={!newStatus || statusUpdating}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusUpdating ? 'Aktualizacja...' : 'Aktualizuj status'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrdersPage;