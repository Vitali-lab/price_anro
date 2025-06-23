import styles from './LastPriceUpdate.module.css'


export const LastPriceUpdate = ({lastUpdated}) => {

    return(
        <div className={styles.updateInfo}>
              <h2>Последнее обновление прайс-листа: {lastUpdated}</h2>
            </div>
    )
}