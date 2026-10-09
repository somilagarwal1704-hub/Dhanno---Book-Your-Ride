import { Route, Routes } from "react-router-dom";
import Start from "./pages/Start.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import UserSignup from "./pages/UserSignup.jsx";
import UserProtectedComponent from "./pages/UserProtectedComponent.jsx";
import UserLogout from "./pages/UserLogout.jsx";
import Home from "./pages/Home.jsx";
import Riding from "./pages/Riding.jsx";
import Activity from "./pages/Activity.jsx";
import Wallet from "./pages/Wallet.jsx";
import CaptainLogin from "./pages/CaptainLogin.jsx";
import CaptainSignup from "./pages/CaptainSignup.jsx";
import CaptainProtectedComponent from "./pages/CaptainProtectedComponent.jsx";
import CaptainLogout from "./pages/CaptainLogout.jsx";
import CaptainHome from "./pages/CaptainHome.jsx";
import CaptainRiding from "./pages/CaptainRiding.jsx";
import NotFound from "./pages/NotFound.jsx";

const User = ({ children }) => <UserProtectedComponent>{children}</UserProtectedComponent>;
const Captain = ({ children }) => <CaptainProtectedComponent>{children}</CaptainProtectedComponent>;

const App = () => (
  <Routes>
    <Route path="/" element={<Start />} />

    <Route path="/user/login" element={<UserLogin />} />
    <Route path="/user/signup" element={<UserSignup />} />
    <Route path="/user/logout" element={<User><UserLogout /></User>} />
    <Route path="/home" element={<User><Home /></User>} />
    <Route path="/riding/:rideId" element={<User><Riding /></User>} />
    <Route path="/activity" element={<User><Activity /></User>} />
    <Route path="/wallet" element={<User><Wallet /></User>} />

    <Route path="/captain/login" element={<CaptainLogin />} />
    <Route path="/captain/signup" element={<CaptainSignup />} />
    <Route path="/captain/logout" element={<Captain><CaptainLogout /></Captain>} />
    <Route path="/captain/home" element={<Captain><CaptainHome /></Captain>} />
    <Route path="/captain/riding/:rideId" element={<Captain><CaptainRiding /></Captain>} />
    <Route path="/captain/earnings" element={<Captain><Wallet role="captain" /></Captain>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
