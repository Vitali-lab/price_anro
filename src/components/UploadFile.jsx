
import styles from './UploadFile.module.css'

export const UploadFile = ({handleFileUpload}) => {


    return(
        <div className={styles.uploadPrice}>
              <h2>Загрузите Excel-файл</h2>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
              />
              </div>
    )
}