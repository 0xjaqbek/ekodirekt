import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-primary text-white transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">Panel Rolnika</span>
            <button 
              onClick={toggleSidebar}
              className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
            >
              <svg 
                className="h-6 w-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="mt-8 flex items-center">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.fullName} 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-white">
                {user?.fullName.charAt(0)}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs opacity-75">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 space-y-1">
            <NavLink 
              to="/dashboard/overview" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive 
                    ? 'bg-primary-dark text-white' 
                    : 'text-white hover:bg-primary-light'
                }`
              }
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Przegląd
            </NavLink>
            
            <NavLink 
              to="/dashboard/products" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive 
                    ? 'bg-primary-dark text-white' 
                    : 'text-white hover:bg-primary-light'
                }`
              }
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Produkty
            </NavLink>
            
            <NavLink 
              to="/dashboard/orders" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive 
                    ? 'bg-primary-dark text-white' 
                    : 'text-white hover:bg-primary-light'
                }`
              }
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Zamówienia
            </NavLink>
            
            <NavLink 
              to="/dashboard/certificates" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive 
                    ? 'bg-primary-dark text-white' 
                    : 'text-white hover:bg-primary-light'
                }`
              }
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Certyfikaty
            </NavLink>
          </nav>
        </div>

        {/* Dashboard actions */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="space-y-2">
            <Link 
              to="/profile" 
              className="flex w-full items-center rounded-md px-4 py-2 text-sm text-white hover:bg-primary-light"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Profil
            </Link>
            
            <Link 
              to="/" 
              className="flex w-full items-center rounded-md px-4 py-2 text-sm text-white hover:bg-primary-light"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" clipRule="evenodd" />
              </svg>
              Strona główna
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-4 py-2 text-sm text-white hover:bg-primary-light"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 11-2 0 1 1 0 012 0zm-8.489 1a.5.5 0 10-.998-.064l-.5 7.5a.5.5 0 10.998.064l.5-7.5zm8.982 0a.5.5 0 10-.996-.087l-.292 3.5a.5.5 0 10.996.087l.292-3.5zm-7.739 7.8a.5.5 0 10-.994.098l.5 5a.5.5 0 00.994-.098l-.5-5z" clipRule="evenodd" />
              </svg>
              Wyloguj
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button 
                  onClick={toggleSidebar}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
                >
                  <svg 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Right side links/actions */}
              <div className="flex items-center space-x-4">
                <Link to="/dashboard/products/new" className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:inline-block">
                  Dodaj produkt
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;