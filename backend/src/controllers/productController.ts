import { Request, Response, NextFunction } from 'express';
import { Product, User } from '../models';
import { IProduct } from 'shared/types/models';
import { CreateProductRequest, ProductsFilterRequest } from 'shared/types/api';
import mongoose from 'mongoose';
import { generateTrackingId } from 'shared/utils';
import { uploadImagesToCloudinary } from '../services/uploadService';

/**
 * Pobiera listę produktów z filtrowaniem, sortowaniem i paginacją
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parametry filtrowania i paginacji
    const {
      category,
      subcategory,
      isCertified,
      minPrice,
      maxPrice,
      radius,
      coordinates,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      search
    } = req.query as unknown as ProductsFilterRequest & { search?: string };

    // Budowanie filtra
    const filter: any = {};

    // Podstawowe filtry
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (isCertified !== undefined) filter.isCertified = isCertified;
    
    // Filtry zakresu cenowego
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Filtrowanie po statusie - domyślnie pokazuj tylko dostępne produkty
    filter.status = 'available';

    // Wyszukiwanie po nazwie lub opisie
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Przygotowanie sortowania
    let sort: any = {};
    
    // Określ sortowanie na podstawie parametrów
    switch (sortBy) {
      case 'price':
        sort.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sort.averageRating = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'date':
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.createdAt = -1; // Domyślne sortowanie - najnowsze pierwsze
    }

    // Filtrowanie po lokalizacji (produkty w promieniu)
    let query = Product.find(filter).sort(sort);

    // Jeśli podano współrzędne i promień, używamy zapytania geoprzestrzennego
    if (coordinates && radius) {
      query = Product.find({
        ...filter,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radius * 1000 // Konwersja z km na metry
          }
        }
      }).sort(sort);
    }

    // Wykonaj zapytanie z paginacją
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    
    // Pobierz produkty z relacjami
    const products = await query
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'owner',
        select: 'fullName profileImage location isVerified'
      })
      .populate({
        path: 'certificates',
        select: 'name type issuingAuthority validUntil'
      });

    // Zwróć odpowiedź
    return res.status(200).json({
      success: true,
      products,
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
 * Pobiera szczegóły produktu po ID
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;

    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID produktu' });
    }

    // Pobierz produkt z relacjami
    const product = await Product.findById(productId)
      .populate({
        path: 'owner',
        select: 'fullName profileImage bio location isVerified'
      })
      .populate({
        path: 'certificates',
        select: 'name type issuingAuthority validUntil'
      })
      .populate({
        path: 'reviews',
        select: 'rating comment createdAt',
        populate: {
          path: 'author',
          select: 'fullName profileImage'
        }
      });

    // Sprawdź, czy produkt istnieje
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Zwróć produkt
    return res.status(200).json({
      success: true,
      product
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Dodaje nowy produkt (tylko dla rolników)
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const productData: CreateProductRequest = req.body;
    
    // Sprawdź, czy użytkownik jest rolnikiem
    const user = await User.findById(userId);
    if (!user || user.role !== 'farmer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Tylko rolnicy mogą dodawać produkty' 
      });
    }

    // Obsługa przesłanych zdjęć
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      // Wgraj zdjęcia do Cloudinary
      imageUrls = await uploadImagesToCloudinary(req.files);
    } else if (productData.images && productData.images.length > 0) {
      // Jeśli już podano URLe do zdjęć
      imageUrls = productData.images;
    }

    // Przygotuj dane produktu
    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity,
      unit: productData.unit,
      category: productData.category,
      subcategory: productData.subcategory,
      owner: userId,
      images: imageUrls,
      certificates: productData.certificates || [],
      status: 'available',
      statusHistory: [
        {
          status: 'available',
          timestamp: new Date(),
          updatedBy: userId,
          note: 'Produkt dodany'
        }
      ],
      // Ustaw lokalizację produktu na podstawie podanych danych lub domyślnie używaj lokalizacji rolnika
      location: productData.location || user.location,
      harvestDate: productData.harvestDate,
      trackingId: generateTrackingId(),
      averageRating: 0,
      isCertified: (productData.certificates && productData.certificates.length > 0) ? true : false
    });

    // Zapisz produkt
    await newProduct.save();

    // Dodaj produkt do listy produktów rolnika
    user.createdProducts = user.createdProducts || [];
    user.createdProducts.push(newProduct._id);
    await user.save();

    // Dodaj certyfikaty do produktu (jeśli podano)
    if (productData.certificates && productData.certificates.length > 0) {
      // Tu można dodać logikę przypisywania certyfikatów
    }

    // Zwróć utworzony produkt
    return res.status(201).json({
      success: true,
      message: 'Produkt został dodany pomyślnie',
      product: newProduct
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Aktualizuje produkt (tylko właściciel lub admin)
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = req.body;

    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID produktu' });
    }

    // Pobierz produkt
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Sprawdź uprawnienia (tylko właściciel lub admin może aktualizować produkt)
    if (product.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do aktualizacji tego produktu' 
      });
    }

    // Sprawdź, czy nie próbuje się zmienić właściciela
    if (updateData.owner && updateData.owner !== product.owner.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nie można zmienić właściciela produktu' 
      });
    }

    // Obsługa przesłanych zdjęć
    if (req.files && Array.isArray(req.files)) {
      // Wgraj nowe zdjęcia do Cloudinary
      const newImageUrls = await uploadImagesToCloudinary(req.files);
      
      // Dodaj nowe zdjęcia do listy istniejących (lub zastąp, w zależności od logiki)
      if (updateData.replaceImages) {
        updateData.images = newImageUrls;
      } else {
        updateData.images = [...(product.images || []), ...newImageUrls];
      }
    }

    // Aktualizacja statusu produktu z historią zmian
    if (updateData.status && updateData.status !== product.status) {
      product.status = updateData.status;
      product.statusHistory.push({
        status: updateData.status,
        timestamp: new Date(),
        updatedBy: userId,
        note: updateData.statusNote || `Status zmieniony na ${updateData.status}`
      });
    }

    // Aktualizuj pozostałe pola
    Object.keys(updateData).forEach(key => {
      // Pomiń pola, które obsługujemy specjalnie
      if (!['status', 'statusNote', 'replaceImages'].includes(key)) {
        (product as any)[key] = updateData[key];
      }
    });

    // Aktualizuj pole isCertified na podstawie listy certyfikatów
    if (updateData.certificates) {
      product.isCertified = updateData.certificates.length > 0;
    }

    // Zapisz zaktualizowany produkt
    await product.save();

    // Zwróć zaktualizowany produkt
    return res.status(200).json({
      success: true,
      message: 'Produkt został zaktualizowany pomyślnie',
      product
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Usuwa produkt (tylko właściciel lub admin)
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID produktu' });
    }

    // Pobierz produkt
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Sprawdź uprawnienia (tylko właściciel lub admin może usunąć produkt)
    if (product.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do usunięcia tego produktu' 
      });
    }

    // Usuń produkt
    await product.remove();

    // Aktualizuj listę produktów właściciela
    await User.findByIdAndUpdate(product.owner, {
      $pull: { createdProducts: productId }
    });

    return res.status(200).json({
      success: true,
      message: 'Produkt został usunięty pomyślnie'
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Aktualizuje status produktu (tylko właściciel lub admin)
 */
