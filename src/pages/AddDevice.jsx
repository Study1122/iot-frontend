import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from "../api/Axios";

export default function AddDevice(){
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleAddDevice = async (e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");
    try{
      const res = await Axios.post("/devices/register", { 
        deviceName, 
        deviceId 
      });
      navigate("/dashboard");
      
    }catch(err){
      setError(err.response?.data?.message || "Failed to add device")
    }finally{
      setLoading(false);
    }
  }
  
  return(
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Add Device</h1>
      <form onSubmit={handleAddDevice} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Device Name"
          value={deviceName}
          required
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Device Id"
          value={deviceId}
          required
          onChange={(e) => setDeviceId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}