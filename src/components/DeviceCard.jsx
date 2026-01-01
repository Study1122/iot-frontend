import { useNavigate } from "react-router-dom";

export default function DeviceCard({ device }) {
  const navigate = useNavigate();

  return (

    <div style={{
        border: "1px solid #ccc",
        padding: 10,
        display: "flex",
        flexdirection: "column",
        justifyContent: "space-between",
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer"
      }}
    >
      <div
        onClick={() => navigate(`/device/${device.deviceId}`)}
        style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer"
      }}
      >
        <h3>{device.deviceName}</h3>
        <p>Device ID: {device.deviceId}</p>
        <span 
        style={{
          border: "1px solid #ccc",
          padding: 10,
          paddingBottom: 10,
          borderRadius: 3
        }}>Last Seen: {device.lastSeen}</span>
      </div>
      <div
        style={{
        border: "1px solid #ccc",
        textAlign: "center",
        alignItems: "center",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer"
      }}
      >
        <button
        style={{
        border: "1px solid #ccc",
        textAlign: "center",
        alignItems: "center",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer"
      }}
        >Remove Device</button>
      </div>
    </div>
  );
}
