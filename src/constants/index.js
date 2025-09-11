// Константы приложения
export const APP_CONFIG = {
  NAME: 'АнроТехГрупп',
  VERSION: '1.0.0',
  DESCRIPTION: 'Система поиска и бронирования фильтров'
};

// Константы для резервирования
export const RESERVE_CONFIG = {
  DEFAULT_DAYS: 3,
  MAX_DAYS: 7,
  MIN_DAYS: 1,
  EXTEND_OPTIONS: [2, 5],
  DEFAULT_QUANTITY: 1
};

// Константы для скидок
export const DISCOUNT_CONFIG = {
  OPTIONS: [5, 10, 15, 20],
  DEFAULT_PERCENT: 10,
  SALE_MULTIPLIER: 1.3,
  ROUND_TO: 5
};

// Константы для поиска
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  MAX_RESULTS: 100,
  ADMIN_CODE: 'admin123'
};

// Константы для уведомлений
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000
};

// Константы для валидации
export const VALIDATION_CONFIG = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100
};

// Константы для Firebase коллекций
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  RESERVES: 'reserves',
  META: 'meta'
};

// Константы для роутинга
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  FILTERS: '/filters',
  RESERVES: '/reserves',
  PROFILE: '/profile',
  DOCS: '/docs',
  GUEST: '/guest'
};

// Константы для ролей пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Константы для статусов резервов
export const RESERVE_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};
