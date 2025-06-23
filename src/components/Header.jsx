import { useState } from 'react'
import styles from './Header.module.css'


export const Header = () => {

    const [menuOpen , setMenuOpen] = useState(false)

    return(
        <div className={menuOpen?styles.header:styles.headerClosed}>
          <button className={menuOpen?styles.buttonOpen:styles.buttonClose} onClick={()=>{setMenuOpen(!menuOpen)}}>close</button>
        </div>
    )
}