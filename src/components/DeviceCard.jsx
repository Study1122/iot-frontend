import { useNavigate } from "react-router-dom";
import Axios from "../api/Axios";

export default function DeviceCard({ device }) {
  const navigate = useNavigate();
  
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/device/${device._id}`)}
    >
      <div
        style={{
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems:"center",
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        <h3>{device.deviceName}</h3>
        <strong>Device ID:</strong> 
        <p>{device.deviceId}</p>
        <span
          style={{
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 3,
            fontSize: 5,
            color: "#eee",
          }}
        >
          Last Seen: {device.lastSeen}
        </span>
      </div>
    </div>
  );
}