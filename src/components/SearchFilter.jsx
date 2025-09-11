// обновлённый компонент с buyer исправленным в createReserve
import { useEffect, useState, useMemo, useCallback } from "react";
import styles from './SearchFilter.module.css';
import { useAuth } from "../context/AuthContext";
import { getFilterReserves } from "../fireBase/fireBase-reserves";
import { DISCOUNT_CONFIG, SEARCH_CONFIG } from "../constants";

export const SearchFilter = ({ jsonData = [], sale, setUpload, upload }) => {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [getSale, setGetSale] = useState(false);
  const [saleForPrice, setSaleForPrice] = useState(DISCOUNT_CONFIG?.DEFAULT_PERCENT || 10);
  const [expandedItems, setExpandedItems] = useState([]);
  const [productReserves, setProductReserves] = useState({});
  const [loadingReserves, setLoadingReserves] = useState(false);
  const { currentUser } = useAuth();

  const loadReservesForProducts = useCallback(async (products) => {
    setLoadingReserves(true);
    try {
      // Получаем ID всех фильтров из результатов поиска
      const filterIds = products.map(item => item['Номенклатура']).filter(Boolean);
      
      // Получаем резервы для всех фильтров одним запросом
      const filterReserves = await getFilterReserves(filterIds);
      
      // Преобразуем в формат, совместимый со старой логикой
      const map = {};
      products.forEach(item => {
        const filterId = item['Номенклатура'];
        map[filterId] = filterReserves[filterId] || 0;
      });
      
      setProductReserves(map);
    } catch (err) {
      console.error("Ошибка загрузки резервов:", err);
    } finally {
      setLoadingReserves(false);
    }
  }, []);

  // Мемоизированные результаты поиска
  const filteredResults = useMemo(() => {
    if (!Array.isArray(jsonData)) return [];
    if (!value || !value.trim()) return [];
    if (value === (SEARCH_CONFIG?.ADMIN_CODE || 'admin123')) return [];

    const searchTerm = value.toLowerCase().trim();
    return jsonData.filter(item =>
      item['Номенклатура']?.toLowerCase().includes(searchTerm) ||
      item['Аналог']?.toLowerCase().includes(searchTerm)
    );
  }, [value, jsonData]);

  useEffect(() => {
    if (value === (SEARCH_CONFIG?.ADMIN_CODE || 'admin123')) {
      setUpload(!upload);
      return;
    }
    
    setResults(filteredResults);
    if (filteredResults.length > 0) {
      loadReservesForProducts(filteredResults);
    }
  }, [filteredResults, value, upload, loadReservesForProducts]);


  const highlightMatches = useCallback((text, searchTerm) => {
    if (!text || !searchTerm) return text;
    return text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ background: 'yellow', color: 'black' }}>{part}</span>
        : part
    );
  }, []);

  const calculatePrice = useCallback((base, active, percent) => {
    const saleMultiplier = DISCOUNT_CONFIG?.SALE_MULTIPLIER || 1.3;
    const roundTo = DISCOUNT_CONFIG?.ROUND_TO || 5;
    
    if (sale) return Math.ceil(base * saleMultiplier / roundTo) * roundTo;
    if (active) return Math.ceil(base * (1 - percent / 100) / roundTo) * roundTo;
    return base;
  }, [sale]);

  const toggleAnalog = useCallback((index) => {
    setExpandedItems(prev => prev.includes(index)
      ? prev.filter(i => i !== index)
      : [...prev, index]);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <input 
          type="text"
          value={value}
          placeholder="Введите номер фильтра или название"
          onChange={(e) => setValue(e.target.value)}
          className={styles.input}
        />
        {!sale && (
          <div className={styles.saleControls}>
            <select className={styles.saleSelect} value={saleForPrice} onChange={(e) => setSaleForPrice(Number(e.target.value))}>
              {(DISCOUNT_CONFIG?.OPTIONS || [5, 10, 15, 20]).map(option => (
                <option key={option} value={option}>{option}%</option>
              ))}
            </select>
            <label className={styles.saleLabel}>
              <input type="checkbox" checked={getSale} onChange={() => setGetSale(!getSale)} />
              Применить скидку
            </label>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((item, index) => {
            const name = item['Номенклатура'];
            const searchTerm = value.toLowerCase().trim();
            const analogText = String(item['Аналог'] || '');
            const reserved = productReserves[name] || 0;
            const available = item['Остаток'] - reserved;
            const price = calculatePrice(item['Цена'], getSale, saleForPrice);

            return (
              <div key={`${name}-${index}`} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productName}>{highlightMatches(name, searchTerm)}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.price}>{price} ₽</span>
                    <span className={available > 0 ? styles.stock : styles.stockEmpty}>{available} шт. доступно</span>
                    {reserved > 0 && (
                     <>
                      <span className={styles.reserved}>В резерве: {reserved} шт.</span>
                     </>
                    )}
                  </div>
                </div>

                {analogText && (
                  <div className={styles.analogSection}>
                    <p className={styles.analogTitle}>Аналоги:</p>
                    <div className={styles.analogContent}>
                      {expandedItems.includes(index)
                        ? highlightMatches(analogText, searchTerm)
                        : highlightMatches(analogText.slice(0, 100), searchTerm)}
                      {analogText.length > 100 && (
                        <button className={styles.analogToggle} onClick={() => toggleAnalog(index)}>
                          {expandedItems.includes(index) ? 'Скрыть' : 'Показать все...'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
