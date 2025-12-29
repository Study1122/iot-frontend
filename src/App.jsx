import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Device from "./pages/Device";
import ProtectedRoute from "./pages/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/device"
          element={
            <ProtectedRoute>
              <Device />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}