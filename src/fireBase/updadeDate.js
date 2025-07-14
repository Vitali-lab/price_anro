import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateLastUpdatedDate = async () => {
  const now = new Date().toISOString();
  await setDoc(doc(db, "meta", "lastUpdated"), {
    date: now,
  });
};
