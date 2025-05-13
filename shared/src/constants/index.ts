// Wspólne stałe dla frontendu i backendu
export const PRODUCT_CATEGORIES = [
    'owoce',
    'warzywa',
    'nabiał',
    'mięso',
    'pieczywo',
    'przetwory',
    'miód i produkty pszczele',
    'zioła i przyprawy',
    'napoje',
    'inne'
  ] as const;
  
  export const PRODUCT_SUBCATEGORIES = {
    owoce: ['jabłka', 'gruszki', 'śliwki', 'jagody', 'truskawki', 'maliny', 'borówki', 'inne'],
    warzywa: ['pomidory', 'ogórki', 'marchew', 'ziemniaki', 'brokuły', 'kapusta', 'sałata', 'inne'],
    nabiał: ['mleko', 'sery', 'jogurty', 'masło', 'śmietana', 'inne'],
    mięso: ['wołowina', 'wieprzowina', 'drób', 'inne'],
    pieczywo: ['chleb', 'bułki', 'ciasta', 'inne'],
    przetwory: ['dżemy', 'soki', 'kiszonki', 'konfitury', 'inne'],
    'miód i produkty pszczele': ['miód wielokwiatowy', 'miód spadziowy', 'miód lipowy', 'propolis', 'pyłek pszczeli', 'inne'],
    'zioła i przyprawy': ['świeże zioła', 'suszone zioła', 'mieszanki przypraw', 'inne'],
    napoje: ['soki', 'syropy', 'herbaty ziołowe', 'inne'],
    inne: ['inne']
  } as const;
  
  export const CERTIFICATE_TYPES = [
    'organic',
    'eco',
    'fair-trade',
    'other'
  ] as const;
  
  export const ORDER_STATUSES = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ] as const;
  
  export const PAYMENT_STATUSES = [
    'pending',
    'completed',
    'failed',
    'refunded'
  ] as const;
  
  export const PRODUCT_STATUSES = [
    'available',
    'preparing',
    'shipped',
    'delivered',
    'unavailable'
  ] as const;
  
  export const USER_ROLES = [
    'farmer',
    'consumer',
    'admin'
  ] as const;
  
  export const REVIEW_MODERATION_STATUSES = [
    'pending',
    'approved',
    'rejected'
  ] as const;
  
  export const LOCAL_GROUP_MEMBER_ROLES = [
    'admin',
    'member'
  ] as const;
  
  export const UNITS = [
    'kg',
    'g',
    'l',
    'ml',
    'szt'
  ] as const;