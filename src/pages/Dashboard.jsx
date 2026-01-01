import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from "../api/Axios";
import DeviceCard from "../components/DeviceCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [username, setUsername] = useState("");
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
        const username = localStorage.getItem("username");
        setUsername(username);
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
    <div style={{ padding: 10 ,backgroundColor : "grey"}}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between"}}>
        <h2>Dashboard</h2>
        <h3>Welcome: {username}</h3>
        
        <button onClick={handleLogout}>Logout</button>
      </div>

      <hr />
    {/*add new device*/}
    <div 
      style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
     <button onClick={()=>navigate(`/device/addDevice`)} style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer",
      }}
      >Add Device</button> 
    </div>

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