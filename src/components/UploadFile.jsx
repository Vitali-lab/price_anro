
import { useState } from 'react';
import styles from './UploadFile.module.css';
import { Loading } from './Loading';
import { useToast } from '../context/ToastContext';

export const UploadFile = ({ handleFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showError('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
      return;
    }

    setIsUploading(true);
    showInfo('Начинаем загрузку файла...');
    
    try {
      await handleFileUpload(e);
      showSuccess('Файл успешно загружен и обработан!');
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      showError('Ошибка при загрузке файла. Попробуйте еще раз.');
    } finally {
      // Сброс состояния загрузки через небольшую задержку
      setTimeout(() => {
        setIsUploading(false);
        // Сброс input для возможности повторной загрузки того же файла
        e.target.value = '';
      }, 1000);
    }
  };

  return (
    <div className={styles.uploadPrice}>
      <h2>Загрузите Excel-файл</h2>
      {isUploading ? (
        <div className={styles.uploadingContainer}>
          <Loading size="medium" text="Загрузка Excel-файла..." />
          <p className={styles.uploadingText}>Обработка данных...</p>
        </div>
      ) : (
        <div className={styles.inputContainer}>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isUploading}
          />
          <p className={styles.helpText}>
            Выберите Excel-файл для обновления базы данных фильтров
          </p>
        </div>
      )}
    </div>
  );
};