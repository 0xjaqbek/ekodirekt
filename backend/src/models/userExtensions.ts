import mongoose, { Schema } from 'mongoose';
import { UserDocument } from './User';

/**
 * Dodaje pole isActive do modelu User
 * To pole będzie używane do dezaktywacji kont zamiast ich usuwania
 */
export const addIsActiveFieldToUserSchema = () => {
  // Pobranie schematu User
  const UserSchema = mongoose.model('User').schema as Schema;
  
  // Dodanie pola isActive jeśli jeszcze go nie ma
  if (!UserSchema.path('isActive')) {
    UserSchema.add({
      isActive: {
        type: Boolean,
        default: true,
      },
    });
  }
  
  // Dodanie pola deactivatedAt jeśli jeszcze go nie ma
  if (!UserSchema.path('deactivatedAt')) {
    UserSchema.add({
      deactivatedAt: {
        type: Date,
      },
    });
  }
};

/**
 * Hook przed zapytaniem find/findOne, który filtruje nieaktywnych użytkowników
 * Dzięki temu nieaktywni użytkownicy są domyślnie ukrywani w zapytaniach
 */
export const addIsActiveFilterToUserQueries = () => {
  const UserSchema = mongoose.model('User').schema as Schema;
  
  // Dodaj hook do zapytań find, findOne, findById, countDocuments
  UserSchema.pre(/^find/, function(this: any, next) {
    // Nie dodawaj filtru, jeśli jawnie podano isActive w zapytaniu
    if (this._conditions.isActive === undefined) {
      this.where({ isActive: { $ne: false } });
    }
    next();
  });
};

/**
 * Metoda do "miękkiego" usuwania konta użytkownika
 * Zamiast faktycznego usunięcia z bazy, konto jest dezaktywowane
 */
export const addSoftDeleteMethodToUserSchema = () => {
  const UserSchema = mongoose.model('User').schema as Schema;
  
  // Dodaj metodę softDelete do modelu User
  UserSchema.methods.softDelete = async function(this: UserDocument): Promise<void> {
    this.isActive = false;
    this.deactivatedAt = new Date();
    await this.save();
  };
};

/**
 * Inicjalizacja dodatkowych pól i metod dla modelu User
 */
export const initUserModelExtensions = () => {
  // Dodaj pole isActive do modelu User
  addIsActiveFieldToUserSchema();
  
  // Dodaj filtrowanie nieaktywnych użytkowników w zapytaniach
  addIsActiveFilterToUserQueries();
  
  // Dodaj metodę softDelete do modelu User
  addSoftDeleteMethodToUserSchema();
  
  console.log('Rozszerzenia modelu User zostały zainicjalizowane');
};