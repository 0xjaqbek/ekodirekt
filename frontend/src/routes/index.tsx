import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Protected Routes
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ContactPage from '../pages/ContactPage';
import AboutPage from '../pages/AboutPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductTrackingPage from '../pages/ProductTrackingPage';
import FarmerProfilePage from '../pages/FarmerProfilePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Protected Pages
import ProfilePage from '../pages/ProfilePage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';

// Farmer Dashboard Pages
import FarmerDashboardPage from '../pages/dashboard/FarmerDashboardPage';
import FarmerProductsPage from '../pages/dashboard/FarmerProductsPage';
import FarmerOrdersPage from '../pages/dashboard/FarmerOrdersPage';
import FarmerAddProductPage from '../pages/dashboard/FarmerAddProductPage';
import FarmerEditProductPage from '../pages/dashboard/FarmerEditProductPage';
import FarmerCertificatesPage from '../pages/dashboard/FarmerCertificatesPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/farmers/:id" element={<FarmerProfilePage />} />
        <Route path="/tracking/:trackingId" element={<ProductTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes for All Authenticated Users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        {/* Protected Routes for Consumers */}
        <Route element={<ProtectedRoute allowedRoles={['consumer', 'admin']} />}>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>

      {/* Dashboard Layout Routes */}
      <Route element={<ProtectedRoute allowedRoles={['farmer', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          {/* Farmer Dashboard Routes */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/dashboard/overview" element={<FarmerDashboardPage />} />
          <Route path="/dashboard/products" element={<FarmerProductsPage />} />
          <Route path="/dashboard/products/new" element={<FarmerAddProductPage />} />
          <Route path="/dashboard/products/edit/:id" element={<FarmerEditProductPage />} />
          <Route path="/dashboard/orders" element={<FarmerOrdersPage />} />
          <Route path="/dashboard/certificates" element={<FarmerCertificatesPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;