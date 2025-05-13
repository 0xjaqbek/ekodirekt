import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/cartDrawer';
import { useCartStore } from '../stores/cartStore';

const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isCartOpen = useCartStore(state => state.isOpen);
  
  // Sprawdź, czy strona ma się przewijać czy pozostać zablokowana (np. gdy koszyk jest otwarty)
  React.useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Przewiń na górę strony przy zmianie ścieżki
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Koszyk jako drawer */}
      <CartDrawer />
    </div>
  );
};

export default MainLayout;