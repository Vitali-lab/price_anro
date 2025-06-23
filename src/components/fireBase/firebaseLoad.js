import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const fetchStockData = async () => {
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};
export const fetchLastUpdatedDate = async () => {
  const docRef = doc(db, "meta", "lastUpdated");
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data().date : null;
};
