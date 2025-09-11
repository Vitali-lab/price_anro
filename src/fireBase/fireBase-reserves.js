import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Создать резерв (новая версия с поддержкой контрагентов и фильтров)
export const createReserve = async (reserveData) => {
  try {
    const expiresAt = Timestamp.fromDate(reserveData.expiresAt);
    const createdAt = Timestamp.fromDate(reserveData.createdAt);

    await addDoc(collection(db, "reserves"), {
      ...reserveData,
      createdAt,
      expiresAt,
    });
  } catch (error) {
    console.error("Ошибка при создании резерва:", error);
    throw error;
  }
};

// Создать резерв (старая версия для совместимости)
export const createReserveLegacy = async (
  user,
  product,
  quantity,
  buyer = "",
  daysToExpire = 3
) => {
  try {
    const now = new Date();
    const expiresDate = new Date(
      now.getTime() + daysToExpire * 24 * 60 * 60 * 1000
    );
    const expiresAt = Timestamp.fromDate(expiresDate);

    const userName =
      (user.name || "") + (user.surname ? ` ${user.surname}` : "");

    await addDoc(collection(db, "reserves"), {
      userId: user.id || user.email,
      userEmail: user.email,
      userName,
      userAvatar: user.avatar || "",
      productId: product.id || product["Номенклатура"],
      productName: product.name || product["Номенклатура"],
      quantity,
      createdAt: Timestamp.now(),
      expiresAt,
      status: "active",
      buyer: buyer || "",
    });
  } catch (error) {
    console.error("Ошибка при создании резерва:", error);
    throw error;
  }
};

// Получить резервы пользователя
export const getUserReserves = async (userId) => {
  const q = query(
    collection(db, "reserves"),
    where("createdBy", "==", userId),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Обновить резерв
export const updateReserve = async (reserveId, updates) => {
  await updateDoc(doc(db, "reserves", reserveId), updates);
};

// Удалить резерв
export const deleteReserve = async (reserveId) => {
  await deleteDoc(doc(db, "reserves", reserveId));
};

// Получить все активные резервы для товара (старая версия)
export const getProductReserves = async (productId) => {
  const q = query(
    collection(db, "reserves"),
    where("productId", "==", productId),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
};

// Получить все активные резервы для фильтров (новая версия)
export const getFilterReserves = async (filterIds, excludeReserveId = null) => {
  if (!filterIds || filterIds.length === 0) return {};
  
  try {
    const now = Timestamp.now();
    const reservesSnapshot = await getDocs(collection(db, "reserves"));
    
    const filterReserves = {};
    
    reservesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Исключаем текущий редактируемый резерв
      if (excludeReserveId && doc.id === excludeReserveId) {
        return;
      }
      
      // Проверяем, что резерв активен и не просрочен
      if (data.status === "active" && 
          data.expiresAt && 
          data.expiresAt.seconds > now.seconds &&
          data.filters && Array.isArray(data.filters)) {
        
        data.filters.forEach((filter) => {
          if (filterIds.includes(filter.id)) {
            if (!filterReserves[filter.id]) {
              filterReserves[filter.id] = 0;
            }
            filterReserves[filter.id] += filter.quantity || 0;
          }
        });
      }
    });
    
    return filterReserves;
  } catch (error) {
    console.error("Ошибка при получении резервов фильтров:", error);
    return {};
  }
};

// Получить все резервы (например, для админа)
export const getAllReserves = async () => {
  try {
    const reservesSnapshot = await getDocs(collection(db, "reserves"));
    return reservesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Ошибка при загрузке всех резервов:", error);
    return [];
  }
};

export const clearExpiredReserves = async () => {
  const now = Timestamp.now();
  const snapshot = await getDocs(collection(db, "reserves"));

  const updates = [];

  snapshot.forEach((res) => {
    const data = res.data();
    if (data.status === "active" && data.expiresAt?.seconds < now.seconds) {
      const ref = doc(db, "reserves", res.id);
      updates.push(updateDoc(ref, { status: "expired" }));
    }
  });

  await Promise.all(updates);
  console.log("Просроченные резервы обновлены (деактивированы)");
};

export const deleteExpiredReserves = async () => {
  const now = Timestamp.now();

  try {
    const snapshot = await getDocs(collection(db, "reserves"));
    const deletes = [];

    snapshot.forEach((res) => {
      const data = res.data();
      if (
        data.status === "active" &&
        data.expiresAt &&
        data.expiresAt.seconds < now.seconds
      ) {
        const ref = doc(db, "reserves", res.id);
        deletes.push(deleteDoc(ref));
      }
    });

    await Promise.all(deletes);
    console.log("Удалены просроченные резервы:", deletes.length);
  } catch (err) {
    console.error("Ошибка при удалении резервов:", err);
  }
};
