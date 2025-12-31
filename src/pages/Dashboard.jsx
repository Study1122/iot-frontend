import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from "../api/Axios";
import DeviceCard from "../components/DeviceCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await Axios.post("/users/logout"); // optional backend logout
    } catch (err) {
      // ignore error
    } finally {
      localStorage.clear(); // clears token + userId safely
      navigate("/login", { replace: true });
    }
  };
  

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await Axios.get(`/devices/user/${userId}/devices`);
        setDevices(res.data.data);
      } catch (err) {
        console.log("Failed to load devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <hr />

      {/* DEVICES */}
      {devices.length === 0 ? (
        <p>No device found!</p>
      ) : (
        //replace
        devices.map((d) => (
          <DeviceCard key={d._id} device={d} />
        ))
      )}
    </div>
  );
}