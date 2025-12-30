import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from "../api/Axios";

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
      navigate("/", { replace: true });
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
        devices.map((d) => (
          <div key={d._id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <h3>{d.deviceName}</h3>
            <p>ID: {d.deviceId}</p>
          </div>
        ))
      )}
    </div>
  );
}