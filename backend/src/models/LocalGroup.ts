import mongoose, { Document, Schema, Types } from 'mongoose';
import { ILocalGroup } from 'shared/types/models';
import { LOCAL_GROUP_MEMBER_ROLES } from 'shared/constants';

// Interfejs dla dokumentu mongoose
export interface LocalGroupDocument extends ILocalGroup, Document {
  // Metody instancji modelu
  addMember: (userId: Types.ObjectId, role?: string) => Promise<void>;
  removeMember: (userId: Types.ObjectId) => Promise<void>;
  addProduct: (productId: Types.ObjectId) => Promise<void>;
  removeProduct: (productId: Types.ObjectId) => Promise<void>;
  isUserInGroup: (userId: Types.ObjectId) => boolean;
  isUserAdmin: (userId: Types.ObjectId) => boolean;
}

// Schema dla obiektu członka grupy
const MemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: LOCAL_GROUP_MEMBER_ROLES,
    default: 'member',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Schema dla lokalizacji, taka sama jak w innych modelach
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

// Główny schemat grupy lokalnej
const LocalGroupSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nazwa grupy jest wymagana'],
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Opis grupy jest wymagany'],
      trim: true,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    radius: {
      type: Number,
      required: [true, 'Promień działania grupy jest wymagany'],
      min: [1, 'Promień musi być większy niż 1 km'],
      max: [500, 'Promień nie może być większy niż 500 km'],
    },
    members: {
      type: [MemberSchema],
      validate: {
        validator: function(v: any[]) {
          // Musi być co najmniej jeden administrator
          return v.some(member => member.role === 'admin');
        },
        message: 'Grupa musi mieć co najmniej jednego administratora!'
      }
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy dla wydajnych zapytań
LocalGroupSchema.index({ 'location.coordinates': '2dsphere' }); // Indeks geoprzestrzenny dla wyszukiwania grup w okolicy
LocalGroupSchema.index({ 'members.user': 1 }); // Indeks dla szybkiego wyszukiwania członków

// Metody instancji
LocalGroupSchema.methods.addMember = async function(userId: Types.ObjectId, role: string = 'member'): Promise<void> {
  if (!LOCAL_GROUP_MEMBER_ROLES.includes(role as any)) {
    throw new Error(`Nieprawidłowa rola: ${role}`);
  }
  
  // Sprawdź, czy użytkownik już jest członkiem
  const existingMember = this.members.find((m: any) => m.user.toString() === userId.toString());
  
  if (existingMember) {
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role,
      joinedAt: new Date(),
    });
  }
  
  await this.save();
  
  // Aktualizuj listę grup użytkownika
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { localGroups: this._id } }
  );
};

LocalGroupSchema.methods.removeMember = async function(userId: Types.ObjectId): Promise<void> {
  // Sprawdź, czy użytkownik jest członkiem
  const memberIndex = this.members.findIndex((m: any) => m.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    throw new Error('Użytkownik nie jest członkiem tej grupy!');
  }
  
  // Sprawdź, czy to nie jest ostatni administrator
  if (
    this.members[memberIndex].role === 'admin' &&
    this.members.filter((m: any) => m.role === 'admin').length === 1
  ) {
    throw new Error('Nie można usunąć ostatniego administratora grupy!');
  }
  
  // Usuń członka z grupy
  this.members.splice(memberIndex, 1);
  await this.save();
  
  // Aktualizuj listę grup użytkownika
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    userId,
    { $pull: { localGroups: this._id } }
  );
};

LocalGroupSchema.methods.addProduct = async function(productId: Types.ObjectId): Promise<void> {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    await this.save();
  }
};

LocalGroupSchema.methods.removeProduct = async function(productId: Types.ObjectId): Promise<void> {
  const productIndex = this.products.indexOf(productId);
  if (productIndex !== -1) {
    this.products.splice(productIndex, 1);
    await this.save();
  }
};

LocalGroupSchema.methods.isUserInGroup = function(userId: Types.ObjectId): boolean {
  return this.members.some((m: any) => m.user.toString() === userId.toString());
};

LocalGroupSchema.methods.isUserAdmin = function(userId: Types.ObjectId): boolean {
  const member = this.members.find((m: any) => m.user.toString() === userId.toString());
  return member && member.role === 'admin';
};

// Statics - metody klasowe
LocalGroupSchema.statics.findNearby = async function(coordinates: [number, number], maxDistance: number = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance, // W metrach
      }
    }
  });
};

// Validation hooks
LocalGroupSchema.pre('save', function(next) {
  if (this.isNew && this.members.length === 0) {
    // Jeśli grupa jest nowa i nie ma członków, dodaj twórcę jako administratora
    // Zakładamy, że creator_id jest przekazywany podczas tworzenia
    if (this._creator) {
      this.members.push({
        user: this._creator,
        role: 'admin',
        joinedAt: new Date(),
      });
    } else {
      return next(new Error('Nie podano twórcy grupy!'));
    }
  }
  
  next();
});

// Virtual dla liczby członków
LocalGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Tworzymy model
const LocalGroup = mongoose.model<LocalGroupDocument>('LocalGroup', LocalGroupSchema);

export default LocalGroup;