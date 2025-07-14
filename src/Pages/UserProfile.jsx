import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./Profile.module.css";

export const UserProfile = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    password: currentUser?.password || "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setStatus("");
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", currentUser.email);
      await updateDoc(userRef, formData);
      localStorage.setItem("authData", JSON.stringify({ ...currentUser, ...formData }));
      setStatus("success");
      location.reload();
    } catch (err) {
      console.error("Ошибка обновления профиля:", err);
      setStatus("error");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Личный кабинет</h2>
      <div className={styles.card}>
        <img src={formData.avatar || "/default-avatar.png"} className={styles.avatar} alt="avatar" />

        <label>Ссылка на аватар:</label>
        <input name="avatar" value={formData.avatar} onChange={handleChange} />

        <label>Имя:</label>
        <input name="name" value={formData.name} onChange={handleChange} />

        <label>Email:</label>
        <input name="email" value={formData.email} disabled />

        <label>Пароль:</label>
        <input name="password" value={formData.password} onChange={handleChange} type="password" />

        <button onClick={handleSave} className={styles.saveBtn}>Сохранить изменения</button>

        {status === "success" && <p className={styles.success}>✅ Данные сохранены</p>}
        {status === "error" && <p className={styles.error}>❌ Ошибка при сохранении</p>}
      </div>
    </div>
  );
};
