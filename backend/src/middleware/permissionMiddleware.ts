import { Request, Response, NextFunction } from 'express';
import { hasPermission, hasRoleLevel } from 'shared/constants/roles';

/**
 * Middleware do weryfikacji uprawnień użytkownika
 * @param requiredPermission Wymagane uprawnienie
 */
export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
    }
    
    // Sprawdź czy użytkownik ma wymagane uprawnienie
    if (!hasPermission(req.user.role, requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Nie masz wystarczających uprawnień do wykonania tej operacji',
      });
    }
    
    // Użytkownik ma uprawnienie - przejdź dalej
    next();
  };
};

/**
 * Middleware do weryfikacji poziomu roli użytkownika
 * @param requiredRole Wymagana minimalna rola
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
    }
    
    // Sprawdź czy użytkownik ma wymagany poziom roli
    if (!hasRoleLevel(req.user.role, requiredRole)) {
      return res.status(403).json({
        success: false,
        message: 'Nie masz wystarczających uprawnień do wykonania tej operacji',
      });
    }
    
    // Użytkownik ma wymagany poziom roli - przejdź dalej
    next();
  };
};

/**
 * Middleware do weryfikacji, czy użytkownik jest właścicielem zasobu lub adminem
 * @param getResourceUserId Funkcja zwracająca ID właściciela zasobu
 */
export const requireOwnership = (getResourceUserId: (req: Request) => Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sprawdź czy użytkownik jest zalogowany
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
      }
      
      // Admin ma dostęp do wszystkich zasobów
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Pobierz ID właściciela zasobu
      const resourceUserId = await getResourceUserId(req);
      
      // Sprawdź czy użytkownik jest właścicielem
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do wykonania tej operacji',
        });
      }
      
      // Użytkownik jest właścicielem - przejdź dalej
      next();
    } catch (error) {
      next(error);
    }
  };
};