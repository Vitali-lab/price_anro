import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo || null
    });
    
    // Логирование ошибки (в продакшене можно отправить в сервис мониторинга)
    console.error('ErrorBoundary caught an error:', error?.message || error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Что-то пошло не так</h2>
            <p>Произошла непредвиденная ошибка. Пожалуйста, обновите страницу или обратитесь к администратору.</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className={styles.errorDetails}>
                <summary>Детали ошибки (только для разработки)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
