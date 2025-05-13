/**
 * Oblicza ślad węglowy na podstawie dystansu transportu i rodzaju produktu
 * 
 * @param distanceKm - dystans w kilometrach
 * @param productWeight - waga produktu w kg
 * @param productCategory - kategoria produktu
 * @returns ślad węglowy w kg CO2e
 */
export const calculateCarbonFootprint = (
    distanceKm: number,
    productWeight: number,
    productCategory: string
  ): number => {
    // Współczynniki emisji CO2 dla różnych kategorii produktów (kg CO2e / kg produktu)
    const productEmissionFactors: Record<string, number> = {
      owoce: 0.5,
      warzywa: 0.4,
      nabiał: 2.5,
      mięso: 12.0,
      pieczywo: 0.8,
      przetwory: 1.2,
      'miód i produkty pszczele': 0.3,
      'zioła i przyprawy': 0.2,
      napoje: 0.6,
      inne: 1.0
    };
  
    // Domyślny współczynnik emisji dla transportu (kg CO2e / km / kg)
    const transportEmissionFactor = 0.1;
  
    // Wybierz współczynnik emisji dla danej kategorii produktu lub użyj domyślnego
    const productFactor = productEmissionFactors[productCategory] || 1.0;
  
    // Oblicz ślad węglowy transportu
    const transportEmission = distanceKm * transportEmissionFactor * productWeight;
  
    // Oblicz ślad węglowy produkcji
    const productionEmission = productWeight * productFactor;
  
    // Całkowity ślad węglowy
    return transportEmission + productionEmission;
  };
  
  /**
   * Oblicza dystans między dwoma punktami geograficznymi (w km)
   * 
   * @param lat1 - szerokość geograficzna punktu 1
   * @param lon1 - długość geograficzna punktu 1
   * @param lat2 - szerokość geograficzna punktu 2
   * @param lon2 - długość geograficzna punktu 2
   * @returns dystans w kilometrach
   */
  export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Promień Ziemi w km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };
  
  /**
   * Konwertuje stopnie na radiany
   * 
   * @param degrees - wartość w stopniach
   * @returns wartość w radianach
   */
  const toRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
  };
  
  /**
   * Generuje unikalny identyfikator śledzenia dla produktu
   * 
   * @returns unikalny identyfikator śledzenia
   */
  export const generateTrackingId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `EKO-${timestamp}-${randomPart}`.toUpperCase();
  };
  
  /**
   * Formatuje cenę do wyświetlenia
   * 
   * @param price - cena
   * @param currency - waluta (domyślnie PLN)
   * @returns sformatowana cena
   */
  export const formatPrice = (price: number, currency: string = 'PLN'): string => {
    return `${price.toFixed(2)} ${currency}`;
  };
  
  /**
   * Formatuje datę do wyświetlenia
   * 
   * @param date - data
   * @returns sformatowana data
   */
  export const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };