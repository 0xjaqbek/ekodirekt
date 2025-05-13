import { z } from 'zod';

/**
 * Schemat walidacji dla formularza logowania
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email jest wymagany' })
    .email({ message: 'Podaj prawidłowy adres email' }),
  password: z
    .string()
    .min(1, { message: 'Hasło jest wymagane' }),
  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schemat walidacji dla formularza rejestracji
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email jest wymagany' })
    .email({ message: 'Podaj prawidłowy adres email' }),
  password: z
    .string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Hasło musi zawierać co najmniej jedną małą literę, jedną dużą literę i jedną cyfrę',
    }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Potwierdzenie hasła jest wymagane' }),
  fullName: z
    .string()
    .min(2, { message: 'Imię i nazwisko musi zawierać co najmniej 2 znaki' })
    .max(50, { message: 'Imię i nazwisko może zawierać maksymalnie 50 znaków' }),
  role: z
    .enum(['farmer', 'consumer'], {
      errorMap: () => ({ message: 'Wybierz rolę: rolnik lub konsument' }),
    }),
  phoneNumber: z
    .string()
    .min(9, { message: 'Numer telefonu musi mieć co najmniej 9 znaków' })
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/, {
      message: 'Podaj prawidłowy numer telefonu',
    }),
  'location.address': z
    .string()
    .min(5, { message: 'Adres musi mieć co najmniej 5 znaków' })
    .max(200, { message: 'Adres może mieć maksymalnie 200 znaków' }),
  'location.coordinates.0': z
    .number()
    .min(-180, { message: 'Długość geograficzna musi być większa od -180' })
    .max(180, { message: 'Długość geograficzna musi być mniejsza od 180' })
    .optional()
    .nullable(),
  'location.coordinates.1': z
    .number()
    .min(-90, { message: 'Szerokość geograficzna musi być większa od -90' })
    .max(90, { message: 'Szerokość geograficzna musi być mniejsza od 90' })
    .optional()
    .nullable(),
  terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Musisz zaakceptować regulamin',
    }),
  bio: z
    .string()
    .max(500, { message: 'Bio może zawierać maksymalnie 500 znaków' })
    .optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Przetwarza dane formularza rejestracji do odpowiedniego formatu dla API
 */
export const formatRegisterData = (data: RegisterFormData) => {
  // Usuń niepotrzebne pola
  const { confirmPassword, terms, ...rest } = data;
  
  // Sformatuj lokalizację
  const location = {
    coordinates: [
      data['location.coordinates.0'] || 0,
      data['location.coordinates.1'] || 0
    ] as [number, number],
    address: data['location.address']
  };
  
  // Usuń pola dot. lokalizacji
  const { 'location.coordinates.0': lng, 'location.coordinates.1': lat, 'location.address': address, ...userData } = rest;
  
  return {
    ...userData,
    location,
  };
};