import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase.js";

// Получить всех контрагентов
export const fetchContragents = async () => {
  try {
    const colRef = collection(db, "contragents");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Ошибка загрузки контрагентов:", error);
    throw error;
  }
};

// Добавить нового контрагента
export const addContragent = async (contragentData) => {
  try {
    const colRef = collection(db, "contragents");
    const docRef = await addDoc(colRef, {
      ...contragentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Ошибка добавления контрагента:", error);
    throw error;
  }
};

// Обновить контрагента
export const updateContragent = async (contragentId, contragentData) => {
  try {
    const docRef = doc(db, "contragents", contragentId);
    await updateDoc(docRef, {
      ...contragentData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Ошибка обновления контрагента:", error);
    throw error;
  }
};

// Удалить контрагента
export const deleteContragent = async (contragentId) => {
  try {
    const docRef = doc(db, "contragents", contragentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Ошибка удаления контрагента:", error);
    throw error;
  }
};

// Поиск контрагентов
export const searchContragents = async (searchTerm) => {
  try {
    const contragents = await fetchContragents();
    
    if (!searchTerm.trim()) {
      return contragents;
    }
    
    const term = searchTerm.toLowerCase();
    return contragents.filter(contragent => 
      contragent.name?.toLowerCase().includes(term) ||
      contragent.inn?.includes(term) ||
      contragent.kpp?.includes(term) ||
      contragent.ogrn?.includes(term) ||
      contragent.email?.toLowerCase().includes(term) ||
      contragent.phone?.includes(term) ||
      contragent.contactPerson?.toLowerCase().includes(term) ||
      contragent.address?.toLowerCase().includes(term) ||
      contragent.notes?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error("Ошибка поиска контрагентов:", error);
    throw error;
  }
};
