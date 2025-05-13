import mongoose, { Document, Schema, Types } from 'mongoose';
import { IReview } from 'shared/types/models';
import { REVIEW_MODERATION_STATUSES } from 'shared/constants';

// Interfejs dla dokumentu mongoose
export interface ReviewDocument extends IReview, Document {
  // Metody instancji modelu
  approve: () => Promise<void>;
  reject: (reason?: string) => Promise<void>;
}

// Schemat recenzji
const ReviewSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Autor recenzji jest wymagany'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      validate: {
        validator: function(this: ReviewDocument, v: Types.ObjectId) {
          // Albo produkt, albo rolnik musi być podany
          return Boolean(v || this.farmer);
        },
        message: 'Recenzja musi dotyczyć produktu lub rolnika!'
      },
      index: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: function(this: ReviewDocument, v: Types.ObjectId) {
          // Albo produkt, albo rolnik musi być podany
          return Boolean(v || this.product);
        },
        message: 'Recenzja musi dotyczyć produktu lub rolnika!'
      },
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Ocena jest wymagana'],
      min: [1, 'Ocena musi być co najmniej 1'],
      max: [5, 'Ocena może być maksymalnie 5'],
    },
    comment: {
      type: String,
      required: [true, 'Komentarz jest wymagany'],
      trim: true,
      minlength: [3, 'Komentarz musi zawierać co najmniej 3 znaki'],
      maxlength: [1000, 'Komentarz może zawierać maksymalnie 1000 znaków'],
    },
    images: [{
      type: String,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: REVIEW_MODERATION_STATUSES,
      default: 'pending',
      required: true,
      index: true,
    },
    moderationNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy dla wydajnych zapytań
ReviewSchema.index({ 'author': 1, 'product': 1 }, { unique: true, sparse: true }); // Użytkownik może dodać tylko jedną recenzję do produktu
ReviewSchema.index({ 'author': 1, 'farmer': 1 }, { unique: true, sparse: true }); // Użytkownik może dodać tylko jedną recenzję do rolnika
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

// Metody instancji
ReviewSchema.methods.approve = async function(): Promise<void> {
  this.moderationStatus = 'approved';
  this.isVerified = true;
  await this.save();
  
  // Aktualizuj średnią ocenę produktu, jeśli recenzja dotyczy produktu
  if (this.product) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
      await product.calculateAverageRating();
    }
  }
  
  // Aktualizuj średnią ocenę rolnika, jeśli recenzja dotyczy rolnika
  // To wymaga dodania pola averageRating do modelu User
  if (this.farmer) {
    // Implementacja dla rolnika...
  }
};

ReviewSchema.methods.reject = async function(reason?: string): Promise<void> {
  this.moderationStatus = 'rejected';
  this.isVerified = false;
  if (reason) {
    this.moderationNote = reason;
  }
  await this.save();
};

// Pre-save hook do walidacji użytkownika
ReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Sprawdź, czy użytkownik kupił produkt, który recenzuje
    if (this.product) {
      const Order = mongoose.model('Order');
      const orders = await Order.find({
        buyer: this.author,
        'items.product': this.product,
        status: 'delivered',
      });
      
      if (orders.length === 0) {
        return next(new Error('Nie możesz recenzować produktu, którego nie kupiłeś!'));
      }
      
      // Zaznacz zamówienie jako zrecenzowane
      await Order.updateMany(
        { buyer: this.author, 'items.product': this.product },
        { isReviewed: true }
      );
    }
    
    // Sprawdź, czy użytkownik kupił jakikolwiek produkt od rolnika, którego recenzuje
    if (this.farmer) {
      const Order = mongoose.model('Order');
      const Product = mongoose.model('Product');
      
      // Znajdź produkty rolnika
      const farmerProducts = await Product.find({ owner: this.farmer });
      const farmerProductIds = farmerProducts.map(p => p._id);
      
      // Znajdź zamówienia zawierające produkty rolnika
      const orders = await Order.find({
        buyer: this.author,
        'items.product': { $in: farmerProductIds },
        status: 'delivered',
      });
      
      if (orders.length === 0) {
        return next(new Error('Nie możesz recenzować rolnika, od którego nie kupiłeś produktów!'));
      }
    }
  }
  
  next();
});

// Middleware do automatycznego aktualizowania listy recenzji użytkownika (autora)
ReviewSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    doc.author,
    { $addToSet: { reviews: doc._id } }
  );
});

// Middleware do automatycznego aktualizowania listy recenzji produktu
ReviewSchema.post('save', async function(doc) {
  if (doc.product) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(
      doc.product,
      { $addToSet: { reviews: doc._id } }
    );
  }
});

// Tworzymy model
const Review = mongoose.model<ReviewDocument>('Review', ReviewSchema);

export default Review;