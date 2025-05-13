import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold text-primary">EkoDirekt</h2>
            </Link>
            <p className="mt-4 text-gray-600">
              Platforma łącząca ekologicznych rolników bezpośrednio z konsumentami, 
              skracająca łańcuch dostaw i promująca zrównoważone rolnictwo.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-primary" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-primary" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.067-.06-1.407-.06-4.123v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.944 2.013 9.284 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-primary" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Nawigacja</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary">
                  Strona główna
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary">
                  Produkty
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary">
                  O nas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Dla rolników</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dashboard/overview" className="text-gray-600 hover:text-primary">
                  Panel rolnika
                </Link>
              </li>
              <li>
                <Link to="/dashboard/products/new" className="text-gray-600 hover:text-primary">
                  Dodaj produkt
                </Link>
              </li>
              <li>
                <Link to="/dashboard/certificates" className="text-gray-600 hover:text-primary">
                  Zarządzaj certyfikatami
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Bądź na bieżąco</h3>
            <p className="mt-4 text-gray-600">
              Zapisz się, aby otrzymywać informacje o aktualnych produktach w Twojej okolicy.
            </p>
            <div className="mt-4">
              <form className="flex flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Twój adres email"
                  className="px-4 py-2 w-full rounded-md border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="mt-2 sm:mt-0 sm:ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Zapisz się
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright & Terms */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} EkoDirekt. Wszelkie prawa zastrzeżone.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary">
              Polityka prywatności
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary">
              Warunki korzystania
            </Link>
            <Link to="/cookies" className="text-sm text-gray-500 hover:text-primary">
              Polityka cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;