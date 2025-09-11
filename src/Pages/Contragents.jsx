import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Contragents.module.css";
import { Loading } from "../components/Loading";
import { 
  fetchContragents, 
  addContragent, 
  updateContragent, 
  deleteContragent,
  searchContragents 
} from "../fireBase/firebaseContragents";
import { useToast } from "../context/ToastContext";
import { validateINN, validateKPP, validateOGRN, validateEmail, validatePhone } from "../utils/validation";

export const Contragents = () => {
  const [contragents, setContragents] = useState([]);
  const [filteredContragents, setFilteredContragents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedContragent, setSelectedContragent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
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

  // Загрузка контрагентов из Firebase
  useEffect(() => {
    const loadContragents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchContragents();
        setContragents(data);
        setFilteredContragents(data);
      } catch (error) {
        console.error('Ошибка загрузки контрагентов:', error);
        showError('Ошибка загрузки контрагентов');
      } finally {
        setIsLoading(false);
      }
    };

    loadContragents();
  }, [showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Название контрагента обязательно для заполнения');
      return;
    }

    // Валидация полей
    if (formData.inn && !validateINN(formData.inn)) {
      showError('Неверный формат ИНН');
      return;
    }

    if (formData.kpp && !validateKPP(formData.kpp)) {
      showError('Неверный формат КПП');
      return;
    }

    if (formData.ogrn && !validateOGRN(formData.ogrn)) {
      showError('Неверный формат ОГРН');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      showError('Неверный формат email');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      showError('Неверный формат телефона');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // Редактирование существующего контрагента
        await updateContragent(editingId, formData);
        showSuccess('Контрагент успешно обновлен');
        
        // Обновляем локальное состояние
        const updatedContragents = contragents.map(item => 
          item.id === editingId 
            ? { ...item, ...formData }
            : item
        );
        setContragents(updatedContragents);
        setFilteredContragents(updatedContragents);
      } else {
        // Создание нового контрагента
        const contragentId = await addContragent(formData);
        showSuccess('Контрагент успешно добавлен');
        
        // Добавляем в локальное состояние
        const newContragent = {
          id: contragentId,
          ...formData,
          createdAt: new Date()
        };
        const updatedContragents = [newContragent, ...contragents];
        setContragents(updatedContragents);
        setFilteredContragents(updatedContragents);
      }
      
      resetForm();
    } catch (error) {
      console.error('Ошибка сохранения контрагента:', error);
      showError('Ошибка сохранения данных');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (contragent) => {
    setFormData(contragent);
    setEditingId(contragent.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этого контрагента?')) {
      setIsLoading(true);
      try {
        await deleteContragent(id);
        showSuccess('Контрагент успешно удален');
        
        // Обновляем локальное состояние
        const updatedContragents = contragents.filter(item => item.id !== id);
        setContragents(updatedContragents);
        setFilteredContragents(updatedContragents);
        
        if (selectedContragent && selectedContragent.id === id) {
          setSelectedContragent(null);
        }
      } catch (error) {
        console.error('Ошибка удаления контрагента:', error);
        showError('Ошибка удаления контрагента');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCardClick = (contragent) => {
    setSelectedContragent(contragent);
  };

  const closeCard = () => {
    setSelectedContragent(null);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredContragents(contragents);
      return;
    }
    
    try {
      const results = await searchContragents(term);
      setFilteredContragents(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      showError('Ошибка поиска');
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Дата не указана';
    
    // Отладочная информация
    console.log('Formatting date:', dateValue, 'Type:', typeof dateValue);
    
    try {
      let date;
      
      // Если это Firebase Timestamp
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        console.log('Firebase Timestamp detected');
        date = dateValue.toDate();
      }
      // Если это строка или число
      else if (dateValue) {
        console.log('String/Number date detected');
        date = new Date(dateValue);
      }
      else {
        return 'Дата не указана';
      }
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', date);
        return 'Неверная дата';
      }
      
      const formatted = date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateValue);
      return 'Ошибка даты';
    }
  };

  if (isLoading && contragents.length === 0) {
    return (
      <div className={styles.container}>
        <Loading text="Загрузка контрагентов..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={styles.title}>Контрагенты</h1>
        <p className={styles.subtitle}>Управление контрагентами и их данными</p>
      </motion.div>

      {/* Search and Add Section */}
      <motion.div 
        className={styles.topSection}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск контрагентов..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.searchIcon}>🔍</div>
           <button 
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          + 
        </button>
        </div>
        
       
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div 
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.modalHeader}>
                <h2>{editingId ? 'Редактировать контрагента' : 'Добавить контрагента'}</h2>
                <button 
                  className={styles.closeButton}
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Название организации *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="ООО 'Название компании'"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="inn">ИНН</label>
                    <input
                      type="text"
                      id="inn"
                      name="inn"
                      value={formData.inn}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      maxLength="12"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="kpp">КПП</label>
                    <input
                      type="text"
                      id="kpp"
                      name="kpp"
                      value={formData.kpp}
                      onChange={handleInputChange}
                      placeholder="123456789"
                      maxLength="9"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ogrn">ОГРН</label>
                    <input
                      type="text"
                      id="ogrn"
                      name="ogrn"
                      value={formData.ogrn}
                      onChange={handleInputChange}
                      placeholder="1234567890123"
                      maxLength="15"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="г. Москва, ул. Примерная, д. 1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (495) 123-45-67"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@company.ru"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contactPerson">Контактное лицо</label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label htmlFor="notes">Примечания</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Дополнительная информация о контрагенте"
                      rows="3"
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={resetForm}
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Сохранение...' : (editingId ? 'Сохранить' : 'Добавить')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contragents List */}
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {filteredContragents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h3>
              {searchTerm ? 'Контрагенты не найдены' : 'Контрагенты не найдены'}
            </h3>
            <p>
              {searchTerm 
                ? `По запросу "${searchTerm}" ничего не найдено`
                : 'Добавьте первого контрагента, нажав кнопку "Добавить контрагента"'
              }
            </p>
          </div>
        ) : (
          <motion.div 
            className={styles.contragentsList}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredContragents.map((contragent, index) => (
              <motion.div 
                key={contragent.id}
                className={styles.contragentItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCardClick(contragent)}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemMain}>
                    <h3 className={styles.contragentName}>{contragent.name}</h3>
                    {contragent.inn && (
                      <span className={styles.itemInn}>ИНН: {contragent.inn}</span>
                    )}
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.createdAt}>
                      {formatDate(contragent.createdAt)}
                    </span>
                    <span className={styles.clickHint}>Нажмите для просмотра</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button 
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(contragent);
                    }}
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contragent.id);
                    }}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Contragent Detail Modal */}
      <AnimatePresence>
        {selectedContragent && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCard}
          >
            <motion.div 
              className={styles.detailModal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{selectedContragent.name}</h2>
                <button 
                  className={styles.closeButton}
                  onClick={closeCard}
                >
                  ×
                </button>
              </div>

              <div className={styles.detailContent}>
                <div className={styles.detailGrid}>
                  {selectedContragent.inn && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>ИНН:</span>
                      <span className={styles.detailValue}>{selectedContragent.inn}</span>
                    </div>
                  )}
                  
                  {selectedContragent.kpp && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>КПП:</span>
                      <span className={styles.detailValue}>{selectedContragent.kpp}</span>
                    </div>
                  )}
                  
                  {selectedContragent.ogrn && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>ОГРН:</span>
                      <span className={styles.detailValue}>{selectedContragent.ogrn}</span>
                    </div>
                  )}
                  
                  {selectedContragent.phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Телефон:</span>
                      <span className={styles.detailValue}>{selectedContragent.phone}</span>
                    </div>
                  )}
                  
                  {selectedContragent.email && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span className={styles.detailValue}>{selectedContragent.email}</span>
                    </div>
                  )}
                  
                  {selectedContragent.contactPerson && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Контактное лицо:</span>
                      <span className={styles.detailValue}>{selectedContragent.contactPerson}</span>
                    </div>
                  )}
                </div>

                {selectedContragent.address && (
                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Адрес:</span>
                    <span className={styles.detailValue}>{selectedContragent.address}</span>
                  </div>
                )}

                {selectedContragent.notes && (
                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Примечания:</span>
                    <span className={styles.detailValue}>{selectedContragent.notes}</span>
                  </div>
                )}

                <div className={styles.detailFooter}>
                  <span className={styles.detailCreatedAt}>
                    Создано: {formatDate(selectedContragent.createdAt)}
                  </span>
                </div>
              </div>

              <div className={styles.detailActions}>
                <button 
                  className={styles.editButton}
                  onClick={() => {
                    handleEdit(selectedContragent);
                    closeCard();
                  }}
                >
                  ✏️ Редактировать
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => {
                    handleDelete(selectedContragent.id);
                    closeCard();
                  }}
                >
                  🗑️ Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
