import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import UserContext from "./context/UserContext.jsx";
import CaptainContext from "./context/CaptainContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CaptainContext>
        <UserContext>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </UserContext>
      </CaptainContext>
    </ThemeProvider>
  </StrictMode>,
);
