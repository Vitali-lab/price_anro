// Компонент GuestFilters — поиск фильтров без авторизации
import { useState, useEffect } from "react";
import styles from "./GuestFilters.module.css";
import { fetchStockData } from "../fireBase/firebaseLoad";
import { useNavigate } from "react-router-dom";

export const GuestFilters = () => {
  const [jsonData, setJsonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStockData();
      setJsonData(data);
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

  return (
    <div className={styles.guestContainer}>
      <button onClick={()=>{navigate('/login')}}>Вход</button>
      <h2 className={styles.title}>Поиск фильтров</h2>
      <input
        type="text"
        placeholder="Введите артикул или аналог"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.results}>
        {filteredData.map((item, index) => (
          <div key={index} className={styles.card}>
            <h3 className={styles.name}>{item["Номенклатура"]}</h3>
            {/* <p><strong>Аналоги:</strong> {item["Аналог"] || "-"}</p> */}
            <p><strong>Остаток:</strong> {item["Остаток"]}</p>
            <p><strong>Цена:</strong> {item["Цена"]} ₽</p>
          </div>
        ))}
        {filteredData.length === 0 && searchTerm && (
          <p className={styles.noResults}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
};
