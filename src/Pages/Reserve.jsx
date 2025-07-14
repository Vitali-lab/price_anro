import { useEffect, useState } from "react";
import { getUserReserves, updateReserve, deleteReserve, getAllReserves } from "../fireBase/fireBase-reserves";
import { useAuth } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import styles from "./Reserves.module.css";
import { clearExpiredReserves } from '../fireBase/fireBase-reserves' 
import { deleteExpiredReserves } from '../fireBase/fireBase-reserves'

export const Reserve = () => {
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherReserves, setOtherReserves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();



    useEffect(()=>{
    clearExpiredReserves();
  },[])

  useEffect(() => {
    if (!currentUser) return;
    
  const run = async () => {
    await deleteExpiredReserves()
    await loadReserves()        
  }
    run()
    loadReserves();
  }, [currentUser]);




  const loadReserves = async () => {
    setLoading(true);
    const userReserves = await getUserReserves(currentUser.id || currentUser.email);
    setReserves(userReserves);
    const allReserves = await getAllReserves();
    const others = allReserves.filter(r => r.userId !== (currentUser.id || currentUser.email));
    setOtherReserves(others);
    setLoading(false);
  };

  const handleExtend = async (reserveId, days) => {
    const reserve = reserves.find(r => r.id === reserveId);
    const newDate = new Date(reserve.expiresAt.toDate());
    newDate.setDate(newDate.getDate() + days);

    await updateReserve(reserveId, { expiresAt: Timestamp.fromDate(newDate) });
    loadReserves();
  };

  const handleCancel = async (reserveId) => {
    await updateReserve(reserveId, { status: 'cancelled' });
    loadReserves();
  };

  const handleDelete = async (reserveId) => {
    if (window.confirm("Вы уверены, что хотите удалить резерв?")) {
      await deleteReserve(reserveId);
      loadReserves();
    }
  };

  const filteredReserves = reserves.filter(res =>
    res.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOthers = otherReserves.filter(res =>
    res.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className={styles.loader}></div>;
  if (!currentUser) return <div className={styles.loading}>Требуется авторизация</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Резервы</h2>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Поиск по резервам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h3 className={styles.subTitle}>Мои резервы</h3>
      {filteredReserves.length === 0 ? (
        <p className={styles.empty}>У вас нет активных резервов</p>
      ) : (
        filteredReserves.map(res => (
          <div key={res.id} className={styles.card}>
            <div><strong>Товар:</strong> {res.productName}</div>
            <div><strong>Кол-во:</strong> {res.quantity}</div>
            <div><strong>Покупатель:</strong> {res.buyer}</div>
            <div><strong>Создан:</strong> {res.createdAt.toDate().toLocaleDateString()}</div>
            <div><strong>Истекает:</strong> {res.expiresAt.toDate().toLocaleDateString()}</div>
            <div className={styles.actions}>
              <button className={styles.extend} onClick={() => handleExtend(res.id, 2)}>+2 дня</button>
              <button className={styles.extend} onClick={() => handleExtend(res.id, 5)}>+5 дней</button>
              <button className={styles.cancel} onClick={() => {
                handleDelete(res.id);
                handleCancel(res.id);
              }}>Отменить</button>
            </div>
          </div>
        ))
      )}

      <h3 className={styles.subTitle}>Резервы других пользователей</h3>
      {filteredOthers.length === 0 ? (
        <p className={styles.empty}>Резервов нет</p>
      ) : (
        filteredOthers.map(res => (
          <div key={res.id} className={styles.card}>
            <div><strong>Товар:</strong> {res.productName}</div>
            <div><strong>Кол-во:</strong> {res.quantity}</div>
            <div><strong>Покупатель:</strong> {res.buyer}</div>
            <div><strong>Создан:</strong> {res.createdAt.toDate().toLocaleDateString()}</div>
            <div><strong>Истекает:</strong> {res.expiresAt.toDate().toLocaleDateString()}</div>
            <div><strong>Пользователь:</strong> {res.userName}</div>
          </div>
        ))
      )}
    </div>
  );
};
