import mongoose, { Document, Schema, Types } from 'mongoose';
import { ICertificate } from 'shared/types/models';
import { CERTIFICATE_TYPES } from 'shared/constants';

// Interfejs dla dokumentu mongoose
export interface CertificateDocument extends ICertificate, Document {
  // Metody instancji modelu
  isValid: () => boolean;
  addToProduct: (productId: Types.ObjectId) => Promise<void>;
}

// Schemat certyfikatu
const CertificateSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nazwa certyfikatu jest wymagana'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: CERTIFICATE_TYPES,
      required: [true, 'Typ certyfikatu jest wymagany'],
      index: true,
    },
    issuingAuthority: {
      type: String,
      required: [true, 'Nazwa organu wydającego certyfikat jest wymagana'],
      trim: true,
    },
    documentUrl: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Prosta walidacja URL
          if (!v) return true; // URL jest opcjonalny
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: props => `${props.value} nie jest prawidłowym URL!`
      }
    },
    issuedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posiadacz certyfikatu jest wymagany'],
      index: true,
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    validUntil: {
      type: Date,
      required: [true, 'Data ważności certyfikatu jest wymagana'],
      validate: {
        validator: function(v: Date) {
          return v > new Date();
        },
        message: props => `Data ważności musi być w przyszłości!`
      }
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy dla wydajnych zapytań
CertificateSchema.index({ validUntil: 1 });
CertificateSchema.index({ 'issuedTo': 1, 'type': 1 });
CertificateSchema.index({ 'isVerified': 1, 'validUntil': 1 });

// Metody instancji
CertificateSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return this.validUntil > now && this.isVerified;
};

CertificateSchema.methods.addToProduct = async function(productId: Types.ObjectId): Promise<void> {
  if (!this.isValid()) {
    throw new Error('Nie można przypisać nieważnego certyfikatu do produktu!');
  }
  
  // Dodaj produkt do certyfikatu
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    await this.save();
  }
  
  // Dodaj certyfikat do produktu
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (product) {
    if (!product.certificates.includes(this._id)) {
      product.certificates.push(this._id);
      product.isCertified = true;
      await product.save();
    }
  }
};

// Middleware do automatycznego aktualizowania listy certyfikatów użytkownika
CertificateSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    doc.issuedTo,
    { $addToSet: { certificates: doc._id } }
  );
});

// Virtual property - pozostało dni ważności
CertificateSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const validUntil = new Date(this.validUntil);
  const diffTime = validUntil.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Tworzymy model
const Certificate = mongoose.model<CertificateDocument>('Certificate', CertificateSchema);

export default Certificate;