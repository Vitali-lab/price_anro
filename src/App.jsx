import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { Login } from "./Pages/Login";
import { PrivateRoute } from "./PrivateRoute";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { addUsers } from './fireBase/fireBase-set-users'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import { ToastProvider, useToast } from './context/ToastContext'
import { Loading } from './components/Loading'

// Lazy loading для страниц
const Filters = lazy(() => import("./Pages/Filters").then(module => ({ default: module.Filters })));
const Reserve = lazy(() => import('./Pages/Reserve').then(module => ({ default: module.Reserve })));
const MainPage = lazy(() => import("./Pages/MainPage").then(module => ({ default: module.MainPage })));
const ContractForm = lazy(() => import('./Pages/Docs').then(module => ({ default: module.ContractForm })));
const GuestFilters = lazy(() => import('./Pages/GuestFilters').then(module => ({ default: module.GuestFilters })));
const UserProfile = lazy(() => import('./Pages/UserProfile').then(module => ({ default: module.UserProfile })));
const Contragents = lazy(() => import('./Pages/Contragents').then(module => ({ default: module.Contragents })));


const AppContent = () => {
  const { isLoading } = useAuth();
  const { toasts, removeToast } = useToast();

  if (isLoading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Загрузка...</div>;
  }

  return (
    <ErrorBoundary>
      <Header/>
      <Suspense fallback={<Loading text="Загрузка страницы..." />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/filters"
            element={
              <PrivateRoute>
                <Filters />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          />
           <Route
            path="/reserves"
            element={
              <PrivateRoute>
                <Reserve />
              </PrivateRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <PrivateRoute>
                <ContractForm />
              </PrivateRoute>
            }
          />
           <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/contragents"
            element={
              <PrivateRoute>
                <Contragents />
              </PrivateRoute>
            }
          />
          <Route
            path="/guest"
            element={
                <GuestFilters />
            }
          />
          <Route
            path="*"
            element={
              <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>
                <h2>Страница не найдена</h2>
                <p>Запрашиваемая страница не существует.</p>
                <button onClick={() => window.location.href = '/'}>
                  Вернуться на главную
                </button>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
   </ErrorBoundary>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}