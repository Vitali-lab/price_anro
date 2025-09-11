import { useState } from "react";
import { uploadStockData } from "../fireBase/firebaseUpload";
import { updateLastUpdatedDate } from "../fireBase/updadeDate";
import * as XLSX from "xlsx";

export const useCreateLoadJson = () => {
  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (e) => {
    return new Promise((resolve, reject) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('Файл не выбран'));
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const rawDataArray = XLSX.utils.sheet_to_json(worksheet, { range: 6 });

          const dataArray = rawDataArray.map((item) => ({
            ...item,
            Аналог: item["Аналог"] ? String(item["Аналог"]) : "",
          }));

          setJsonData(dataArray);

          // Загружаем данные в Firebase
          await uploadStockData(dataArray);
          await updateLastUpdatedDate();
          
          resolve(dataArray);
        } catch (error) {
          console.error('Ошибка обработки файла:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return {
    jsonData,
    setJsonData,
    handleFileUpload,
  };
};
