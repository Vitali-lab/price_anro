import { useState } from "react";
import { uploadStockData } from "../fireBase/firebaseUpload";
import { updateLastUpdatedDate } from "../fireBase/updadeDate";
import * as XLSX from "xlsx";

export const useCreateLoadJson = () => {
  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
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

      uploadStockData(dataArray);
      updateLastUpdatedDate();
    };

    reader.readAsArrayBuffer(file);
  };

  return {
    jsonData,
    setJsonData,
    handleFileUpload,
  };
};
