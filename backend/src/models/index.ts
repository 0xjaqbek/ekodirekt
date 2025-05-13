import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, CERTIFICATE_TYPES, ORDER_STATUSES, PAYMENT_STATUSES, PRODUCT_STATUSES, USER_ROLES, REVIEW_MODERATION_STATUSES, LOCAL_GROUP_MEMBER_ROLES, UNITS } from 'shared/constants';
import { initAuthModels } from './auth';
import { initUserModelExtensions } from './userExtensions';

// Eksport wszystkich modeli
export { default as User, UserDocument } from './User';
export { default as Product, ProductDocument } from './Product';
export { default as Order, OrderDocument } from './Order';
export { default as Certificate, CertificateDocument } from './Certificate';
export { default as Review, ReviewDocument } from './Review';
export { default as LocalGroup, LocalGroupDocument } from './LocalGroup';

// Funkcja do inicjalizacji połączenia z bazą danych
export const connectToDatabase = async (uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekodirekt'): Promise<mongoose.Connection> => {
  try {
    await mongoose.connect(uri);
    console.info('Połączenie z bazą danych nawiązane pomyślnie.');
    
    // Dodanie walidatorów na podstawie stałych
    addCustomValidators();
    
    // Inicjalizacja rozszerzeń modeli
    initAuthModels();
    initUserModelExtensions();
    
    return mongoose.connection;
  } catch (error) {
    console.error('Błąd podczas łączenia z bazą danych:', error);
    throw error;
  }
};

// Funkcja do dodawania niestandardowych walidatorów Mongoose
const addCustomValidators = () => {
  // Walidator dla kategorii produktów
  mongoose.Schema.Types.String.validate(function validateProductCategory(value: string) {
    if (this.path === 'category') {
      return PRODUCT_CATEGORIES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowa kategoria produktu!');
  
  // Walidator dla podkategorii produktów
  mongoose.Schema.Types.String.validate(function validateProductSubcategory(value: string) {
    if (this.path === 'subcategory' && this.parent?.category) {
      const category = this.parent.category as keyof typeof PRODUCT_SUBCATEGORIES;
      return PRODUCT_SUBCATEGORIES[category].includes(value as any);
    }
    return true;
  }, 'Nieprawidłowa podkategoria dla wybranej kategorii!');
  
  // Walidator dla typów certyfikatów
  mongoose.Schema.Types.String.validate(function validateCertificateType(value: string) {
    if (this.path === 'type') {
      return CERTIFICATE_TYPES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowy typ certyfikatu!');
  
  // Walidator dla statusów zamówień
  mongoose.Schema.Types.String.validate(function validateOrderStatus(value: string) {
    if (this.path === 'status' && this.schema.path('status').instance === 'String') {
      return ORDER_STATUSES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowy status zamówienia!');
  
  // Walidator dla statusów płatności
  mongoose.Schema.Types.String.validate(function validatePaymentStatus(value: string) {
    if (this.path === 'paymentStatus') {
      return PAYMENT_STATUSES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowy status płatności!');
  
  // Walidator dla statusów produktów
  mongoose.Schema.Types.String.validate(function validateProductStatus(value: string) {
    if (this.path === 'status' && this.schema.path('product')) {
      return PRODUCT_STATUSES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowy status produktu!');
  
  // Walidator dla ról użytkowników
  mongoose.Schema.Types.String.validate(function validateUserRole(value: string) {
    if (this.path === 'role') {
      return USER_ROLES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowa rola użytkownika!');
  
  // Walidator dla statusów moderacji recenzji
  mongoose.Schema.Types.String.validate(function validateModerationStatus(value: string) {
    if (this.path === 'moderationStatus') {
      return REVIEW_MODERATION_STATUSES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowy status moderacji!');
  
  // Walidator dla ról członków grup lokalnych
  mongoose.Schema.Types.String.validate(function validateMemberRole(value: string) {
    if (this.path === 'role' && this.schema.path('user')) {
      return LOCAL_GROUP_MEMBER_ROLES.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowa rola członka grupy!');
  
  // Walidator dla jednostek miary
  mongoose.Schema.Types.String.validate(function validateUnit(value: string) {
    if (this.path === 'unit') {
      return UNITS.includes(value as any);
    }
    return true;
  }, 'Nieprawidłowa jednostka miary!');
};

// Funkcja do zamknięcia połączenia z bazą danych
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.info('Połączenie z bazą danych zamknięte pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas zamykania połączenia z bazą danych:', error);
    throw error;
  }
};

// Eksport instancji połączenia
export const db = mongoose.connection;

// Nasłuchiwanie zdarzeń połączenia
db.on('error', console.error.bind(console, 'Błąd połączenia z MongoDB:'));
db.once('open', () => {
  console.info('MongoDB połączone.');
});
db.on('disconnected', () => {
  console.info('MongoDB rozłączone.');
});

// Obsługa zamknięcia aplikacji
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});