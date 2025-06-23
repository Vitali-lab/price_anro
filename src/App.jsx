
import { SearchFilter } from './components/SearchFilter'
import styles from './App.module.css'
import { useState ,useEffect } from 'react'
import { fetchStockData } from './components/fireBase/firebaseLoad';
import { useLastDate } from './components/hooks/use-last-date'
import { UploadFile } from './components/UploadFile'
import { LastPriceUpdate } from './components/LastPriceUpdate'
import { useCreateLoadJson } from './components/hooks/use-create-load-json'
import { ButtonPrice } from './components/ButtonPrice'
import { Header } from './components/Header'


function App() {
  
const [sale, setSale] = useState(false)
const [upload, setUpload] = useState(false)
const { lastUpdated } = useLastDate()
const {jsonData, setJsonData,handleFileUpload,} = useCreateLoadJson()

  const loadData = async () => {
    const data = await fetchStockData();
    setJsonData(data);
  };

  useEffect(() => {
    loadData(); 
  }, []);




  return (
    <>
    {upload && <UploadFile handleFileUpload = {handleFileUpload}/>}
    <div className={styles.main}>
       <LastPriceUpdate lastUpdated = {lastUpdated}/>
      <div className={styles.mainButtons} >
        <ButtonPrice sale = {sale} setSale={setSale} />
      </div>
      <SearchFilter jsonData = {jsonData} sale= {sale} setUpload={setUpload} upload={upload} />
      </div>
     
      
      
    </>
  )
}

export default App
