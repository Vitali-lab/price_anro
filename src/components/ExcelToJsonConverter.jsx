import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelToJsonConverter = () => {
  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Получаем первый лист
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Пропускаем первые 6 строк (метаданные) и конвертируем в JSON
      const dataArray = XLSX.utils.sheet_to_json(worksheet, { range: 6 });
      
      setJsonData(dataArray);
    };

    reader.readAsArrayBuffer(file);
  };
console.log(jsonData);

  return (
    <div>
      <h2>Загрузите Excel-файл</h2>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
      />
      
      {jsonData.length > 0 && (
        <div>
          <h3>Результат (первые 5 строк):</h3>
          <pre>{JSON.stringify(jsonData.slice(0, 5), null, 2)}</pre>
          <button onClick={() => console.log(jsonData)}>
            Вывести в консоль
          </button>
        </div>
      )}
    </div>
  );
};

export default ExcelToJsonConverter;