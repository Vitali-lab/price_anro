import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));

  const users = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return users;
};
