import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserReserves, updateReserve, deleteReserve, getAllReserves } from "../fireBase/fireBase-reserves";
import { useAuth } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { CreateReserveModal } from "../components/CreateReserveModal";
import { EditReserveModal } from "../components/EditReserveModal";
import { useToast } from "../hooks/useToast";
import styles from "./Reserves.module.css";
import { clearExpiredReserves } from '../fireBase/fireBase-reserves' 
import { deleteExpiredReserves } from '../fireBase/fireBase-reserves'
import { RESERVE_CONFIG } from "../constants";

export const Reserve = () => {
  const [reserves, setReserves] = useState([]);
  const [allReserves, setAllReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReserve, setEditingReserve] = useState(null);
  const [activeTab, setActiveTab] = useState('my'); // 'my' или 'all'
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();



    useEffect(()=>{
    clearExpiredReserves();
  },[])

  useEffect(() => {
    if (!currentUser) return;
    
    const run = async () => {
      await deleteExpiredReserves();
      await loadReserves();        
    };
    run();
  }, [currentUser]);

  const loadReserves = async () => {
    setLoading(true);
    try {
      const userReserves = await getUserReserves(currentUser.id || currentUser.email);
      setReserves(userReserves);
      
      const allReservesData = await getAllReserves();
      setAllReserves(allReservesData);
    } catch (error) {
      console.error('Ошибка загрузки резервов:', error);
      showError('Ошибка загрузки резервов');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveCreated = () => {
    loadReserves();
    showSuccess('Резерв успешно создан');
  };

  const handleEditReserve = (reserve) => {
    setEditingReserve(reserve);
    setShowEditModal(true);
  };

  const handleReserveUpdated = () => {
    loadReserves();
    showSuccess('Резерв успешно обновлен');
  };

  const handleExtend = async (reserveId, days) => {
    try {
      const reserve = reserves.find(r => r.id === reserveId);
      const newDate = new Date(reserve.expiresAt.toDate());
      newDate.setDate(newDate.getDate() + days);

      await updateReserve(reserveId, { expiresAt: Timestamp.fromDate(newDate) });
      loadReserves();
      showSuccess('Резерв продлен');
    } catch (error) {
      console.error('Ошибка продления резерва:', error);
      showError('Ошибка продления резерва');
    }
  };

  const handleCancel = async (reserveId) => {
    try {
      await updateReserve(reserveId, { status: 'cancelled' });
      loadReserves();
      showSuccess('Резерв отменен');
    } catch (error) {
      console.error('Ошибка отмены резерва:', error);
      showError('Ошибка отмены резерва');
    }
  };

  const handleDelete = async (reserveId) => {
    if (window.confirm("Вы уверены, что хотите удалить резерв?")) {
      try {
        await deleteReserve(reserveId);
        loadReserves();
        showSuccess('Резерв удален');
      } catch (error) {
        console.error('Ошибка удаления резерва:', error);
        showError('Ошибка удаления резерва');
      }
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Дата не указана';
    
    try {
      let date;
      
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        date = dateValue.toDate();
      } else if (dateValue) {
        date = new Date(dateValue);
      } else {
        return 'Дата не указана';
      }
      
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
      
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Ошибка даты';
    }
  };

  const getCurrentReserves = () => {
    return activeTab === 'my' ? reserves : allReserves;
  };

  const filteredReserves = getCurrentReserves().filter(res =>
    res.contragentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.filters?.some(filter => 
      filter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filter.article?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка резервов...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Требуется авторизация</div>
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
        <h1 className={styles.title}>Резервы</h1>
        <p className={styles.subtitle}>Управление резервами фильтров</p>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className={styles.controls}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по контрагентам и фильтрам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.searchIcon}>🔍</div>
        </div>

        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          + Создать резерв
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        className={styles.tabs}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <button
          className={`${styles.tab} ${activeTab === 'my' ? styles.active : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Мои резервы ({reserves.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Все резервы ({allReserves.length})
        </button>
      </motion.div>

      {/* Reserves List */}
      <motion.div 
        className={styles.reservesList}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {filteredReserves.length === 0 ? (
          <div className={styles.empty}>
            <p>
              {activeTab === 'my' 
                ? 'У вас нет активных резервов' 
                : 'Нет резервов для отображения'
              }
            </p>
            {activeTab === 'my' && (
              <button
                className={styles.createFirstButton}
                onClick={() => setShowCreateModal(true)}
              >
                Создать первый резерв
              </button>
            )}
          </div>
        ) : (
          filteredReserves.map((reserve, index) => (
            <motion.div 
              key={reserve.id} 
              className={styles.reserveCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.reserveHeader}>
                <div className={styles.reserveInfo}>
                  <h3>{reserve.contragentName}</h3>
                  <span className={styles.createdBy}>
                    Создал: {reserve.createdByName}
                  </span>
                </div>
                <div className={styles.reserveStatus}>
                  <span className={`${styles.status} ${styles[reserve.status]}`}>
                    {reserve.status === 'active' ? 'Активен' : 
                     reserve.status === 'cancelled' ? 'Отменен' : 'Неизвестно'}
                  </span>
                </div>
              </div>

              <div className={styles.filtersList}>
                <h4>Фильтры:</h4>
                {reserve.filters?.map((filter, idx) => (
                  <div key={idx} className={styles.filterItem}>
                    <span className={styles.filterName}>{filter.name}</span>
                    <span className={styles.filterQuantity}>x{filter.quantity}</span>
                  </div>
                ))}
              </div>

              <div className={styles.reserveMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Создан:</span>
                  <span className={styles.metaValue}>{formatDate(reserve.createdAt)}</span>
                </div>
                {reserve.expiresAt && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Истекает:</span>
                    <span className={styles.metaValue}>{formatDate(reserve.expiresAt)}</span>
                  </div>
                )}
              </div>

              {activeTab === 'my' && reserve.status === 'active' && (
                <div className={styles.reserveActions}>
                  <button 
                    className={styles.editButton} 
                    onClick={() => handleEditReserve(reserve)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => handleDelete(reserve.id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Reserve Modal */}
      <CreateReserveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleReserveCreated}
      />

      {/* Edit Reserve Modal */}
      <EditReserveModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingReserve(null);
        }}
        reserve={editingReserve}
        onSuccess={handleReserveUpdated}
      />
    </div>
  );
};