export const updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, note } = req.body;

    // Sprawdź, czy status jest prawidłowy
    const validStatuses = ['available', 'preparing', 'shipped', 'delivered', 'unavailable'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nieprawidłowy status produktu' 
      });
    }

    // Pobierz produkt
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Sprawdź uprawnienia (tylko właściciel lub admin może aktualizować status)
    if (product.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do aktualizacji statusu tego produktu' 
      });
    }

    // Aktualizuj status
    product.status = status;
    product.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: userId,
      note: note || `Status zmieniony na ${status}`
    });

    // Zapisz zaktualizowany produkt
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Status produktu został zaktualizowany pomyślnie',
      product
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera produkty w pobliżu (produkty w określonym promieniu od zadanej lokalizacji)
 */
export const getNearbyProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude, radius = 50, limit = 12, category } = req.query;

    // Sprawdź parametry
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brakujące parametry: latitude i longitude są wymagane' 
      });
    }

    // Filtry
    const filter: any = { status: 'available' };
    if (category) filter.category = category;

    // Zapytanie geoprzestrzenne
    const products = await Product.find({
      ...filter,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(radius as string) * 1000 // Konwersja z km na metry
        }
      }
    })
    .limit(parseInt(limit as string))
    .populate({
      path: 'owner',
      select: 'fullName profileImage location isVerified'
    })
    .populate({
      path: 'certificates',
      select: 'name type issuingAuthority'
    });

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Dodaje zdjęcia do produktu
 */
