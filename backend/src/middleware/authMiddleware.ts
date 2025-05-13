import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService';
import { User } from '../models';

// Rozszerzenie interfejsu Request Express, aby zawierał dane zalogowanego użytkownika
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware do weryfikacji tokenu JWT (zabezpieczenie endpointów)
 * Pobiera token z nagłówka Authorization, weryfikuje go i dodaje dane użytkownika do obiektu request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pobierz token z nagłówka Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Brak tokenu autoryzacji' });
    }
    
    // Wyciągnij token z nagłówka (format: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];
    
    // Weryfikuj token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy token lub token wygasł' });
    }
    
    // Sprawdź czy użytkownik istnieje
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy token - użytkownik nie istnieje' });
    }
    
    // Dodaj dane użytkownika do obiektu request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    
    // Przejdź do następnego middleware'a
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Błąd autoryzacji' });
  }
};

/**
 * Middleware do weryfikacji roli użytkownika
 * @param roles - tablica ról, które mają dostęp do zasobu
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sprawdź czy użytkownik został uwierzytelniony
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
    }
    
    // Sprawdź czy rola użytkownika jest dozwolona
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do wykonania tej operacji' 
      });
    }
    
    // Użytkownik ma uprawnienia - przejdź dalej
    next();
  };
};

/**
 * Middleware do weryfikacji własności zasobu
 * Sprawdza czy użytkownik jest właścicielem zasobu lub ma rolę admina
 * @param getResourceOwner - funkcja zwracająca ID właściciela zasobu na podstawie req
 */
export const isOwnerOrAdmin = (getResourceOwner: (req: Request) => Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sprawdź czy użytkownik został uwierzytelniony
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
      }
      
      // Admin ma dostęp do wszystkich zasobów
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Pobierz ID właściciela zasobu
      const resourceOwnerId = await getResourceOwner(req);
      
      // Sprawdź czy użytkownik jest właścicielem
      if (req.user.id !== resourceOwnerId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Nie masz uprawnień do wykonania tej operacji' 
        });
      }
      
      // Użytkownik jest właścicielem - przejdź dalej
      next();
    } catch (error) {
      next(error);
    }
  };
};