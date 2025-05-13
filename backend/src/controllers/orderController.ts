import { Request, Response, NextFunction } from 'express';
import { Order, Product, User } from '../models';
import { IOrder } from 'shared/types/models';
import { CreateOrderRequest } from 'shared/types/api';
import mongoose from 'mongoose';
import { calculateCarbonFootprint, calculateDistance } from 'shared/utils';

/**
 * Tworzy nowe zamówienie
 * @route POST /api/orders
 * @access Private (consumer)
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const orderData: CreateOrderRequest = req.body;
    
    // Sprawdź, czy użytkownik jest konsumentem
    const user = await User.findById(userId);
    if (!user || (user.role !== 'consumer' && user.role !== 'admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Tylko konsumenci mogą składać zamówienia' 
      });
    }
    
    // Walidacja - sprawdź czy orderData.items nie jest puste
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Zamówienie musi zawierać co najmniej jeden produkt'
      });
    }
    
    // Przygotuj dane zamówienia
    const orderItems = [];
    let totalPrice = 0;
    
    // Pobierz wszystkie produkty zamówienia
    const productIds = orderData.items.map(item => item.product);
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: 'available'
    });
    
    // Sprawdź, czy wszystkie produkty zostały znalezione i są dostępne
    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Niektóre produkty nie są dostępne lub nie istnieją'
      });
    }
    
    // Sprawdź, czy żądana ilość jest dostępna dla każdego produktu
    for (const item of orderData.items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Produkt o ID ${item.product} nie istnieje`
        });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Niewystarczająca ilość produktu "${product.name}". Dostępne: ${product.quantity} ${product.unit}`
        });
      }
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
      
      totalPrice += product.price * item.quantity;
    }
    
    // Oblicz szacunkowy ślad węglowy zamówienia
    const buyer = await User.findById(userId);
    let carbonFootprint = 0;
    
    for (const item of orderData.items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (product) {
        const farmer = await User.findById(product.owner);
        if (farmer && buyer) {
          // Oblicz dystans między rolnikiem a kupującym
          const farmerCoords = farmer.location.coordinates;
          const buyerCoords = buyer.location.coordinates;
          
          const distanceKm = calculateDistance(
            farmerCoords[1], farmerCoords[0], 
            buyerCoords[1], buyerCoords[0]
          );
          
          // Oblicz ślad węglowy dla danego produktu
          const productWeight = item.quantity; // Zakładamy, że ilość to waga w kg
          const itemFootprint = calculateCarbonFootprint(
            distanceKm,
            productWeight,
            product.category
          );
          
          carbonFootprint += itemFootprint;
        }
      }
    }
    
    // Utwórz nowe zamówienie
    const newOrder = new Order({
      buyer: userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          updatedBy: userId
        }
      ],
      shippingAddress: orderData.shippingAddress,
      paymentStatus: 'pending',
      carbonFootprint: carbonFootprint > 0 ? carbonFootprint : undefined,
      isReviewed: false
    });
    
    // Zapisz zamówienie
    await newOrder.save();
    
    // Aktualizuj listę zamówień użytkownika
    await User.findByIdAndUpdate(userId, {
      $push: { orders: newOrder._id }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Zamówienie zostało utworzone pomyślnie',
      order: newOrder
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera listę zamówień użytkownika
 * @route GET /api/orders
 * @access Private
 */
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Parametry paginacji i filtrowania
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const filter: any = {};
    
    // Filtrowanie według roli
    if (userRole === 'consumer') {
      // Konsument widzi tylko swoje zamówienia
      filter.buyer = userId;
    } else if (userRole === 'farmer') {
      // Rolnik widzi zamówienia zawierające jego produkty
      
      // Pobierz produkty rolnika
      const products = await Product.find({ owner: userId }).select('_id');
      const productIds = products.map(product => product._id);
      
      // Znajdź zamówienia zawierające produkty rolnika
      filter['items.product'] = { $in: productIds };
    }
    // Admin widzi wszystkie zamówienia (brak filtra)
    
    // Filtrowanie według statusu
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Wykonaj zapytanie z paginacją
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }) // Najnowsze pierwsze
      .populate({
        path: 'buyer',
        select: 'fullName email profileImage'
      })
      .populate({
        path: 'items.product',
        select: 'name price images owner',
        populate: {
          path: 'owner',
          select: 'fullName'
        }
      });
    
    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera szczegóły zamówienia
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID zamówienia' });
    }
    
    // Pobierz zamówienie z relacjami
    const order = await Order.findById(orderId)
      .populate({
        path: 'buyer',
        select: 'fullName email profileImage phoneNumber location'
      })
      .populate({
        path: 'items.product',
        select: 'name description price images category owner unit',
        populate: {
          path: 'owner',
          select: 'fullName email profileImage phoneNumber location'
        }
      });
    
    // Sprawdź, czy zamówienie istnieje
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź uprawnienia dostępu do zamówienia
    let hasAccess = false;
    
    if (userRole === 'admin') {
      // Admin ma dostęp do wszystkich zamówień
      hasAccess = true;
    } else if (userRole === 'consumer' && order.buyer._id.toString() === userId) {
      // Konsument ma dostęp do swoich zamówień
      hasAccess = true;
    } else if (userRole === 'farmer') {
      // Rolnik ma dostęp do zamówień zawierających jego produkty
      const hasOwnProduct = order.items.some(item => {
        const product = item.product as any; // Type assertion dla mongoose
        return product.owner._id.toString() === userId;
      });
      
      hasAccess = hasOwnProduct;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do wyświetlania tego zamówienia' 
      });
    }
    
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Aktualizuje status zamówienia
 * @route PUT /api/orders/:id/status
 * @access Private
 */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { status, note } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID zamówienia' });
    }
    
    // Sprawdź, czy status jest prawidłowy
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy status zamówienia' });
    }
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź uprawnienia do aktualizacji statusu
    let canUpdateStatus = false;
    
    if (userRole === 'admin') {
      // Admin może aktualizować wszystkie statusy
      canUpdateStatus = true;
    } else if (userRole === 'consumer' && order.buyer.toString() === userId) {
      // Konsument może anulować swoje zamówienie (jeśli jest w statusie pending)
      // lub potwierdzić dostawę (zmienić status na delivered)
      if (
        (status === 'cancelled' && order.status === 'pending') ||
        (status === 'delivered' && order.status === 'shipped')
      ) {
        canUpdateStatus = true;
      }
    } else if (userRole === 'farmer') {
      // Rolnik może aktualizować statusy zamówień zawierających jego produkty
      // ale tylko w określonej kolejności
      
      // Pobierz produkty rolnika
      const products = await Product.find({ owner: userId }).select('_id');
      const productIds = products.map(product => product._id.toString());
      
      // Sprawdź, czy zamówienie zawiera produkty rolnika
      const hasOwnProduct = order.items.some(item => 
        productIds.includes(item.product.toString())
      );
      
      if (hasOwnProduct) {
        // Dozwolone zmiany statusu dla rolnika
        const allowedTransitions = {
          'paid': ['processing'],
          'processing': ['shipped'],
          'shipped': ['delivered']
        };
        
        if (
          allowedTransitions[order.status as keyof typeof allowedTransitions]?.includes(status)
        ) {
          canUpdateStatus = true;
        }
      }
    }
    
    if (!canUpdateStatus) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do aktualizacji statusu tego zamówienia' 
      });
    }
    
    // Aktualizuj status zamówienia
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: userId,
      note: note || `Status zmieniony na ${status}`
    });
    
    // Dodatkowe działania w zależności od statusu
    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }
    
    // Zapisz zaktualizowane zamówienie
    await order.save();
    
    // Aktualizuj ilość produktów przy zmianie statusu na paid/processing
    if (['paid', 'processing'].includes(status) && !['paid', 'processing'].includes(order.status)) {
      // Zmniejsz dostępną ilość produktów
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const newQuantity = Math.max(0, product.quantity - item.quantity);
          await product.updateAvailability(newQuantity);
        }
      }
    }
    
    // Przywróć ilość produktów przy anulowaniu zamówienia
    if (status === 'cancelled' && ['paid', 'processing'].includes(order.status)) {
      // Zwiększ dostępną ilość produktów
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const newQuantity = product.quantity + item.quantity;
          await product.updateAvailability(newQuantity);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Status zamówienia został zaktualizowany',
      order
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Aktualizuje status płatności zamówienia
 * @route PUT /api/orders/:id/payment
 * @access Private
 */
export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { paymentStatus, paymentId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID zamówienia' });
    }
    
    // Sprawdź, czy status płatności jest prawidłowy
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy status płatności' });
    }
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź uprawnienia do aktualizacji statusu płatności
    let canUpdatePayment = false;
    
    if (userRole === 'admin') {
      // Admin może aktualizować wszystkie statusy płatności
      canUpdatePayment = true;
    } else if (userRole === 'consumer' && order.buyer.toString() === userId) {
      // Konsument może zmieniać status płatności tylko z pending na completed (poprzez płatność)
      if (order.paymentStatus === 'pending' && paymentStatus === 'completed') {
        canUpdatePayment = true;
      }
    }
    
    if (!canUpdatePayment) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do aktualizacji statusu płatności tego zamówienia' 
      });
    }
    
    // Aktualizuj status płatności
    order.paymentStatus = paymentStatus;
    if (paymentId) {
      order.paymentId = paymentId;
    }
    
    // Jeśli płatność została zrealizowana, zmień status zamówienia na "paid"
    if (paymentStatus === 'completed' && order.status === 'pending') {
      order.status = 'paid';
      order.statusHistory.push({
        status: 'paid',
        timestamp: new Date(),
        updatedBy: userId,
        note: 'Płatność zrealizowana'
      });
    }
    
    // Jeśli płatność została odrzucona, możesz dodać odpowiednią notatkę
    if (paymentStatus === 'failed') {
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        updatedBy: userId,
        note: 'Płatność nieudana'
      });
    }
    
    // Zapisz zaktualizowane zamówienie
    await order.save();
    
    return res.status(200).json({
      success: true,
      message: 'Status płatności został zaktualizowany',
      order
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera zamówienia rolnika
 * @route GET /api/orders/farmer
 * @access Private (farmer)
 */
export const getFarmerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy użytkownik jest rolnikiem
    if (userRole !== 'farmer' && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Brak dostępu. Ta funkcja jest dostępna tylko dla rolników.' 
      });
    }
    
    // Parametry paginacji i filtrowania
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    // Pobierz produkty rolnika
    const products = await Product.find({ owner: userId }).select('_id');
    const productIds = products.map(product => product._id);
    
    // Przygotuj filtr
    const filter: any = {
      'items.product': { $in: productIds }
    };
    
    // Filtruj po statusie
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Wykonaj zapytanie z paginacją
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }) // Najnowsze pierwsze
      .populate({
        path: 'buyer',
        select: 'fullName email profileImage'
      })
      .populate({
        path: 'items.product',
        select: 'name price images owner',
        populate: {
          path: 'owner',
          select: 'fullName'
        }
      });
    
    // Odfiltruj z zamówień tylko produkty należące do tego rolnika
    const ordersWithOwnProducts = orders.map(order => {
      // Sklonuj zamówienie, aby nie modyfikować oryginału z bazy danych
      const orderObject = order.toObject();
      
      // Filtruj elementy aby zawierały tylko produkty tego rolnika
      orderObject.items = orderObject.items.filter((item: any) => {
        return item.product.owner._id.toString() === userId;
      });
      
      // Oblicz sumę tylko dla produktów tego rolnika
      orderObject.farmerTotal = orderObject.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.priceAtPurchase);
      }, 0);
      
      return orderObject;
    });
    
    return res.status(200).json({
      success: true,
      orders: ordersWithOwnProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera fakturę/rachunek dla zamówienia
 * @route GET /api/orders/:id/invoice
 * @access Private
 */
export const getOrderInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID zamówienia' });
    }
    
    // Pobierz zamówienie z relacjami
    const order = await Order.findById(orderId)
      .populate({
        path: 'buyer',
        select: 'fullName email phoneNumber location'
      })
      .populate({
        path: 'items.product',
        select: 'name price unit owner',
        populate: {
          path: 'owner',
          select: 'fullName email phoneNumber location'
        }
      });
    
    // Sprawdź, czy zamówienie istnieje
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź uprawnienia dostępu do faktury
    let hasAccess = false;
    
    if (userRole === 'admin') {
      // Admin ma dostęp do wszystkich faktur
      hasAccess = true;
    } else if (userRole === 'consumer' && order.buyer._id.toString() === userId) {
      // Konsument ma dostęp do faktur swoich zamówień
      hasAccess = true;
    } else if (userRole === 'farmer') {
      // Rolnik ma dostęp do faktur zamówień zawierających jego produkty
      const hasOwnProduct = order.items.some(item => {
        const product = item.product as any; // Type assertion dla mongoose
        return product.owner._id.toString() === userId;
      });
      
      hasAccess = hasOwnProduct;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do wyświetlania faktury tego zamówienia' 
      });
    }
    
    // Przygotuj dane do faktury
    const invoiceData = {
      orderNumber: order._id.toString(),
      orderDate: order.createdAt,
      paymentStatus: order.paymentStatus,
      buyer: {
        name: order.buyer.fullName,
        email: order.buyer.email,
        phone: order.buyer.phoneNumber,
        address: order.buyer.location.address
      },
      items: order.items.map((item: any) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        price: item.priceAtPurchase,
        total: item.quantity * item.priceAtPurchase,
        seller: {
          name: item.product.owner.fullName,
          email: item.product.owner.email,
          phone: item.product.owner.phoneNumber,
          address: item.product.owner.location.address
        }
      })),
      shippingAddress: order.shippingAddress,
      totalAmount: order.totalPrice,
      carbonFootprint: order.carbonFootprint
    };
    
    // W rzeczywistej implementacji tutaj wygenerujemy PDF
    // Na potrzeby API zwracamy dane faktury w formacie JSON
    
    return res.status(200).json({
      success: true,
      invoice: invoiceData
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Anuluje zamówienie
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID zamówienia' });
    }
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź uprawnienia do anulowania zamówienia
    let canCancel = false;
    
    if (userRole === 'admin') {
      // Admin może anulować każde zamówienie
      canCancel = true;
    } else if (userRole === 'consumer' && order.buyer.toString() === userId) {
      // Konsument może anulować swoje zamówienie tylko w określonych statusach
      if (['pending', 'paid'].includes(order.status)) {
        canCancel = true;
      }
    } else if (userRole === 'farmer') {
      // Rolnik może anulować zamówienia zawierające jego produkty w określonych statusach
      
      // Pobierz produkty rolnika
      const products = await Product.find({ owner: userId }).select('_id');
      const productIds = products.map(product => product._id.toString());
      
      // Sprawdź, czy zamówienie zawiera produkty rolnika
      const hasOwnProduct = order.items.some(item => 
        productIds.includes(item.product.toString())
      );
      
      if (hasOwnProduct && ['paid', 'processing'].includes(order.status)) {
        canCancel = true;
      }
    }
    
    if (!canCancel) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie możesz anulować tego zamówienia' 
      });
    }
    
    // Sprawdź, czy zamówienie nie jest już anulowane lub dostarczone
    if (['cancelled', 'delivered'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Nie można anulować zamówienia w statusie "${order.status}"` 
      });
    }
    
    // Zaktualizuj status zamówienia na "cancelled"
    const previousStatus = order.status;
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: userId,
      note: reason || 'Zamówienie anulowane'
    });
    
    // Zapisz zaktualizowane zamówienie
    await order.save();
    
    // Przywróć ilość produktów, jeśli zamówienie było już opłacone
    if (['paid', 'processing'].includes(previousStatus)) {
      // Zwiększ dostępną ilość produktów
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const newQuantity = product.quantity + item.quantity;
          await product.updateAvailability(newQuantity);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Zamówienie zostało anulowane',
      order
    });
  } catch (error: any) {
    next(error);
  }
};