import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import InternPage from "./components/InternPage";
import SupervisorPage from "./components/SupervisorPage";
import AdminPage from "./components/AdminPage";
import SignupPage from "./components/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import HomePage from "./components/Homepage";
import ProfilePage from "./components/ProfilePage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";

function App() {
  return (
    <AuthProvider>
      
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<Navbar />} >
          <Route
            path="/intern"
            element={
              <ProtectedRoute role="intern">
                <InternPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute role="supervisor">
                <SupervisorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern/profile"
            element={
              <ProtectedRoute role="intern">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/profile"
            element={
              <ProtectedRoute role="supervisor">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute role="admin">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          </Route>
        </Routes>
      
    </AuthProvider>
  );
}
export default App;