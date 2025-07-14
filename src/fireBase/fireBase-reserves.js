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

// Создать резерв
export const createReserve = async (
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
    where("userId", "==", userId),
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

// Получить все активные резервы для товара
export const getProductReserves = async (productId) => {
  const q = query(
    collection(db, "reserves"),
    where("productId", "==", productId),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
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
