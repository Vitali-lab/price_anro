import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchContragents, addContragent } from "../fireBase/firebaseContragents";
import { createReserve, getFilterReserves } from "../fireBase/fireBase-reserves";
import { fetchStockData } from "../fireBase/firebaseLoad";
import { useToast } from "../hooks/useToast";
import { validateINN, validateKPP, validateOGRN, validateEmail, validatePhone } from "../utils/validation";
import styles from "./CreateReserveModal.module.css";

export const CreateReserveModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 - выбор контрагента, 2 - добавление фильтров
  const [contragents, setContragents] = useState([]);
  const [selectedContragent, setSelectedContragent] = useState(null);
  const [showContragentForm, setShowContragentForm] = useState(false);
  const [contragentFormData, setContragentFormData] = useState({
    name: "",
    inn: "",
    kpp: "",
    ogrn: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
    notes: ""
  });
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [filterReserves, setFilterReserves] = useState({});
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadContragents();
      loadFilters();
    }
  }, [isOpen]);

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
      
      // Преобразуем данные из Firebase в нужный формат
      const formattedFilters = data.map((item, index) => {
        const price = parseFloat(item['Цена оптовая']) || parseFloat(item['Цена']) || 0;
        const stock = parseInt(item['Остаток']) || parseInt(item['Количество']) || 0;
        
        return {
          id: item['Номенклатура'] || `filter_${index}`,
          name: item['Номенклатура'] || 'Неизвестный фильтр',
          article: item['Артикул'] || 'N/A',
          price: price,
          stock: stock,
          // Дополнительные поля из Firebase
          originalData: item
        };
      });
      
      // Фильтруем только те товары, которые есть в наличии
      const availableFilters = formattedFilters.filter(filter => filter.stock > 0);
      
      setFilters(availableFilters);
      
      // Загружаем резервы для всех фильтров
      const filterIds = availableFilters.map(filter => filter.id);
      const reserves = await getFilterReserves(filterIds);
      setFilterReserves(reserves);
      
      console.log(`Загружено ${availableFilters.length} фильтров из ${data.length} товаров`);
      
      // Отладочная информация для первых нескольких товаров
      if (data.length > 0) {
        console.log('Пример данных из Firebase:', data[0]);
        console.log('Поля в данных:', Object.keys(data[0]));
      }
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error);
      showError('Ошибка загрузки фильтров');
    } finally {
      setFiltersLoading(false);
    }
  };

  const handleContragentSelect = (contragent) => {
    setSelectedContragent(contragent);
    setStep(2);
  };

  const handleCreateContragent = async (e) => {
    e.preventDefault();
    
    if (!contragentFormData.name.trim()) {
      showError('Название контрагента обязательно для заполнения');
      return;
    }

    // Валидация полей
    if (contragentFormData.inn && !validateINN(contragentFormData.inn)) {
      showError('Неверный формат ИНН');
      return;
    }

    if (contragentFormData.kpp && !validateKPP(contragentFormData.kpp)) {
      showError('Неверный формат КПП');
      return;
    }

    if (contragentFormData.ogrn && !validateOGRN(contragentFormData.ogrn)) {
      showError('Неверный формат ОГРН');
      return;
    }

    if (contragentFormData.email && !validateEmail(contragentFormData.email)) {
      showError('Неверный формат email');
      return;
    }

    if (contragentFormData.phone && !validatePhone(contragentFormData.phone)) {
      showError('Неверный формат телефона');
      return;
    }

    setIsLoading(true);
    try {
      const contragentId = await addContragent(contragentFormData);
      const newContragent = {
        id: contragentId,
        ...contragentFormData,
        createdAt: new Date()
      };
      
      setContragents(prev => [newContragent, ...prev]);
      setSelectedContragent(newContragent);
      setShowContragentForm(false);
      setStep(2);
      showSuccess('Контрагент успешно создан');
    } catch (error) {
      console.error('Ошибка создания контрагента:', error);
      showError('Ошибка создания контрагента');
    } finally {
      setIsLoading(false);
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

  const handleCreateReserve = async () => {
    if (!selectedContragent) {
      showError('Выберите контрагента');
      return;
    }

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
      // Подготавливаем данные фильтров для сохранения
      const filtersForReserve = selectedFilters.map(filter => ({
        id: filter.id,
        name: filter.name,
        article: filter.article,
        price: filter.price,
        quantity: filter.quantity,
        stock: filter.stock,
        // Сохраняем оригинальные данные для совместимости
        productName: filter.name,
        originalData: filter.originalData
      }));

      const reserveData = {
        contragentId: selectedContragent.id,
        contragentName: selectedContragent.name,
        filters: filtersForReserve,
        createdBy: currentUser.id || currentUser.email,
        createdByName: `${currentUser.name} ${currentUser.surname}`,
        status: 'active',
        createdAt: new Date(),
        expiresAt: expiryDateTime,
        // Добавляем поля для совместимости со старой системой
        buyer: selectedContragent.name,
        userId: currentUser.id || currentUser.email,
        userName: `${currentUser.name} ${currentUser.surname}`
      };

      await createReserve(reserveData);
      showSuccess('Резерв успешно создан');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка создания резерва:', error);
      showError('Ошибка создания резерва');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedContragent(null);
    setShowContragentForm(false);
    setSelectedFilters([]);
    setSearchTerm("");
    setExpiryDate("");
    setContragentFormData({
      name: "",
      inn: "",
      kpp: "",
      ogrn: "",
      address: "",
      phone: "",
      email: "",
      contactPerson: "",
      notes: ""
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const filteredContragents = contragents.filter(contragent =>
    contragent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contragent.inn?.includes(searchTerm) ||
    contragent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFilters = filters.filter(filter =>
    filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.article.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

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
            <h2>
              {step === 1 ? 'Создание резерва' : 'Добавление фильтров'}
            </h2>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div className={styles.modalContent}>
            {step === 1 ? (
              <div className={styles.step1}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Поиск контрагентов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  <div className={styles.searchIcon}>🔍</div>
                </div>

                <div className={styles.contragentsList}>
                  {filteredContragents.map((contragent) => (
                    <div
                      key={contragent.id}
                      className={styles.contragentItem}
                      onClick={() => handleContragentSelect(contragent)}
                    >
                      <div className={styles.contragentInfo}>
                        <h3>{contragent.name}</h3>
                        {contragent.inn && <span>ИНН: {contragent.inn}</span>}
                        {contragent.email && <span>Email: {contragent.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className={styles.createContragentBtn}
                  onClick={() => setShowContragentForm(true)}
                >
                  + Создать нового контрагента
                </button>

                {showContragentForm && (
                  <div className={styles.contragentForm}>
                    <h3>Создание контрагента</h3>
                    <form onSubmit={handleCreateContragent}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Название организации *</label>
                          <input
                            type="text"
                            value={contragentFormData.name}
                            onChange={(e) => setContragentFormData(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>ИНН</label>
                          <input
                            type="text"
                            value={contragentFormData.inn}
                            onChange={(e) => setContragentFormData(prev => ({
                              ...prev,
                              inn: e.target.value
                            }))}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Email</label>
                          <input
                            type="email"
                            value={contragentFormData.email}
                            onChange={(e) => setContragentFormData(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Телефон</label>
                          <input
                            type="tel"
                            value={contragentFormData.phone}
                            onChange={(e) => setContragentFormData(prev => ({
                              ...prev,
                              phone: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                      <div className={styles.formActions}>
                        <button type="submit" disabled={isLoading}>
                          {isLoading ? 'Создание...' : 'Создать'}
                        </button>
                        <button type="button" onClick={() => setShowContragentForm(false)}>
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.step2}>
                <div className={styles.selectedContragent}>
                  <h3>Выбранный контрагент:</h3>
                  <p>{selectedContragent.name}</p>
                  <button onClick={() => setStep(1)}>Изменить</button>
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

                {selectedFilters.length > 0 && (
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
                )}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)}>Назад</button>
                <button 
                  onClick={handleCreateReserve}
                  disabled={isLoading || selectedFilters.length === 0 || !expiryDate}
                  className={styles.createBtn}
                >
                  {isLoading ? 'Создание...' : 'Создать резерв'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
