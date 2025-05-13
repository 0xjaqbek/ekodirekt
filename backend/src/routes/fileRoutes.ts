import { Router } from 'express';
import * as fileController from '../controllers/fileController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { 
  uploadImage, 
  uploadDocument, 
  uploadCertificate,
  cleanupTempFiles,
  handleUploadErrors
} from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @route   POST /api/files/products/images
 * @desc    Upload zdjęć produktu
 * @access  Private (farmer, admin)
 */
router.post(
  '/products/images',
  authenticate,
  authorize(['farmer', 'admin']),
  cleanupTempFiles,
  uploadImage.array('images', 5), // Maksymalnie 5 zdjęć naraz
  handleUploadErrors,
  fileController.uploadProductImages
);

/**
 * @route   POST /api/files/certificates
 * @desc    Upload plików certyfikatów
 * @access  Private (farmer, admin)
 */
router.post(
  '/certificates',
  authenticate,
  authorize(['farmer', 'admin']),
  cleanupTempFiles,
  uploadCertificate.array('documents', 3), // Maksymalnie 3 dokumenty
  handleUploadErrors,
  fileController.uploadCertificateFiles
);

/**
 * @route   POST /api/files/documents
 * @desc    Upload ogólnych dokumentów
 * @access  Private
 */
router.post(
  '/documents',
  authenticate,
  cleanupTempFiles,
  uploadDocument.array('documents', 10), // Maksymalnie 10 dokumentów
  handleUploadErrors,
  fileController.uploadDocuments
);

/**
 * @route   POST /api/files/profile-image
 * @desc    Upload zdjęcia profilowego
 * @access  Private
 */
router.post(
  '/profile-image',
  authenticate,
  cleanupTempFiles,
  uploadImage.single('image'), // Tylko jedno zdjęcie
  handleUploadErrors,
  fileController.uploadProfileImage
);

/**
 * @route   DELETE /api/files
 * @desc    Usuwanie pliku
 * @access  Private
 */
router.delete(
  '/',
  authenticate,
  fileController.deleteFile
);

export default router;