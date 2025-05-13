import mongoose, { Document, Schema, Types } from 'mongoose';
import { IProduct } from 'shared/types/models';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, PRODUCT_STATUSES } from 'shared/constants';
import { generateTrackingId } from 'shared/utils';

// Interfejs dla dokumentu mongoose
export interface ProductDocument extends IProduct, Document {
  // Ewentualne dodatkowe metody instancji
  updateAvailability: (newQuantity: number) => Promise<void>;
  calculateAverageRating: () => Promise<number>;
}

// Schema dla obiektu w historii statusów produktu
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: PRODUCT_STATUSES,
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
  note: {
    type: String,
  },
});

// Schema dla lokalizacji, taka sama jak w modelu User
const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && 
               v[1] >= -90 && v[1] <= 90;
      },
      message: props => `${props.value} nie jest prawidłową parą współrzędnych!`
    }
  },
  address: {
    type: String,
    required: true,
  }
});

// Główny schemat produktu
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nazwa produktu jest wymagana'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Opis produktu jest wymagany'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Cena produktu jest wymagana'],
      min: [0, 'Cena nie może być ujemna'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ilość produktu jest wymagana'],
      min: [0, 'Ilość nie może być ujemna'],
    },
    unit: {
      type: String,
      required: [true, 'Jednostka miary jest wymagana'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Kategoria produktu jest wymagana'],
      enum: PRODUCT_CATEGORIES,
      index: true,
    },
    subcategory: {
      type: String,
      validate: {
        validator: function(this: ProductDocument, v: string) {
          const category = this.category as keyof typeof PRODUCT_SUBCATEGORIES;
          return PRODUCT_SUBCATEGORIES[category].includes(v as any);
        },
        message: props => `${props.value} nie jest prawidłową podkategorią dla wybranej kategorii!`
      },
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Właściciel produktu jest wymagany'],
      index: true,
    },
    images: [{
      type: String,
    }],
    certificates: [{
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    }],
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: 'available',
      required: true,
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    location: {
      type: LocationSchema,
      required: true,
    },
    harvestDate: {
      type: Date,
    },
    trackingId: {
      type: String,
      unique: true,
      default: () => generateTrackingId(),
      required: true,
      index: true,
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isCertified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy dla wydajnych zapytań
ProductSchema.index({ name: 'text', description: 'text' }); // Indeks tekstowy dla wyszukiwania
ProductSchema.index({ 'location.coordinates': '2dsphere' }); // Indeks geoprzestrzenny
ProductSchema.index({ price: 1 }); // Indeks dla sortowania po cenie
ProductSchema.index({ harvestDate: -1 }); // Indeks dla sortowania po dacie zbioru

// Metody instancji
ProductSchema.methods.updateAvailability = async function(newQuantity: number): Promise<void> {
  this.quantity = newQuantity;
  
  // Aktualizacja statusu produktu na podstawie ilości
  if (newQuantity <= 0) {
    this.status = 'unavailable';
    this.statusHistory.push({
      status: 'unavailable',
      timestamp: new Date(),
      updatedBy: this.owner,
      note: 'Produkt niedostępny - brak w magazynie'
    });
  } else if (this.status === 'unavailable') {
    this.status = 'available';
    this.statusHistory.push({
      status: 'available',
      timestamp: new Date(),
      updatedBy: this.owner,
      note: 'Produkt dostępny'
    });
  }
  
  await this.save();
};

ProductSchema.methods.calculateAverageRating = async function(): Promise<number> {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });
  
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;
  
  this.averageRating = parseFloat(average.toFixed(1));
  await this.save();
  
  return this.averageRating;
};

// Pre-save hook do aktualizacji statusu produktu
ProductSchema.pre('save', function(next) {
  // Sprawdzamy, czy produkt ma certyfikaty
  if (this.isModified('certificates')) {
    this.isCertified = this.certificates.length > 0;
  }
  
  // Aktualizuj status produktu na podstawie ilości, jeśli ilość uległa zmianie
  if (this.isModified('quantity')) {
    if (this.quantity <= 0 && this.status !== 'unavailable') {
      this.status = 'unavailable';
      this.statusHistory.push({
        status: 'unavailable',
        timestamp: new Date(),
        updatedBy: this.owner,
        note: 'Produkt niedostępny - brak w magazynie'
      });
    } else if (this.quantity > 0 && this.status === 'unavailable') {
      this.status = 'available';
      this.statusHistory.push({
        status: 'available',
        timestamp: new Date(),
        updatedBy: this.owner,
        note: 'Produkt dostępny'
      });
    }
  }
  
  next();
});

// Middleware do automatycznego aktualizowania listy produktów rolnika
ProductSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    doc.owner,
    { $addToSet: { createdProducts: doc._id } }
  );
});

// Tworzymy model
const Product = mongoose.model<ProductDocument>('Product', ProductSchema);

export default Product;