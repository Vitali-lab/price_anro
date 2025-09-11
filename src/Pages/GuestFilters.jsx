// Компонент GuestFilters — поиск фильтров без авторизации
import { useState, useEffect, useCallback } from "react";
import styles from "./GuestFilters.module.css";
import { fetchStockData } from "../fireBase/firebaseLoad";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { DISCOUNT_CONFIG } from "../constants";

export const GuestFilters = () => {
  const [jsonData, setJsonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const navigate = useNavigate()

  const toggleAnalog = useCallback((itemName) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  }, []);

  const highlightMatches = useCallback((text, searchTerm) => {
    if (!text || !searchTerm) return text;
    return text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ background: 'yellow', color: 'black' }}>{part}</span>
        : part
    );
  }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
      const data = await fetchStockData();
      setJsonData(data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = jsonData.filter(item =>
      item["Номенклатура"]?.toLowerCase().includes(term) ||
      item["Аналог"]?.toLowerCase().includes(term)
    );

    setFilteredData(filtered);
  }, [searchTerm, jsonData]);

  if (isLoading) {
    return (
      <div className={styles.guestContainer}>
        <Loading text="Загрузка каталога фильтров..." />
      </div>
    );
  }

  return (
    <div className={styles.guestContainer}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Каталог фильтров АнроТехГрупп</h1>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            Войти в систему
          </button>
        </div>
        
        <p className={styles.subtitle}>
          Найдите нужный фильтр по артикулу, названию или аналогу
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        className={styles.searchSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
      <input
        type="text"
              placeholder="Введите артикул, название или аналог фильтра..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
            <div className={styles.searchIcon}>🔍</div>
          </div>
          
        </div>
      </motion.div>

      {/* Results */}
      <motion.div 
        className={styles.resultsSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {searchTerm && (
          <div className={styles.resultsInfo}>
            <p>
              Найдено: <strong>{filteredData.length}</strong> позиций
              {searchTerm && ` по запросу "${searchTerm}"`}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!searchTerm ? (
            <motion.div 
              key="no-search"
              className={styles.noSearch}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.noSearchIcon}>🔍</div>
              <h3>Начните поиск</h3>
              <p>Введите артикул, название или аналог фильтра в поле поиска выше</p>
            </motion.div>
          ) : filteredData.length === 0 ? (
            <motion.div 
              key="no-results"
              className={styles.noResults}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.noResultsIcon}>🔍</div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить поисковый запрос или проверьте правильность написания</p>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              className={styles.results}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredData.map((item, index) => {
                const name = item["Номенклатура"];
                const searchTermLower = searchTerm.toLowerCase().trim();
                const analogText = String(item["Аналог"] || '');
                
                return (
                  <motion.div 
                    key={`${name}-${index}`}
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.name}>{highlightMatches(name, searchTermLower)}</h3>
                      <div className={styles.cardMeta}>
                        <span className={styles.price}>{item["Цена"]} ₽</span>
                        <span className={item["Остаток"] > 0 ? styles.stock : styles.stockEmpty}>
                          {item["Остаток"]} шт. доступно
                        </span>
                      </div>
                    </div>
                    
                    {analogText && (
                      <div className={styles.analogSection}>
                        <p className={styles.analogTitle}>Аналоги:</p>
                        <div className={styles.analogContent}>
                          {expandedCards.has(name)
                            ? highlightMatches(analogText, searchTermLower)
                            : highlightMatches(analogText.slice(0, 100), searchTermLower)}
                          {analogText.length > 100 && (
                            <button 
                              className={styles.analogToggle}
                              onClick={() => toggleAnalog(name)}
                            >
                              {expandedCards.has(name) ? 'Скрыть' : 'Показать все...'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  
                    <div className={styles.cardFooter}>
                      <button 
                        className={styles.emailButton}
                        onClick={() => {
                          const subject = `Запрос по фильтру: ${name}`;
                          const body = `Здравствуйте! Интересует фильтр: ${name}, цена: ${item["Цена"]} ₽, остаток: ${item["Остаток"]} шт.`;
                          const emailUrl = `mailto:anrotehgrupp@mail.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          window.open(emailUrl);
                        }}
                        title="Написать на email"
                      >
                        📧
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
