import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchContragents } from "../fireBase/firebaseContragents";
import { updateReserve, getFilterReserves } from "../fireBase/fireBase-reserves";
import { fetchStockData } from "../fireBase/firebaseLoad";
import { useToast } from "../hooks/useToast";
import styles from "./EditReserveModal.module.css";

export const EditReserveModal = ({ isOpen, onClose, reserve, onSuccess }) => {
  const [contragents, setContragents] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filterReserves, setFilterReserves] = useState({});
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && reserve) {
      loadContragents();
      loadFilters();
      // Инициализируем данные из резерва
      setSelectedFilters(reserve.filters || []);
      if (reserve.expiresAt) {
        const date = reserve.expiresAt.toDate ? reserve.expiresAt.toDate() : new Date(reserve.expiresAt);
        setExpiryDate(date.toISOString().slice(0, 16));
      }
    }
  }, [isOpen, reserve]);

  const loadContragents = async () => {
    try {
      const data = await fetchContragents();
      setContragents(data);
    } catch (error) {
      console.error('Ошибка загрузки контрагентов:', error);
      showError('Ошибка загрузки контрагентов');
    }
  };

  const loadFilters = async () => {
    setFiltersLoading(true);
    try {
      const data = await fetchStockData();
      
      const formattedFilters = data.map((item, index) => {
        const price = parseFloat(item['Цена оптовая']) || parseFloat(item['Цена']) || 0;
        const stock = parseInt(item['Остаток']) || parseInt(item['Количество']) || 0;
        
        return {
          id: item['Номенклатура'] || `filter_${index}`,
          name: item['Номенклатура'] || 'Неизвестный фильтр',
          article: item['Артикул'] || 'N/A',
          price: price,
          stock: stock,
          originalData: item
        };
      });
      
      const availableFilters = formattedFilters.filter(filter => filter.stock > 0);
      setFilters(availableFilters);
      
      // Загружаем резервы для всех фильтров, исключая текущий редактируемый резерв
      const filterIds = availableFilters.map(filter => filter.id);
      const reserves = await getFilterReserves(filterIds, reserve?.id);
      setFilterReserves(reserves);
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error);
      showError('Ошибка загрузки фильтров');
    } finally {
      setFiltersLoading(false);
    }
  };

  const handleFilterToggle = (filter) => {
    setSelectedFilters(prev => {
      const exists = prev.find(f => f.id === filter.id);
      if (exists) {
        return prev.filter(f => f.id !== filter.id);
      } else {
        return [...prev, { ...filter, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (filterId, quantity) => {
    if (quantity < 1) return;
    
    setSelectedFilters(prev => 
      prev.map(filter => 
        filter.id === filterId 
          ? { ...filter, quantity: Math.min(quantity, filter.stock) }
          : filter
      )
    );
  };

  const handleSave = async () => {
    if (selectedFilters.length === 0) {
      showError('Добавьте хотя бы один фильтр');
      return;
    }

    if (!expiryDate) {
      showError('Выберите дату окончания резерва');
      return;
    }

    const expiryDateTime = new Date(expiryDate);
    if (expiryDateTime <= new Date()) {
      showError('Дата окончания должна быть в будущем');
      return;
    }

    setIsLoading(true);
    try {
      const filtersForReserve = selectedFilters.map(filter => ({
        id: filter.id,
        name: filter.name,
        article: filter.article,
        price: filter.price,
        quantity: filter.quantity,
        stock: filter.stock,
        productName: filter.name,
        originalData: filter.originalData
      }));

      const updateData = {
        filters: filtersForReserve,
        expiresAt: expiryDateTime,
        updatedAt: new Date()
      };

      await updateReserve(reserve.id, updateData);
      showSuccess('Резерв успешно обновлен');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка обновления резерва:', error);
      showError('Ошибка обновления резерва');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedFilters([]);
    setSearchTerm("");
    setExpiryDate("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const filteredFilters = filters.filter(filter =>
    filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.article.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !reserve) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className={styles.modalHeader}>
            <h2>Редактирование резерва</h2>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.reserveInfo}>
              <h3>Контрагент: {reserve.contragentName}</h3>
              <p>Создал: {reserve.createdByName}</p>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск фильтров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>🔍</div>
            </div>

            <div className={styles.filtersList}>
              {filtersLoading ? (
                <div className={styles.loadingFilters}>
                  <p>Загрузка фильтров из базы данных...</p>
                </div>
              ) : filteredFilters.length === 0 ? (
                <div className={styles.noFilters}>
                  <p>Фильтры не найдены</p>
                  {searchTerm && (
                    <p>Попробуйте изменить поисковый запрос</p>
                  )}
                </div>
              ) : (
                filteredFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className={`${styles.filterItem} ${
                      selectedFilters.find(f => f.id === filter.id) ? styles.selected : ''
                    }`}
                    onClick={() => handleFilterToggle(filter)}
                  >
                    <div className={styles.filterInfo}>
                      <h4>{filter.name}</h4>
                      <span>В наличии: {filter.stock} шт.</span>
                      {filterReserves[filter.id] > 0 && (
                        <span className={styles.reservedInfo}>
                          В резерве: {filterReserves[filter.id]} шт.
                        </span>
                      )}
                      <span className={styles.availableInfo}>
                        Доступно: {Math.max(0, filter.stock - (filterReserves[filter.id] || 0))} шт.
                      </span>
                    </div>
                    {selectedFilters.find(f => f.id === filter.id) && (
                      <div className={styles.quantityControl}>
                        <input
                          type="number"
                          min="1"
                          max={Math.max(0, filter.stock - (filterReserves[filter.id] || 0))}
                          value={selectedFilters.find(f => f.id === filter.id).quantity}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = parseInt(e.target.value) || 1;
                            const maxAvailable = Math.max(0, filter.stock - (filterReserves[filter.id] || 0));
                            handleQuantityChange(filter.id, Math.min(Math.max(value, 1), maxAvailable));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={styles.quantityInput}
                        />
                        <span className={styles.maxStock}>
                          макс: {Math.max(0, filter.stock - (filterReserves[filter.id] || 0))}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedFilters.length > 0 && (
              <div className={styles.selectedFilters}>
                <h3>Выбранные фильтры:</h3>
                {selectedFilters.map((filter) => (
                  <div key={filter.id} className={styles.selectedFilterItem}>
                    <div className={styles.filterDetails}>
                      <span className={styles.filterName}>{filter.name}</span>
                      <span className={styles.filterQuantity}>x{filter.quantity}</span>
                    </div>
                    <button 
                      className={styles.removeFilterBtn}
                      onClick={() => handleFilterToggle(filter)}
                      title="Удалить фильтр"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.expiryDateSection}>
              <h3>Дата окончания резерва:</h3>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={styles.dateInput}
              />
              <p className={styles.dateHelp}>
                Резерв будет автоматически удален после указанной даты
              </p>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button onClick={handleClose}>Отмена</button>
            <button 
              onClick={handleSave}
              disabled={isLoading || selectedFilters.length === 0 || !expiryDate}
              className={styles.saveBtn}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
