import styles from './Loading.module.css';

export const Loading = ({ size = 'medium', text = 'Загрузка...' }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export const LoadingOverlay = ({ isVisible, text }) => {
  if (!isVisible) return null;
  
  return (
    <div className={styles.overlay}>
      <Loading text={text} />
    </div>
  );
};
