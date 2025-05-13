/**
 * Dostępne role użytkowników w systemie
 */
export const USER_ROLES = ['farmer', 'consumer', 'admin'] as const;

/**
 * Lista dostępnych uprawnień dla poszczególnych ról 
 * Używane do precyzyjnego kontrolowania dostępu
 */
export const ROLE_PERMISSIONS = {
  // Rolnik - podstawowe uprawnienia do zarządzania swoimi produktami, certyfikatami itp.
  farmer: [
    'product:create',
    'product:read',
    'product:update:own',
    'product:delete:own',
    'certificate:create',
    'certificate:read',
    'certificate:update:own',
    'certificate:delete:own',
    'order:read:own',
    'order:update:own',
    'review:read',
    'profile:read',
    'profile:update:own',
    'localgroup:join',
    'localgroup:read',
  ],
  
  // Konsument - podstawowe uprawnienia do przeglądania i zamawiania produktów
  consumer: [
    'product:read',
    'order:create',
    'order:read:own',
    'order:cancel:own',
    'review:create',
    'review:read',
    'review:update:own',
    'review:delete:own',
    'profile:read',
    'profile:update:own',
    'localgroup:join',
    'localgroup:read',
  ],
  
  // Administrator - pełne uprawnienia do zarządzania systemem
  admin: [
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'certificate:create',
    'certificate:read',
    'certificate:update',
    'certificate:delete',
    'certificate:verify',
    'order:read',
    'order:update',
    'order:delete',
    'review:read',
    'review:update',
    'review:delete',
    'review:moderate',
    'user:read',
    'user:update',
    'user:delete',
    'localgroup:create',
    'localgroup:read',
    'localgroup:update',
    'localgroup:delete',
    'stats:read',
    'settings:read',
    'settings:update',
  ],
} as const;

/**
 * Mapowanie roli do poziomu użytkownika
 * Używane do określenia hierarchii ról
 */
export const ROLE_LEVELS = {
  consumer: 1, // Podstawowy poziom
  farmer: 2,   // Poziom producenta
  admin: 10,   // Najwyższy poziom
} as const;

/**
 * Sprawdza, czy użytkownik ma określone uprawnienie
 * @param userRole Rola użytkownika
 * @param requiredPermission Wymagane uprawnienie
 * @returns True jeśli użytkownik ma uprawnienie, false w przeciwnym razie
 */
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  if (!ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]) {
    return false;
  }
  
  // Admin ma wszystkie uprawnienia
  if (userRole === 'admin') {
    return true;
  }
  
  return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS].includes(requiredPermission as any);
};

/**
 * Sprawdza, czy rola użytkownika ma większy lub równy poziom niż wymagany poziom
 * @param userRole Rola użytkownika
 * @param requiredRole Wymagana rola
 * @returns True jeśli rola użytkownika ma większy lub równy poziom, false w przeciwnym razie
 */
export const hasRoleLevel = (userRole: string, requiredRole: string): boolean => {
  const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS] || 0;
  
  return userLevel >= requiredLevel;
};