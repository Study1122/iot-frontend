import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/SignUp";
import Device from "./pages/Device";
import ProtectedRoute from "./pages/ProtectedRoute";
import DeviceDetails from "./pages/DeviceDetails";
import AddDevice from "./pages/AddDevice";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Device list page (optional) */}
        <Route
          path="/device"
          element={
            <ProtectedRoute>
              <Device />
            </ProtectedRoute>
          }
        />

        {/* 🔥 THIS WAS MISSING */}
        <Route
          path="/device/:deviceId"
          element={
            <ProtectedRoute>
              <DeviceDetails />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/device/addDevice"
          element={
            <ProtectedRoute>
              <AddDevice />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
