import React from "react";
import { Route, Routes } from "react-router-dom";
import Start from "./pages/Start";
import CaptainSignup from "./pages/CaptainSignup";
import CaptainLogin from "./pages/CaptainLogin";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import Home from "./pages/Home";
import UserProtectedComponent from "./pages/UserProtectedComponent";
import UserLogout from "./pages/UserLogout";
import CaptainHome from "./pages/CaptainHome";
import CaptainProtectedComponent from "./pages/CaptainProtectedComponent";
import CaptainLogout from "./pages/CaptainLogout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/captain/signup" element={<CaptainSignup />} />
      <Route path="/captain/login" element={<CaptainLogin />} />
      <Route path="/user/signup" element={<UserSignup />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route
        path="/home"
        element={
          <UserProtectedComponent>
            <Home />
          </UserProtectedComponent>
        }
      />
      <Route
        path="/user/logout"
        element={
          <UserProtectedComponent>
            <UserLogout />
          </UserProtectedComponent>
        }
      ></Route>

      <Route
        path="/captain/home"
        element={
          <CaptainProtectedComponent>
            <CaptainHome />
          </CaptainProtectedComponent>
        }
      />

      <Route
        path="/captain/logout"
        element={
          <CaptainProtectedComponent>
            <CaptainLogout />
          </CaptainProtectedComponent>
        }
      />
    </Routes>
  );
};

export default App;
