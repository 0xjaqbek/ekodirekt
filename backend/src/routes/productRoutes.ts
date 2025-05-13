import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { requireOwnership } from '../middleware/permissionMiddleware';
import { 
  validateCreateProduct, 
  validateUpdateProduct,
  validateProductStatusUpdate,
  validateProductQueryParams,
  validateRemoveProductImage
} from '../middleware/validationMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Pobiera listę produktów z filtrowaniem i paginacją
 * @access  Public
 */
router.get('/', 
  validateProductQueryParams,
  productController.getProducts
);

/**
 * @route   GET /api/products/nearby
 * @desc    Pobiera produkty w określonym promieniu od podanej lokalizacji
 * @access  Public
 */
router.get('/nearby', 
  productController.getNearbyProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Pobiera szczegóły produktu po ID
 * @access  Public
 */
router.get('/:id', 
  productController.getProductById
);

/**
 * @route   POST /api/products
 * @desc    Dodaje nowy produkt
 * @access  Private (farmer)
 */
router.post('/', 
  authenticate, 
  authorize(['farmer', 'admin']), 
  upload.array('images', 5), // Maksymalnie 5 zdjęć
  validateCreateProduct, 
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Aktualizuje produkt
 * @access  Private (owner/admin)
 */
router.put('/:id', 
  authenticate, 
  upload.array('images', 5),
  validateUpdateProduct, 
  requireOwnership(async (req) => {
    const product = await productController.getProductForOwnershipCheck(req.params.id);
    return product ? product.owner.toString() : '';
  }),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Usuwa produkt
 * @access  Private (owner/admin)
 */
router.delete('/:id', 
  authenticate, 
  requireOwnership(async (req) => {
    const product = await productController.getProductForOwnershipCheck(req.params.id);
    return product ? product.owner.toString() : '';
  }),
  productController.deleteProduct
);

/**
 * @route   PUT /api/products/:id/status
 * @desc    Aktualizuje status produktu
 * @access  Private (owner/admin)
 */
router.put('/:id/status', 
  authenticate, 
  validateProductStatusUpdate,
  requireOwnership(async (req) => {
    const product = await productController.getProductForOwnershipCheck(req.params.id);
    return product ? product.owner.toString() : '';
  }),
  productController.updateProductStatus
);

/**
 * @route   POST /api/products/:id/images
 * @desc    Dodaje zdjęcia do produktu
 * @access  Private (owner/admin)
 */
router.post('/:id/images', 
  authenticate, 
  upload.array('images', 5),
  requireOwnership(async (req) => {
    const product = await productController.getProductForOwnershipCheck(req.params.id);
    return product ? product.owner.toString() : '';
  }),
  productController.addProductImages
);

/**
 * @route   DELETE /api/products/:id/images
 * @desc    Usuwa zdjęcie z produktu
 * @access  Private (owner/admin)
 */
router.delete('/:id/images', 
  authenticate, 
  validateRemoveProductImage,
  requireOwnership(async (req) => {
    const product = await productController.getProductForOwnershipCheck(req.params.id);
    return product ? product.owner.toString() : '';
  }),
  productController.removeProductImage
);

/**
 * @route   GET /api/products/tracking/:trackingId
 * @desc    Pobiera historię śledzenia produktu
 * @access  Public
 */
router.get('/tracking/:trackingId', 
  productController.getProductTracking
);

/**
 * @route   GET /api/products/farmer/:farmerId
 * @desc    Pobiera produkty danego rolnika
 * @access  Public
 */
router.get('/farmer/:farmerId', 
  productController.getFarmerProducts
);

export default router;