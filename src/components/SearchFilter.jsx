import { useEffect, useState } from "react";
import styles from './SearchFilter.module.css';

export const SearchFilter = ({ jsonData = [],sale,setUpload,upload }) => { 
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [getSale , setGetSale] = useState(false)
  const [saleForPrice , setSaleForPrice] = useState(10)
  const [expandedItems, setExpandedItems] = useState([]);

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
  
      const nameMatch = item['Номенклатура']?.toLowerCase().includes(searchTerm)||item['Аналог']?.toLowerCase().includes(searchTerm)
      
      // Можно добавить поиск по другим полям при необходимости
      // const stockMatch = item['Остаток']?.toString().includes(searchTerm);
      // const priceMatch = item['Цена']?.toString().includes(searchTerm);
      
      return nameMatch; // || stockMatch || priceMatch;
    });
  
    setResults(filteredResults);
  }, [value, jsonData]);

  const price = (salePrice,getSale10 ,item) => {
    if (sale) {
      return Math.ceil(salePrice / 5) * 5
    } else if (getSale){
      return Math.ceil(getSale10 / 5) * 5
    } else {
      return item['Цена']
    }
  }

  const toggleAnalog = (index) => {
  if (expandedItems.includes(index)) {
    setExpandedItems(prev => prev.filter(i => i !== index));
  } else {
    setExpandedItems(prev => [...prev, index]);
  }
};


  return (
    <div className={styles.container}>
      
      <input 
        type="text" 
        value={value} 
        placeholder="Введите номер фильтра" 
        onChange={onChange}
        className={styles.input}
        onKeyDown={(e)=>{
          if(e.key === 'Home') {
               setUpload(!upload)
          }
        }}
      />
    
      {!sale && <div className={styles.sale10}>
              <p>Скидка</p>
              <select className={styles.selectSale} onChange={(e)=>{setSaleForPrice(Number(e.target.value))
              }}>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="20">20% (минус НДС)</option>
              </select>
              <input className={styles.checkBoxSale} type="checkbox" name="sale" onChange={()=>{setGetSale(!getSale)}} />
          </div>}
      {results.length > 0 ? (
        <div className={styles.results}>
          
          {results.map((item, index) => {
            const analogText = String(item['Аналог'] || '');
            const salePrice = item['Цена'] * 1.3
            const getSale10 = item['Цена'] - (item['Цена'] * saleForPrice / 100)
            return(
            <div key={`${item['Номенклатура']}-${index}`} className={styles.filterItem}>
              <p className={styles.name}>{item['Номенклатура']}</p>
              <p className={styles.analogs}>Аналоги: {expandedItems.includes(index)? analogText: analogText?.slice(0, 100)}
                {analogText.length > 100 && (<button onClick={() => toggleAnalog(index)} className={styles.fullAnalogsButton}>{!expandedItems.includes(index) ? 'Показать все аналоги...' : 'Скрыть аналоги'}</button>)}</p>
              <p className={styles.stock}>Остаток: {item['Остаток']}</p>
              <p className={styles.price}>Цена: {price(salePrice,getSale10,item)} ₽</p>  
            </div>
          )})}
        </div>
      ) : value && (
        <p className={styles.noResults}>Ничего не найдено</p>
      )}
    </div>
  );
};