// Утилиты для работы с днями рождения

/**
 * Форматирует дату рождения для отображения (только день и месяц)
 * @param {string} birthday - Дата рождения в формате MM-DD
 * @returns {string} Отформатированная дата
 */
export const formatBirthday = (birthday) => {
  if (!birthday) return '';

  const [month, day] = birthday.split('-');
  const date = new Date(2024, month - 1, day); // Используем текущий год для отображения

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long'
  });
};

/**
 * Вычисляет возраст по дате рождения (только для отображения, без года)
 * @param {string} birthday - Дата рождения в формате MM-DD
 * @returns {string} Текст о возрасте (без конкретного числа)
 */
export const calculateAge = (birthday) => {
  if (!birthday) return '';

  // Поскольку мы не знаем год, просто возвращаем общий текст
  return 'день рождения';
};

/**
 * Вычисляет количество дней до дня рождения (только день и месяц)
 * @param {string} birthday - Дата рождения в формате MM-DD
 * @returns {number} Количество дней (0 если сегодня)
 */
export const daysUntilBirthday = (birthday) => {
  if (!birthday) return Infinity;

  const today = new Date();
  const [month, day] = birthday.split('-');

  // Устанавливаем год на текущий
  const currentYearBirthday = new Date(today.getFullYear(), month - 1, day);

  // Если день рождения уже прошел в этом году, берем следующий год
  if (currentYearBirthday < today) {
    currentYearBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = currentYearBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Проверяет, является ли сегодня днем рождения (только день и месяц)
 * @param {string} birthday - Дата рождения в формате MM-DD
 * @returns {boolean} true если сегодня день рождения
 */
export const isTodayBirthday = (birthday) => {
  if (!birthday) return false;

  const today = new Date();
  const [month, day] = birthday.split('-');

  return today.getMonth() + 1 === parseInt(month) &&
         today.getDate() === parseInt(day);
};

/**
 * Получает ближайшие дни рождения (в течение следующих 30 дней)
 * @param {Array} users - Массив пользователей
 * @returns {Array} Отсортированный массив пользователей с ближайшими днями рождения
 */
export const getUpcomingBirthdays = (users) => {
  if (!users || !Array.isArray(users)) return [];

  const today = new Date();
  const upcoming = users
    .filter(user => user.birthday && !isTodayBirthday(user.birthday))
    .map(user => {
      const days = daysUntilBirthday(user.birthday);
      return { ...user, daysUntil: days };
    })
    .filter(user => user.daysUntil > 0 && user.daysUntil <= 30) // В течение 30 дней
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming;
};

/**
 * Получает дни рождения, которые приходятся на сегодня
 * @param {Array} users - Массив пользователей
 * @returns {Array} Массив пользователей, у которых сегодня день рождения
 */
export const getTodayBirthdays = (users) => {
  if (!users || !Array.isArray(users)) return [];

  return users.filter(user => isTodayBirthday(user.birthday));
};

/**
 * Валидирует дату рождения (только день и месяц)
 * @param {string} birthday - Дата рождения в формате MM-DD
 * @returns {Object} Результат валидации
 */
export const validateBirthday = (birthday) => {
  if (!birthday) {
    return { isValid: false, message: 'Дата рождения обязательна' };
  }

  // Проверяем формат MM-DD
  const birthdayRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!birthdayRegex.test(birthday)) {
    return { isValid: false, message: 'Неверный формат даты. Используйте ММ-ДД' };
  }

  const [month, day] = birthday.split('-').map(Number);

  // Проверяем корректность даты
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) {
    return { isValid: false, message: 'Неверная дата для выбранного месяца' };
  }

  return { isValid: true, message: 'Дата рождения корректна' };
};
