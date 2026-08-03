import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StoreProvider } from "./contexts/StoreContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <StoreProvider>
      <App />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  </AuthProvider>,
);
