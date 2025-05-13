import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from 'shared/types/models';

// Interfejs dla dokumentu mongoose, rozszerzający podstawowy interfejs IUser
export interface UserDocument extends IUser, Document {
  // Metody instancji modelu
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  generateAuthToken: () => string;
}

// Schema dla obiektu lokalizacji, używana w różnych modelach
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

// Definiujemy schemat użytkownika
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email jest wymagany'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: props => `${props.value} nie jest prawidłowym adresem email!`
      }
    },
    passwordHash: {
      type: String,
      required: [true, 'Hasło jest wymagane'],
    },
    fullName: {
      type: String,
      required: [true, 'Imię i nazwisko są wymagane'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'consumer', 'admin'],
      default: 'consumer',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Numer telefonu jest wymagany'],
      validate: {
        validator: function(v: string) {
          return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/.test(v);
        },
        message: props => `${props.value} nie jest prawidłowym numerem telefonu!`
      }
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    certificates: [{
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    }],
    createdProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    orders: [{
      type: Schema.Types.ObjectId,
      ref: 'Order',
    }],
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    localGroups: [{
      type: Schema.Types.ObjectId,
      ref: 'LocalGroup',
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatycznie dodaje pola createdAt i updatedAt
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash; // Nie zwracamy hasła w odpowiedziach JSON
      }
    }
  }
);

// Indeksy dla wydajnych zapytań
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'location.coordinates': '2dsphere' }); // Indeks geoprzestrzenny

// Metody zdefiniowane w interfejsie UserDocument
// Te metody muszą być zaimplementowane w rzeczywistym kodzie,
// tutaj pokazuję tylko ich szkielet
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Implementacja porównywania hasła
  // return await bcrypt.compare(candidatePassword, this.passwordHash);
  return true; // Placeholder
};

UserSchema.methods.generateAuthToken = function(): string {
  // Implementacja generowania tokenu JWT
  // return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return "token"; // Placeholder
};

// Pre-save hook do hashowania hasła przed zapisem
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    // Tutaj powinno być hashowanie hasła, np. używając bcrypt
    // this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Tworzymy model
const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;