import { useEffect, useState } from "react";
import styles from './SearchFilter.module.css';

export const SearchFilter = ({ jsonData = [],sale,setUpload,upload }) => {  // Добавлено значение по умолчанию
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);

  const onChange = ({ target }) => {
    setValue(target.value);
  };
  
  useEffect(() => {

    if (!Array.isArray(jsonData)) {
      setResults([]);
      return;
    }

    if (!value.trim()) {
      setResults([]);
      return;
    }
    if(value === 'admin123'){
    setUpload(!upload)
  } else {
    setUpload(false)
  }


    const searchTerm = value.toLowerCase().trim();
    
    const filteredResults = jsonData.filter(item => {
      if (!item) return false;
  
      const nameMatch = item['Номенклатура']?.toLowerCase().includes(searchTerm)||item['Артикул']?.toLowerCase().includes(searchTerm)
      
      // Можно добавить поиск по другим полям при необходимости
      // const stockMatch = item['Остаток']?.toString().includes(searchTerm);
      // const priceMatch = item['Цена']?.toString().includes(searchTerm);
      
      return nameMatch; // || stockMatch || priceMatch;
    });
  
    setResults(filteredResults);
  }, [value, jsonData]);

  return (
    <div className={styles.container}>
      <input 
        type="text" 
        value={value} 
        placeholder="Введите номер фильтра" 
        onChange={onChange}
        className={styles.input}
        onKeyDown={(e)=>{
          if(e.key === 'NumLock') {
               setUpload(!upload)
          }
        }}
      />
    
      
      {results.length > 0 ? (
        <div className={styles.results}>
          {results.map((item, index) => {
            const salePrice = item['Цена'] * 1.3
            return(
            <div key={`${item['Номенклатура']}-${index}`} className={styles.filterItem}>
              <p className={styles.name}>{item['Номенклатура']}</p>
              <p className={styles.analogs}>Аналоги: {item['Артикул']}</p>
              <p className={styles.stock}>Остаток: {item['Остаток']}</p>
              <p className={styles.price}>Цена: {sale? Math.ceil(salePrice / 5) * 5:item['Цена'] } ₽</p>
              
            </div>
          )})}
        </div>
      ) : value && (
        <p className={styles.noResults}>Ничего не найдено</p>
      )}
    </div>
  );
};