import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
import { 
  validateUpdateProfile, 
  validateUpdateUserRole,
  validateUpdateVerificationStatus
} from '../middleware/validationMiddleware';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Pobiera wszystkich użytkowników (z paginacją i filtrowaniem)
 * @access  Private (Admin)
 */
router.get('/', 
  authenticate, 
  authorize(['admin']), 
  userController.getAllUsers
);

/**
 * @route   GET /api/users/me
 * @desc    Pobiera profil zalogowanego użytkownika
 * @access  Private
 */
router.get('/me', 
  authenticate, 
  userController.getMyProfile
);

/**
 * @route   PUT /api/users/me
 * @desc    Aktualizuje profil zalogowanego użytkownika
 * @access  Private
 */
router.put('/me', 
  authenticate, 
  validateUpdateProfile, 
  userController.updateProfile
);

/**
 * @route   PUT /api/users/role
 * @desc    Aktualizuje rolę użytkownika
 * @access  Private (Admin)
 */
router.put('/role', 
  authenticate, 
  authorize(['admin']), 
  validateUpdateUserRole, 
  userController.updateUserRole
);

/**
 * @route   PUT /api/users/verify
 * @desc    Aktualizuje status weryfikacji użytkownika
 * @access  Private (Admin)
 */
router.put('/verify', 
  authenticate, 
  authorize(['admin']), 
  validateUpdateVerificationStatus, 
  userController.updateVerificationStatus
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Dezaktywuje konto użytkownika
 * @access  Private (właściciel konta lub Admin)
 */
router.delete('/:id', 
  authenticate, 
  userController.deactivateAccount
);

/**
 * @route   GET /api/users/:id
 * @desc    Pobiera użytkownika po ID
 * @access  Private (Admin)
 */
router.get('/:id', 
  authenticate, 
  authorize(['admin']), 
  userController.getUserById
);

/**
 * @route   GET /api/users/public/:id
 * @desc    Pobiera publiczny profil użytkownika
 * @access  Public
 */
router.get('/public/:id', 
  userController.getPublicProfile
);

export default router;