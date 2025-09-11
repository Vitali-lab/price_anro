const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Функция для копирования файлов
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Функция для удаления файлов и папок
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (let entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        removeDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    
    fs.rmdirSync(dirPath);
  }
}

try {
  // Сборка проекта
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Переключение на ветку gh-pages
  console.log('Switching to gh-pages branch...');
  execSync('git checkout gh-pages', { stdio: 'inherit' });

  // Очистка ветки gh-pages (кроме .git)
  console.log('Cleaning gh-pages branch...');
  const files = fs.readdirSync('.');
  for (let file of files) {
    if (file !== '.git' && file !== '.gitignore') {
      const stat = fs.statSync(file);
      if (stat.isDirectory()) {
        removeDir(file);
      } else {
        fs.unlinkSync(file);
      }
    }
  }

  // Копирование файлов из dist в корень
  console.log('Copying files from dist to root...');
  copyDir('dist', '.');

  // Добавление и коммит изменений
  console.log('Committing changes...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Deploy latest version with SPA routing"', { stdio: 'inherit' });
  execSync('git push origin gh-pages', { stdio: 'inherit' });

  // Возврат на основную ветку
  console.log('Switching back to master branch...');
  execSync('git checkout master', { stdio: 'inherit' });

  console.log('Deployment completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
