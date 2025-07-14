// обновлённый компонент с buyer исправленным в createReserve
import { useEffect, useState } from "react";
import styles from './SearchFilter.module.css';
import { useAuth } from "../context/AuthContext";
import { createReserve, getProductReserves } from "../fireBase/fireBase-reserves";

export const SearchFilter = ({ jsonData = [], sale, setUpload, upload }) => {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [getSale, setGetSale] = useState(false);
  const [saleForPrice, setSaleForPrice] = useState(10);
  const [expandedItems, setExpandedItems] = useState([]);
  const [reserveData, setReserveData] = useState({});
  const [productReserves, setProductReserves] = useState({});
  const [loadingReserves, setLoadingReserves] = useState(false);
  const [openReserve , setOpenReserve] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!Array.isArray(jsonData)) return;
    if (!value.trim()) return setResults([]);
    if (value === 'admin123') return setUpload(!upload);

    const searchTerm = value.toLowerCase().trim();
    const filtered = jsonData.filter(item =>
      item['Номенклатура']?.toLowerCase().includes(searchTerm) ||
      item['Аналог']?.toLowerCase().includes(searchTerm)
    );

    setResults(filtered);
    if (filtered.length > 0) loadReservesForProducts(filtered);
  }, [value, jsonData]);

  const loadReservesForProducts = async (products) => {
    setLoadingReserves(true);
    const map = {};
    try {
      for (const item of products) {
        const res = await getProductReserves(item['Номенклатура']);
        map[item['Номенклатура']] = res.reduce((sum, r) => sum + r.quantity, 0);
      }
      setProductReserves(map);
    } catch (err) {
      console.error("Ошибка загрузки резервов:", err);
    } finally {
      setLoadingReserves(false);
    }
  };

  const handleReserve = async (product) => {
    if (!currentUser) return alert("Войдите в систему");
    const name = product['Номенклатура'];
    const current = reserveData[name] || {};
    const available = product['Остаток'] - (productReserves[name] || 0);
    if ((current.quantity || 1) > available) return alert(`Доступно: ${available}`);

    try {
     await createReserve(
  currentUser,
  product,
  current.quantity || 1,
  current.buyer || "",      
  current.days || 3         
);
      alert(`${currentUser.name}, резерв создан на ${current.quantity || 1} шт. на ${current.days || 3} дней`);
      const updated = await getProductReserves(name);
      setProductReserves(prev => ({
        ...prev,
        [name]: updated.reduce((sum, r) => sum + r.quantity, 0)
      }));
    } catch (err) {
      console.error("Ошибка резерва:", err);
      alert("Ошибка при создании резерва");
    }
  };

  const updateReserveField = (name, field, value) => {
    setReserveData(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value
      }
    }));
  };

  const highlightMatches = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    return text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ background: 'yellow', color: 'black' }}>{part}</span>
        : part
    );
  };

  const calculatePrice = (base, active, percent) => {
    if (sale) return Math.ceil(base * 1.3 / 5) * 5;
    if (active) return Math.ceil(base * (1 - percent / 100) / 5) * 5;
    return base;
  };

  const toggleAnalog = index => {
    setExpandedItems(prev => prev.includes(index)
      ? prev.filter(i => i !== index)
      : [...prev, index]);
  };

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
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
            </select>
            <label className={styles.saleLabel}>
              <input type="checkbox" checked={getSale} onChange={() => setGetSale(!getSale)} />
              Применить скидку
            </label>
          </div>
        )}
      </div>
      <button className={styles.openReserve} onClick={() => setOpenReserve(prev => !prev)}>
        {openReserve ? 'Закрыть резервы' : 'Открыть резервы'}
      </button>

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((item, index) => {
            const name = item['Номенклатура'];
            const searchTerm = value.toLowerCase().trim();
            const analogText = String(item['Аналог'] || '');
            const reserved = productReserves[name] || 0;
            const available = item['Остаток'] - reserved;
            const price = calculatePrice(item['Цена'], getSale, saleForPrice);
            const current = reserveData[name] || { quantity: 1, days: 3, buyer: "" };

            return (
              <div key={`${name}-${index}`} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productName}>{highlightMatches(name, searchTerm)}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.price}>{price} ₽</span>
                    <span className={available > 0 ? styles.stock : styles.stockEmpty}>{available} шт. доступно</span>
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

                {currentUser && available > 0 && openReserve && (
                  <div className={styles.reserveSection}>
                    <div className={styles.reserveControls}>
                      <div className={styles.reserveInputGroup}>
                        <label>Количество:</label>
                        <input type="number" min="1" max={available} value={current.quantity || 1} onChange={(e) => updateReserveField(name, 'quantity', parseInt(e.target.value) || 1)} />
                      </div>
                      <div className={styles.reserveInputGroup}>
                        <label>На срок:</label>
                        <select value={current.days || 3} onChange={(e) => updateReserveField(name, 'days', parseInt(e.target.value))}>
                          <option value="3">3 дня</option>
                          <option value="5">5 дней</option>
                          <option value="7">7 дней</option>
                        </select>
                      </div>
                      <div className={styles.reserveInputGroup}>
                        <label>На кого:</label>
                        <input type="text" value={current.buyer || ""} onChange={(e) => updateReserveField(name, 'buyer', e.target.value)} />
                      </div>
                      <button className={styles.reserveButton} onClick={() => handleReserve(item)}>Зарезервировать</button>
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
