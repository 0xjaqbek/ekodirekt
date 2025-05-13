import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { requireOwnership } from '../middleware/permissionMiddleware';
import { 
  validateCreateOrder,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
  validateCancelOrder
} from '../middleware/validationMiddleware';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Tworzy nowe zamówienie
 * @access  Private (consumer)
 */
router.post('/', 
  authenticate, 
  authorize(['consumer', 'admin']), 
  validateCreateOrder,
  orderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Pobiera listę zamówień użytkownika (filtrowane według roli)
 * @access  Private
 */
router.get('/', 
  authenticate, 
  orderController.getOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Pobiera szczegóły zamówienia
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  orderController.getOrderById
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Aktualizuje status zamówienia
 * @access  Private
 */
router.put('/:id/status', 
  authenticate, 
  validateOrderStatusUpdate,
  orderController.updateOrderStatus
);

/**
 * @route   PUT /api/orders/:id/payment
 * @desc    Aktualizuje status płatności zamówienia
 * @access  Private
 */
router.put('/:id/payment', 
  authenticate, 
  validatePaymentStatusUpdate,
  orderController.updatePaymentStatus
);

/**
 * @route   GET /api/orders/farmer
 * @desc    Pobiera zamówienia produktów rolnika
 * @access  Private (farmer)
 */
router.get('/farmer', 
  authenticate, 
  authorize(['farmer', 'admin']),
  orderController.getFarmerOrders
);

/**
 * @route   GET /api/orders/:id/invoice
 * @desc    Pobiera fakturę/rachunek dla zamówienia
 * @access  Private
 */
router.get('/:id/invoice', 
  authenticate,
  orderController.getOrderInvoice
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Anuluje zamówienie
 * @access  Private
 */
router.put('/:id/cancel',
  authenticate,
  validateCancelOrder,
  orderController.cancelOrder
);

export default router;