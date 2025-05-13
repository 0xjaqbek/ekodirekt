import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, formatRegisterData, type RegisterFormData } from '../validation/authSchemas';
import { useAuth } from '../hooks/useAuth';

/**
 * Strona rejestracji
 */
const RegisterPage: React.FC = () => {
  const { register: registerUser, loading, error, clearError } = useAuth();
  const [step, setStep] = useState<number>(1);
  
  // Inicjalizacja formularza z React Hook Form i walidacją Zod
  const { 
    register, 
    handleSubmit, 
    watch,
    trigger,
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'consumer',
      phoneNumber: '',
      'location.address': '',
      'location.coordinates.0': 0,
      'location.coordinates.1': 0,
      terms: false,
      bio: '',
    },
    mode: 'onChange'
  });

  // Obserwuj wybrane pola formularza
  const selectedRole = watch('role');

  // Przejdź do następnego kroku
  const goToNextStep = async () => {
    // Walidacja pól w aktualnym kroku
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['email', 'password', 'confirmPassword', 'fullName', 'role'];
    } else if (step === 2) {
      fieldsToValidate = ['phoneNumber', 'location.address'];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  // Wróć do poprzedniego kroku
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Obsługa przesłania formularza
  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    
    // Formatowanie danych zgodnie z oczekiwanym przez API formatem
    const formattedData = formatRegisterData(data);
    
    await registerUser(formattedData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zarejestruj się w EkoDirekt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              zaloguj się na istniejące konto
            </Link>
          </p>
        </div>

        {/* Komunikat błędu */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pasek postępu */}
        <div className="w-full">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-light">
                Krok {step} z 3
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary">
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-light">
            <div style={{ width: `${(step / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
          </div>
        </div>

        {/* Formularz rejestracji */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Krok 1: Dane podstawowe */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adres email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Hasło
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Potwierdź hasło
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Imię i nazwisko
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  {...register('fullName')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rola w systemie
                </label>
                <fieldset className="mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="consumer"
                        type="radio"
                        value="consumer"
                        {...register('role')}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <label htmlFor="consumer" className="ml-3 block text-sm text-gray-700">
                        Konsument - chcę kupować produkty ekologiczne
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="farmer"
                        type="radio"
                        value="farmer"
                        {...register('role')}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <label htmlFor="farmer" className="ml-3 block text-sm text-gray-700">
                        Rolnik - chcę sprzedawać produkty ekologiczne
                      </label>
                    </div>
                  </div>
                </fieldset>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Krok 2: Dane kontaktowe */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Numer telefonu
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  {...register('phoneNumber')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="np. 123-456-789"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <input
                  id="location.address"
                  type="text"
                  {...register('location.address')}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors['location.address'] ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="ul. Przykładowa 123, 00-000 Miasto"
                />
                {errors['location.address'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.address'].message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location.coordinates.0" className="block text-sm font-medium text-gray-700">
                    Długość geograficzna (opcjonalnie)
                  </label>
                  <input
                    id="location.coordinates.0"
                    type="number"
                    step="0.000001"
                    {...register('location.coordinates.0', { valueAsNumber: true })}
                    className={`mt-1 block w-full py-2 px-3 border ${
                      errors['location.coordinates.0'] ? 'border-red-300' : 'border-gray-300'
                    } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  />
                  {errors['location.coordinates.0'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.coordinates.0'].message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="location.coordinates.1" className="block text-sm font-medium text-gray-700">
                    Szerokość geograficzna (opcjonalnie)
                  </label>
                  <input
                    id="location.coordinates.1"
                    type="number"
                    step="0.000001"
                    {...register('location.coordinates.1', { valueAsNumber: true })}
                    className={`mt-1 block w-full py-2 px-3 border ${
                      errors['location.coordinates.1'] ? 'border-red-300' : 'border-gray-300'
                    } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  />
                  {errors['location.coordinates.1'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.coordinates.1'].message}</p>
                  )}
                </div>
              </div>

              {/* Dodatkowe pole dla rolników */}
              {selectedRole === 'farmer' && (
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Opis gospodarstwa (opcjonalnie)
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    {...register('bio')}
                    className={`mt-1 block w-full py-2 px-3 border ${
                      errors.bio ? 'border-red-300' : 'border-gray-300'
                    } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                    placeholder="Krótki opis Twojego gospodarstwa i produktów..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Krok 3: Podsumowanie i warunki */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      Po rejestracji na Twój adres email zostanie wysłany link aktywacyjny. Kliknij w niego, aby aktywować konto.
                    </p>
                  </div>
                </div>
              </div>
            
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">Podsumowanie</h3>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm font-medium text-gray-900">{watch('email')}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Imię i nazwisko:</dt>
                    <dd className="text-sm font-medium text-gray-900">{watch('fullName')}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Rola:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {watch('role') === 'consumer' ? 'Konsument' : 'Rolnik'}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Telefon:</dt>
                    <dd className="text-sm font-medium text-gray-900">{watch('phoneNumber')}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Adres:</dt>
                    <dd className="text-sm font-medium text-gray-900">{watch('location.address')}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms')}
                    className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${
                      errors.terms ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    Akceptuję{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-dark">
                      regulamin
                    </Link>{' '}
                    i{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-dark">
                      politykę prywatności
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Przyciski nawigacji */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Wstecz
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Dalej
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rejestracja...
                  </>
                ) : (
                  'Zarejestruj się'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;