export const addProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Sprawdź, czy przesłano pliki
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brak przesłanych plików' 
      });
    }

    // Pobierz produkt
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Sprawdź uprawnienia (tylko właściciel lub admin może dodawać zdjęcia)
    if (product.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do modyfikacji tego produktu' 
      });
    }

    // Wgraj zdjęcia do Cloudinary
    const imageUrls = await uploadImagesToCloudinary(req.files);

    // Dodaj nowe zdjęcia do listy istniejących
    product.images = [...(product.images || []), ...imageUrls];

    // Zapisz zaktualizowany produkt
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Zdjęcia zostały dodane pomyślnie',
      images: imageUrls,
      product
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Usuwa zdjęcie z produktu
 */
export const removeProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const imageUrl = req.body.imageUrl;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Sprawdź, czy podano URL zdjęcia
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brak podanego URL zdjęcia' 
      });
    }

    // Pobierz produkt
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    }

    // Sprawdź uprawnienia (tylko właściciel lub admin może usuwać zdjęcia)
    if (product.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do modyfikacji tego produktu' 
      });
    }

    // Sprawdź, czy zdjęcie istnieje w produktie
    if (!product.images.includes(imageUrl)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Podane zdjęcie nie istnieje w tym produkcie' 
      });
    }

    // Usuń zdjęcie z listy
    product.images = product.images.filter(img => img !== imageUrl);

    // Zapisz zaktualizowany produkt
    await product.save();

    // Można też dodać logikę usuwania zdjęcia z Cloudinary jeśli potrzeba

    return res.status(200).json({
      success: true,
      message: 'Zdjęcie zostało usunięte pomyślnie',
      product
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera historię śledzenia produktu
 */
export const getProductTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = req.params.trackingId;

    // Pobierz produkt po trackingId
    const product = await Product.findOne({ trackingId })
      .populate({
        path: 'owner',
        select: 'fullName location'
      })
      .populate({
        path: 'certificates',
        select: 'name type issuingAuthority validUntil'
      });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produkt o podanym ID śledzenia nie istnieje' 
      });
    }

    // Pobierz zamówienia zawierające ten produkt
    // To będzie wymagało zaimplementowania relacji w modelu Order
    // i przeszukania zamówień zawierających dany produkt

    // Przygotuj dane do zwrócenia
    const trackingData = {
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        harvestDate: product.harvestDate,
        images: product.images,
        isCertified: product.isCertified,
      },
      farmer: {
        fullName: product.owner.fullName,
        location: product.owner.location,
      },
      certificates: product.certificates,
      statusHistory: product.statusHistory,
      // Tutaj można dodać informacje o zamówieniach (po ich zaimplementowaniu)
    };

    return res.status(200).json({
      success: true,
      tracking: trackingData
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera produkty należące do danego rolnika
 */
export const getFarmerProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.params.farmerId;
    const { page = 1, limit = 12, status } = req.query;

    // Sprawdź, czy ID jest prawidłowe
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy format ID rolnika' });
    }

    // Sprawdź, czy rolnik istnieje
    const farmer = await User.findOne({ _id: farmerId, role: 'farmer' });
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Rolnik nie istnieje' });
    }

    // Przygotuj filtry
    const filter: any = { owner: farmerId };
    
    // Filtrowanie po statusie (opcjonalne)
    if (status) {
      filter.status = status;
    } else {
      // Domyślnie pokazuj tylko dostępne produkty
      filter.status = 'available';
    }

    // Paginacja
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = await Product.countDocuments(filter);

    // Pobierz produkty
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 }) // Najnowsze pierwsze
      .populate({
        path: 'certificates',
        select: 'name type issuingAuthority'
      });

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// Funkcja pomocnicza do sprawdzania własności produktu
export const getProductForOwnershipCheck = async (productId: string) => {
    const Product = require('../models/Product').default;
    return await Product.findById(productId);
  };

export * from './productController';