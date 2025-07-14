import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const users = [
  {
    login: "user1",
    name: "Виталий",
    email: "pl420.atg@mail.ru",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: true,
    surname: "Климко",
  },
  {
    login: "user2",
    name: "Наталия",
    email: "anrotexgrupp@mail.ru",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: false,
    surname: "Бакан",
  },
  {
    login: "user3",
    name: "Анастасия",
    email: "staisy11@ya.ru",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: false,
    surname: "Ровба",
  },
  {
    login: "user4",
    name: "София",
    email: "pl270.atg@mail.ru",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: false,
    surname: "Гавриленкова",
  },
  {
    login: "user5",
    name: "Антон",
    email: "pl420.atg@gmail.com",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: false,
    surname: "Альшевский",
  },
  {
    login: "user6",
    name: "Вадим",
    email: "anro.smolensk@mail.ru",
    password: 1234,
    avatar:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    isAdmin: false,
    surname: "Муравченков",
  },
];

export const addUsers = async () => {
  try {
    for (const user of users) {
      const userRef = doc(db, "users", user.email);
      await setDoc(userRef, user);
    }
    console.log("Пользователи добавлены в Firebase");
  } catch (error) {
    console.error("Ошибка при добавлении пользователей:", error);
  }
};
