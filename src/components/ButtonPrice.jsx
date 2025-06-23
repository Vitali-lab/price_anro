
import styles from './ButtonPrice.module.css'
export const ButtonPrice = ({sale, setSale}) => {
      
   

    return(
         <div className={styles.mainButtons} >
              <button className={`${sale?styles.buttonPrice: styles.activeButtonPrice}`} onClick={()=>{setSale(false)}}>Оптовая цена</button>
              <button className={`${!sale?styles.buttonPrice: styles.activeButtonPrice}`} onClick={()=>{setSale(true)}}>Розничная цена</button>
              </div>
    )
}