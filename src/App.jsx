
import { SearchFilter } from './components/SearchFilter'
import styles from './App.module.css'
import { useState ,useEffect } from 'react'
import { fetchStockData } from './components/firebaseLoad';
import { uploadStockData } from './components/firebaseUpload';
import * as XLSX from 'xlsx';


function App() {
  
 const [jsonData, setJsonData] = useState([]);
 const [sale, setSale] = useState(false)
 const [upload, setUpload] = useState(false)

 
   const handleFileUpload = (e) => {
     const file = e.target.files[0];
     const reader = new FileReader();
 
     reader.onload = (e) => {
       const data = new Uint8Array(e.target.result);
       const workbook = XLSX.read(data, { type: 'array' });
       
       const firstSheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[firstSheetName];
       
       const dataArray = XLSX.utils.sheet_to_json(worksheet, { range: 6 });
       
       setJsonData(dataArray);
       uploadStockData(dataArray)
     };
 
     reader.readAsArrayBuffer(file);
   };

useEffect(() => {
  fetchStockData().then(setJsonData);
}, []);
   




  return (
    <>
    {upload && <div className={styles.uploadPrice}>
      <h2>Загрузите Excel-файл</h2>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
      />
      </div>}
    <div className={styles.main}>
      <div className={styles.mainButtons} >
      <button className={`${sale?styles.buttonPrice: styles.activeButtonPrice}`} onClick={()=>{setSale(false)}}>Оптовая цена</button>
      <button className={`${!sale?styles.buttonPrice: styles.activeButtonPrice}`} onClick={()=>{setSale(true)}}>Розничная цена</button>
      </div>
      <SearchFilter jsonData = {jsonData} sale= {sale} setUpload={setUpload} upload={upload} />
      </div>
     
      
      
    </>
  )
}

export default App
