// Регистрация Service Worker для PWA
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Проверяем обновления каждые 30 секунд
          setInterval(() => {
            registration.update();
          }, 30000);
          
          // Проверяем обновления
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Новое обновление доступно - принудительно обновляем
                console.log('Новое обновление доступно, перезагружаем...');
                window.location.reload();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Проверка возможности установки PWA
export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Показать промпт установки PWA
export const showInstallPrompt = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Предотвращаем автоматический показ промпта
    e.preventDefault();
    deferredPrompt = e;
    
    // Показываем кнопку установки
    const installButton = document.createElement('button');
    installButton.textContent = 'Установить приложение';
    installButton.className = 'install-pwa-button';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background:rgb(29, 29, 29);
      color: #000;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    installButton.addEventListener('click', () => {
      // Показываем промпт установки
      deferredPrompt.prompt();
      
      // Ждем ответа пользователя
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь принял установку PWA');
        } else {
          console.log('Пользователь отклонил установку PWA');
        }
        deferredPrompt = null;
        
        // Удаляем кнопку
        installButton.remove();
      });
    });
    
    document.body.appendChild(installButton);
  });
};

// Инициализация PWA
export const initPWA = () => {
  registerSW();
  showInstallPrompt();
};
