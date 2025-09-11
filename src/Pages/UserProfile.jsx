import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../context/ToastContext";
import { validateBirthday } from "../utils/birthdayUtils";
import styles from "./Profile.module.css";

export const UserProfile = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    password: currentUser?.password || "",
    birthday: currentUser?.birthday || "",
  });

  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setStatus("");
  };

  const handleSave = async () => {
    try {
      // Валидация даты рождения
      if (formData.birthday) {
        const birthdayValidation = validateBirthday(formData.birthday);
        if (!birthdayValidation.isValid) {
          setErrors({ birthday: birthdayValidation.message });
          showError(birthdayValidation.message);
          return;
        }
      }

      const userRef = doc(db, "users", currentUser.email);
      await updateDoc(userRef, formData);
      localStorage.setItem("authData", JSON.stringify({ ...currentUser, ...formData }));
      setStatus("success");
      setErrors({});
      showSuccess("Профиль успешно обновлен!");
      location.reload();
    } catch (err) {
      console.error("Ошибка обновления профиля:", err);
      setStatus("error");
      showError("Ошибка при обновлении профиля");
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

        <label>Дата рождения (день и месяц):</label>
        <input 
          name="birthday" 
          value={formData.birthday} 
          onChange={handleChange} 
          type="text"
          placeholder="ММ-ДД (например: 03-15)"
          pattern="(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])"
        />
        {errors.birthday && <p className={styles.error}>{errors.birthday}</p>}
        <p className={styles.helpText}>
          Введите только день и месяц в формате ММ-ДД (например: 03-15 для 15 марта)
        </p>

        <button onClick={handleSave} className={styles.saveBtn}>Сохранить изменения</button>

        {status === "success" && <p className={styles.success}>✅ Данные сохранены</p>}
        {status === "error" && <p className={styles.error}>❌ Ошибка при сохранении</p>}
      </div>

    </div>
  );
};
