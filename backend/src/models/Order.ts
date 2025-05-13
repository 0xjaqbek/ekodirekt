import mongoose, { Document, Schema, Types } from 'mongoose';
import { IOrder } from 'shared/types/models';
import { ORDER_STATUSES, PAYMENT_STATUSES } from 'shared/constants';
import { calculateCarbonFootprint } from 'shared/utils';

// Interfejs dla dokumentu mongoose
export interface OrderDocument extends IOrder, Document {
  // Metody instancji modelu
  updateStatus: (status: string, updatedBy: Types.ObjectId) => Promise<void>;
  calculateTotalPrice: () => Promise<number>;
  calculateCarbonFootprint: () => Promise<number>;
}

// Schema dla przedmiotu w zamówieniu
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Ilość musi być większa od 0'],
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Cena nie może być ujemna'],
  },
});

// Schema dla historii statusów zamówienia
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ORDER_STATUSES,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Schema dla adresu dostawy
const ShippingAddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Walidacja polskiego kodu pocztowego
        return /^\d{2}-\d{3}$/.test(v);
      },
      message: props => `${props.value} nie jest prawidłowym kodem pocztowym!`
    }
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Polska',
  },
});

// Główny schemat zamówienia
const OrderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kupujący jest wymagany'],
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Zamówienie musi zawierać co najmniej jeden produkt'],
      validate: {
        validator: function(v: any[]) {
          return v.length > 0;
        },
        message: 'Zamówienie musi zawierać co najmniej jeden produkt!'
      }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Łączna cena nie może być ujemna'],
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      required: true,
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: function() {
        return [{
          status: 'pending',
          timestamp: new Date(),
          updatedBy: this.buyer,
        }];
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
      required: true,
      index: true,
    },
    carbonFootprint: {
      type: Number,
      default: 0,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy dla wydajnych zapytań
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.product': 1 });
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, status: 1 });

// Metody instancji
OrderSchema.methods.updateStatus = async function(status: string, updatedBy: Types.ObjectId): Promise<void> {
  if (!ORDER_STATUSES.includes(status as any)) {
    throw new Error(`Nieprawidłowy status: ${status}`);
  }
  
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy,
  });
  
  // Dodatkowe działania w zależności od statusu
  if (status === 'delivered') {
    this.deliveryDate = new Date();
  }
  
  await this.save();
};

OrderSchema.methods.calculateTotalPrice = async function(): Promise<number> {
  const totalPrice = this.items.reduce(
    (sum, item) => sum + (item.quantity * item.priceAtPurchase), 
    0
  );
  
  this.totalPrice = parseFloat(totalPrice.toFixed(2));
  return this.totalPrice;
};

OrderSchema.methods.calculateCarbonFootprint = async function(): Promise<number> {
  // Pobierz produkty, aby uzyskać ich kategorie i lokalizacje
  const Product = mongoose.model('Product');
  const User = mongoose.model('User');
  
  let totalFootprint = 0;
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    
    const farmer = await User.findById(product.owner);
    if (!farmer) continue;
    
    const buyer = await User.findById(this.buyer);
    if (!buyer) continue;
    
    // Oblicz dystans między rolnikiem a kupującym
    const farmerCoords = farmer.location.coordinates;
    const buyerCoords = buyer.location.coordinates;
    
    // Użyj funkcji z shared/utils do obliczenia dystansu
    const distanceKm = calculateDistance(
      farmerCoords[1], farmerCoords[0], 
      buyerCoords[1], buyerCoords[0]
    );
    
    // Użyj funkcji z shared/utils do obliczenia śladu węglowego
    const productWeight = item.quantity; // Zakładamy, że ilość to waga w kg
    const carbonFootprint = calculateCarbonFootprint(
      distanceKm,
      productWeight,
      product.category
    );
    
    totalFootprint += carbonFootprint;
  }
  
  this.carbonFootprint = parseFloat(totalFootprint.toFixed(2));
  return this.carbonFootprint;
};

// Funkcja pomocnicza do obliczania dystansu (powinna być dostępna w shared/utils)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Promień Ziemi w km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Pre-save hook do obliczania łącznej ceny
OrderSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('items')) {
    await this.calculateTotalPrice();
    await this.calculateCarbonFootprint();
  }
  next();
});

// Middleware do automatycznego aktualizowania listy zamówień użytkownika
OrderSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    doc.buyer,
    { $addToSet: { orders: doc._id } }
  );
});

// Middleware do aktualizacji ilości produktów po złożeniu zamówienia
OrderSchema.post('save', async function(doc) {
  if (doc.status === 'paid' || doc.status === 'processing') {
    const Product = mongoose.model('Product');
    
    for (const item of doc.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.updateAvailability(product.quantity - item.quantity);
      }
    }
  }
});

// Tworzymy model
const Order = mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;