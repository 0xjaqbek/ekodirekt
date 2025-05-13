import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';
import { USER_ROLES, PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, PRODUCT_STATUSES, UNITS } from 'shared/constants';

/**
 * Middleware do obsługi błędów walidacji
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * Walidacja danych rejestracji
 */
export const validateRegister = [
  // Walidacja adresu email
  body('email')
    .isEmail()
    .withMessage('Proszę podać prawidłowy adres email')
    .normalizeEmail(),
  
  // Walidacja hasła
  body('password')
    .isLength({ min: 8 })
    .withMessage('Hasło musi zawierać co najmniej 8 znaków')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Hasło musi zawierać małe i wielkie litery oraz cyfry'),
  
  // Walidacja imienia i nazwiska
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Imię i nazwisko musi zawierać od 2 do 50 znaków'),
  
  // Walidacja roli
  body('role')
    .isIn(USER_ROLES)
    .withMessage('Nieprawidłowa rola użytkownika'),
  
  // Walidacja numeru telefonu
  body('phoneNumber')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/)
    .withMessage('Proszę podać prawidłowy numer telefonu'),
  
  // Walidacja lokalizacji
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Współrzędne muszą zawierać dokładnie 2 wartości [longitude, latitude]'),
  
  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Długość geograficzna musi być wartością od -180 do 180'),
  
  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Szerokość geograficzna musi być wartością od -90 do 90'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adres musi zawierać od 5 do 200 znaków'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych logowania
 */
export const validateLogin = [
  // Walidacja adresu email
  body('email')
    .isEmail()
    .withMessage('Proszę podać prawidłowy adres email')
    .normalizeEmail(),
  
  // Walidacja hasła
  body('password')
    .notEmpty()
    .withMessage('Hasło jest wymagane'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych zmiany hasła
 */
export const validatePasswordChange = [
  // Walidacja aktualnego hasła
  body('currentPassword')
    .notEmpty()
    .withMessage('Aktualne hasło jest wymagane'),
  
  // Walidacja nowego hasła
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nowe hasło musi zawierać co najmniej 8 znaków')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nowe hasło musi zawierać małe i wielkie litery oraz cyfry'),
  
  // Potwierdzenie nowego hasła
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Hasła nie są identyczne');
      }
      return true;
    }),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych resetowania hasła
 */
export const validatePasswordReset = [
  // Walidacja tokenu
  body('token')
    .notEmpty()
    .withMessage('Token jest wymagany'),
  
  // Walidacja nowego hasła
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nowe hasło musi zawierać co najmniej 8 znaków')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nowe hasło musi zawierać małe i wielkie litery oraz cyfry'),
  
  // Potwierdzenie nowego hasła
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Hasła nie są identyczne');
      }
      return true;
    }),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych aktualizacji profilu
 */
export const validateUpdateProfile = [
  // Walidacja imienia i nazwiska
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Imię i nazwisko musi zawierać od 2 do 50 znaków'),
  
  // Walidacja numeru telefonu
  body('phoneNumber')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/)
    .withMessage('Proszę podać prawidłowy numer telefonu'),
  
  // Walidacja bio
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio może zawierać maksymalnie 500 znaków'),
  
  // Walidacja zdjęcia profilowego (URL)
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Zdjęcie profilowe musi być prawidłowym URL'),
  
  // Walidacja współrzędnych lokalizacji
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Współrzędne muszą zawierać dokładnie 2 wartości [longitude, latitude]'),
  
  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Długość geograficzna musi być wartością od -180 do 180'),
  
  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Szerokość geograficzna musi być wartością od -90 do 90'),
  
  // Walidacja adresu lokalizacji
  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adres musi zawierać od 5 do 200 znaków'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych aktualizacji roli użytkownika
 */
