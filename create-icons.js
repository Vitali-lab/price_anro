// Простой скрипт для создания базовых иконок
const fs = require('fs');
const path = require('path');

// Создаем простую SVG иконку
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Фон -->
    <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size/8}"/>
    
    <!-- Фильтр -->
    <g transform="translate(${size/4}, ${size/4})">
      <!-- Основа фильтра -->
      <rect x="0" y="${size/8}" width="${size/2}" height="${size/4}" fill="#83f083" rx="${size/32}"/>
      
      <!-- Верхняя часть -->
      <rect x="${size/16}" y="0" width="${size/2.5}" height="${size/8}" fill="#83f083" rx="${size/64}"/>
      
      <!-- Центральная часть -->
      <rect x="${size/8}" y="-${size/16}" width="${size/4}" height="${size/12}" fill="#83f083" rx="${size/64}"/>
      
      <!-- Детали -->
      <circle cx="${size/8}" cy="${size/32}" r="${size/64}" fill="#1a1a1a"/>
      <circle cx="${size/4}" cy="${size/32}" r="${size/64}" fill="#1a1a1a"/>
      <circle cx="${size/6}" cy="${size/6}" r="${size/48}" fill="#1a1a1a"/>
    </g>
    
    <!-- Текст -->
    <text x="${size/2}" y="${size*0.8}" text-anchor="middle" fill="#83f083" font-family="Arial, sans-serif" font-size="${size/20}" font-weight="bold">АнроТех</text>
  </svg>`;
};

// Создаем иконки разных размеров
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(__dirname, 'icons', fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Создана иконка: ${fileName}`);
});

console.log('Все иконки созданы!');

