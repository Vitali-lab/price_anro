import {
  collection,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export const uploadStockData = async (items = []) => {
  const colRef = collection(db, "products");

  const existingDocs = await getDocs(colRef);

  const deletePromises = existingDocs.docs.map((docSnap) =>
    deleteDoc(doc(colRef, docSnap.id))
  );
  await Promise.all(deletePromises);

  // Добавить новые
  const writePromises = items.map(async (item) => {
    const id = crypto.randomUUID();
    await setDoc(doc(colRef, id), item);
  });

  await Promise.all(writePromises);
};
