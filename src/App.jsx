import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Filters } from "./Pages/Filters";
import { Login } from "./Pages/Login";
import { PrivateRoute } from "./PrivateRoute";
import { Reserve } from './Pages/Reserve'
import { MainPage } from "./Pages/MainPage";
import { useAuth } from "./context/AuthContext";
import { ContractForm } from './Pages/Docs';
import { GuestFilters } from './Pages/GuestFilters'
import { UserProfile } from './Pages/UserProfile'
import { useEffect } from "react";
import { addUsers } from './fireBase/fireBase-set-users'


export default function App() {

     const { isLoading } = useAuth()

 

  if (isLoading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Загрузка...</div>;
  }



  return (
    <>
      <Header/>
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
          path="/guest"
          element={
              <GuestFilters />
          }
        />
      </Routes>
   </>
  );
}