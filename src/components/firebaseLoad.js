import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchStockData = async () => {
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};
