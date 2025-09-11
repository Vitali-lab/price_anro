// Валидация ИНН
export const validateINN = (inn) => {
  if (!inn) return true; // Необязательное поле
  
  const innStr = inn.toString().replace(/\D/g, '');
  
  if (innStr.length === 10) {
    // ИНН для юридических лиц
    const weights1 = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(innStr[i]) * weights1[i];
    }
    
    const checkDigit = sum % 11;
    const expectedCheckDigit = checkDigit < 2 ? checkDigit : checkDigit % 10;
    
    return parseInt(innStr[9]) === expectedCheckDigit;
  } else if (innStr.length === 12) {
    // ИНН для физических лиц
    const weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    
    let sum1 = 0;
    for (let i = 0; i < 10; i++) {
      sum1 += parseInt(innStr[i]) * weights1[i];
    }
    
    let sum2 = 0;
    for (let i = 0; i < 11; i++) {
      sum2 += parseInt(innStr[i]) * weights2[i];
    }
    
    const checkDigit1 = sum1 % 11;
    const checkDigit2 = sum2 % 11;
    
    const expectedCheckDigit1 = checkDigit1 < 2 ? checkDigit1 : checkDigit1 % 10;
    const expectedCheckDigit2 = checkDigit2 < 2 ? checkDigit2 : checkDigit2 % 10;
    
    return parseInt(innStr[10]) === expectedCheckDigit1 && 
           parseInt(innStr[11]) === expectedCheckDigit2;
  }
  
  return false;
};

// Валидация КПП
export const validateKPP = (kpp) => {
  if (!kpp) return true; // Необязательное поле
  
  const kppStr = kpp.toString().replace(/\D/g, '');
  
  // КПП должен содержать 9 цифр
  if (kppStr.length !== 9) return false;
  
  // Первые две цифры - код региона (01-99)
  const regionCode = parseInt(kppStr.substring(0, 2));
  if (regionCode < 1 || regionCode > 99) return false;
  
  return true;
};

// Валидация ОГРН
export const validateOGRN = (ogrn) => {
  if (!ogrn) return true; // Необязательное поле
  
  const ogrnStr = ogrn.toString().replace(/\D/g, '');
  
  if (ogrnStr.length === 13) {
    // ОГРН для юридических лиц
    const num = BigInt(ogrnStr.substring(0, 12));
    const checkDigit = parseInt(ogrnStr[12]);
    const expectedCheckDigit = Number(num % BigInt(11)) % 10;
    
    return checkDigit === expectedCheckDigit;
  } else if (ogrnStr.length === 15) {
    // ОГРН для индивидуальных предпринимателей
    const num = BigInt(ogrnStr.substring(0, 14));
    const checkDigit = parseInt(ogrnStr[14]);
    const expectedCheckDigit = Number(num % BigInt(13)) % 10;
    
    return checkDigit === expectedCheckDigit;
  }
  
  return false;
};

// Валидация email
export const validateEmail = (email) => {
  if (!email) return true; // Необязательное поле
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация телефона
export const validatePhone = (phone) => {
  if (!phone) return true; // Необязательное поле
  
  const phoneStr = phone.replace(/\D/g, '');
  
  // Российские номера: 7XXXXXXXXXX или 8XXXXXXXXXX
  if (phoneStr.length === 11) {
    return phoneStr.startsWith('7') || phoneStr.startsWith('8');
  }
  
  return false;
};

// Валидация имени пользователя
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, message: "Логин не может быть пустым" };
  }
  
  // Имя пользователя должно содержать только буквы, цифры и подчеркивания
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: "Логин может содержать только буквы, цифры и подчеркивания" };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: "Логин должен содержать минимум 3 символа" };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: "Логин не должен превышать 20 символов" };
  }
  
  return { isValid: true, message: "" };
};

// Валидация пароля
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, message: "Пароль не может быть пустым" };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: "Пароль должен содержать минимум 6 символов" };
  }
  
  return { isValid: true, message: "" };
};