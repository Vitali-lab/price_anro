import { useEffect, useState } from "react";
import { fetchLastUpdatedDate } from "../fireBase/firebaseLoad";

export const useLastDate = () => {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const getDate = async () => {
      const dateStr = await fetchLastUpdatedDate();
      if (dateStr) {
        const formatted = new Date(dateStr).toLocaleString();
        setLastUpdated(formatted);
      } else {
        setLastUpdated("Нет данных");
      }
    };
    getDate();
  }, []);

  return {
    lastUpdated,
  };
};