export const validateUpdateUserRole = [
  // Walidacja ID użytkownika
  body('userId')
    .notEmpty()
    .withMessage('ID użytkownika jest wymagane')
    .isMongoId()
    .withMessage('Nieprawidłowy format ID użytkownika'),
  
  // Walidacja roli
  body('role')
    .isIn(USER_ROLES)
    .withMessage('Nieprawidłowa rola użytkownika'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja danych aktualizacji statusu weryfikacji
 */
export const validateUpdateVerificationStatus = [
  // Walidacja ID użytkownika
  body('userId')
    .notEmpty()
    .withMessage('ID użytkownika jest wymagane')
    .isMongoId()
    .withMessage('Nieprawidłowy format ID użytkownika'),
  
  // Walidacja statusu weryfikacji
  body('isVerified')
    .isBoolean()
    .withMessage('Status weryfikacji musi być wartością logiczną (true/false)'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja parametrów paginacji i filtrowania listy użytkowników
 */
export const validateUserListQuery = [
  // Walidacja numeru strony
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numer strony musi być liczbą całkowitą większą od 0'),
  
  // Walidacja limitu wyników na stronę
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit wyników na stronę musi być liczbą całkowitą między 1 a 100'),
  
  // Walidacja filtrowania po roli
  query('role')
    .optional()
    .isIn([...USER_ROLES, ''])
    .withMessage('Nieprawidłowa rola użytkownika'),
  
  // Walidacja wyszukiwania
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Fraza wyszukiwania musi zawierać od 2 do 50 znaków'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja tworzenia nowego produktu
 */
export const validateCreateProduct = [
  // Nazwa produktu
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nazwa produktu musi zawierać od 3 do 100 znaków'),
  
  // Opis produktu
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Opis produktu musi zawierać od 10 do 1000 znaków'),
  
  // Cena produktu
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Cena musi być liczbą większą od 0'),
  
  // Ilość produktu
  body('quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Ilość musi być liczbą większą od 0'),
  
  // Jednostka miary
  body('unit')
    .isIn(UNITS)
    .withMessage('Nieprawidłowa jednostka miary'),
  
  // Kategoria produktu
  body('category')
    .isIn(PRODUCT_CATEGORIES)
    .withMessage('Nieprawidłowa kategoria produktu'),
  
  // Podkategoria produktu (opcjonalna)
  body('subcategory')
    .optional()
    .custom((value, { req }) => {
      const category = req.body.category;
      if (!category || !PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES]) {
        throw new Error('Najpierw wybierz prawidłową kategorię');
      }
      
      if (!PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES].includes(value)) {
        throw new Error('Nieprawidłowa podkategoria dla wybranej kategorii');
      }
      
      return true;
    }),
  
  // Lokalizacja (opcjonalna - jeśli nie podano, użyj lokalizacji rolnika)
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Współrzędne muszą zawierać dokładnie 2 wartości [longitude, latitude]'),
  
  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Długość geograficzna musi być wartością od -180 do 180'),
  
  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Szerokość geograficzna musi być wartością od -90 do 90'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adres musi zawierać od 5 do 200 znaków'),
  
  // Data zbioru (opcjonalna)
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Data zbioru musi być w formacie ISO 8601'),
  
  // Certyfikaty (opcjonalne)
  body('certificates')
    .optional()
    .isArray()
    .withMessage('Certyfikaty muszą być tablicą identyfikatorów'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja aktualizacji produktu
 */
export const validateUpdateProduct = [
  // Nazwa produktu (opcjonalna)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nazwa produktu musi zawierać od 3 do 100 znaków'),
  
  // Opis produktu (opcjonalny)
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Opis produktu musi zawierać od 10 do 1000 znaków'),
  
  // Cena produktu (opcjonalna)
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Cena musi być liczbą większą od 0'),
  
  // Ilość produktu (opcjonalna)
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ilość musi być liczbą nieujemną'),
  
  // Jednostka miary (opcjonalna)
  body('unit')
    .optional()
    .isIn(UNITS)
    .withMessage('Nieprawidłowa jednostka miary'),
  
  // Kategoria produktu (opcjonalna)
  body('category')
    .optional()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage('Nieprawidłowa kategoria produktu'),
  
  // Podkategoria produktu (opcjonalna)
  body('subcategory')
    .optional()
    .custom((value, { req }) => {
      const category = req.body.category;
      if (!category) {
        // Jeśli nie podano kategorii w aktualizacji, nie możemy zweryfikować podkategorii
        return true;
      }
      
      if (!PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES]) {
        throw new Error('Nieprawidłowa kategoria');
      }
      
      if (!PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES].includes(value)) {
        throw new Error('Nieprawidłowa podkategoria dla wybranej kategorii');
      }
      
      return true;
    }),
  
  // Status produktu (opcjonalny)
  body('status')
    .optional()
    .isIn(PRODUCT_STATUSES)
    .withMessage('Nieprawidłowy status produktu'),
  
  // Notatka do zmiany statusu (opcjonalna)
  body('statusNote')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notatka może zawierać maksymalnie 200 znaków'),
  
  // Flaga zastąpienia zdjęć (opcjonalna)
  body('replaceImages')
    .optional()
    .isBoolean()
    .withMessage('Flaga replaceImages musi być wartością logiczną (true/false)'),
  
  // Lokalizacja (opcjonalna)
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Współrzędne muszą zawierać dokładnie 2 wartości [longitude, latitude]'),
  
  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Długość geograficzna musi być wartością od -180 do 180'),
  
  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Szerokość geograficzna musi być wartością od -90 do 90'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adres musi zawierać od 5 do 200 znaków'),
  
  // Data zbioru (opcjonalna)
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Data zbioru musi być w formacie ISO 8601'),
  
  // Certyfikaty (opcjonalne)
  body('certificates')
    .optional()
    .isArray()
    .withMessage('Certyfikaty muszą być tablicą identyfikatorów'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja aktualizacji statusu produktu
 */
export const validateProductStatusUpdate = [
  // Status produktu
  body('status')
    .isIn(PRODUCT_STATUSES)
    .withMessage('Nieprawidłowy status produktu'),
  
  // Notatka do zmiany statusu (opcjonalna)
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notatka może zawierać maksymalnie 200 znaków'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja parametrów zapytania dla listy produktów
 */
export const validateProductQueryParams = [
  // Kategoria (opcjonalna)
  query('category')
    .optional()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage('Nieprawidłowa kategoria produktu'),
  
  // Podkategoria (opcjonalna)
  query('subcategory')
    .optional()
    .custom((value, { req }) => {
      const category = req.query.category as string;
      if (!category) {
        // Jeśli nie podano kategorii, nie możemy zweryfikować podkategorii
        return true;
      }
      
      if (!PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES]) {
        throw new Error('Nieprawidłowa kategoria');
      }
      
      if (!PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES].includes(value)) {
        throw new Error('Nieprawidłowa podkategoria dla wybranej kategorii');
      }
      
      return true;
    }),
  
  // Certyfikowane produkty (opcjonalne)
  query('isCertified')
    .optional()
    .isBoolean()
    .withMessage('Parametr isCertified musi być wartością logiczną (true/false)'),
  
  // Minimalna cena (opcjonalna)
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimalna cena musi być liczbą nieujemną'),
  
  // Maksymalna cena (opcjonalna)
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maksymalna cena musi być liczbą nieujemną')
    .custom((maxPrice, { req }) => {
      const minPrice = parseFloat(req.query.minPrice as string);
      if (minPrice && parseFloat(maxPrice) < minPrice) {
        throw new Error('Maksymalna cena nie może być mniejsza niż minimalna cena');
      }
      return true;
    }),
  
  // Promień (opcjonalny)
  query('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Promień musi być liczbą całkowitą między 1 a 500 km'),
  
  // Współrzędne (opcjonalne)
  query('coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Współrzędne muszą zawierać dokładnie 2 wartości [longitude, latitude]'),
  
  // Sortowanie (opcjonalne)
  query('sortBy')
    .optional()
    .isIn(['price', 'rating', 'date', 'distance', 'createdAt'])
    .withMessage('Nieprawidłowa wartość sortowania'),
  
  // Kierunek sortowania (opcjonalny)
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Kierunek sortowania musi być "asc" lub "desc"'),
  
  // Paginacja (opcjonalna)
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numer strony musi być liczbą całkowitą większą od 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit wyników na stronę musi być liczbą całkowitą między 1 a 100'),
  
  // Wyszukiwanie (opcjonalne)
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Fraza wyszukiwania musi zawierać od 2 do 50 znaków'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];

/**
 * Walidacja usuwania zdjęcia produktu
 */
export const validateRemoveProductImage = [
  body('imageUrl')
    .notEmpty()
    .withMessage('URL zdjęcia jest wymagany')
    .isURL()
    .withMessage('Nieprawidłowy format URL zdjęcia'),
  
  // Obsługa błędów walidacji
  handleValidationErrors,
];