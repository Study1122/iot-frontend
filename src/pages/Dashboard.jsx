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
    <div 
      style={{
        padding: 10, 
        borderRadius: 5,
        backgroundColor : "grey"
      }}>
      
      {/* HEADER */}
      <div 
        style={{ 
          display: "flex",
          justifyContent: "space-between"
        }}>
        <h2>Dashboard</h2>
        <h3>Welcome: {username}</h3>
        <button 
          onClick={handleLogout}
          >Logout</button>
      </div>

      <hr />
      {/*add new device*/}
      <div 
        style={{
          padding: 10,
          display: "flex",
          flexDirection:'column',
          justifyContent: "center",
          alignItem: "center",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
       <button onClick={()=>navigate(`/device/addDevice`)} style={{
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
          cursor: "pointer",
        }}
        >Add Device</button> 
      </div>

      {/* DEVICES */}
      {
        devices.length === 0 ? (
         <p>No device found!</p>
        ) : (
        //replace
        devices.map((d) => (
          <DeviceCard 
            key={d._id} 
            device={d}
            plainSecret={d.plainSecret}content://com.termux.documents/tree/%2Fdata%2Fdata%2Fcom.termux%2Ffiles%2Fhome%2FAcode%2FIOT::/data/data/com.termux/files/home/Acode/IOT/iot-frontend/src/pages/Dashboard.jsx
            deviceSecret={d.deviceSecret} 
            onDelete={(id) => setDevices(prev => prev.filter(d => d._id !== id))}
          />
        ))
      )}
    </div>
  );
}
//plainSecret: "a6f66d5063455703b96585953095ceb6759df878addad889342e4718c9cd35c2"