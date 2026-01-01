import { useNavigate } from "react-router-dom";

export default function DeviceCard({ device, plainSecret , deviceSecret}) {
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
    >
      <div
        onClick={() => navigate(`/device/${device.deviceId}`)}
        style={{
          border: "1px solid #ccc",
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems:"center",
          marginBottom: 10,
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        <h3>Device Name: </h3>
        <p>{device.deviceName}</p>
        <h4>Device ID:</h4> 
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

      {plainSecret && (
        <div style={{ padding: 10, background: "#555",
          padding: 10,
          marginBottom: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",borderRadius: 4 }}>
          <strong>Plain Secret:</strong>
          <div style={{ wordBreak: "break-all", fontSize: 12 }}>
            {plainSecret}
          </div>
          <button onClick={() => navigator.clipboard.writeText(plainSecret)}>
            Copy Secret
          </button>
        </div>
      )}
      
      {deviceSecret && (
        <div style={{ padding: 10, background: "#555",
          padding: 10,
          marginBottom: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 4 }}>
          <strong>Device Secret:</strong>
          <div style={{ wordBreak: "break-all", fontSize: 12 }}>
            {deviceSecret}
          </div>
          <button onClick={() => navigator.clipboard.writeText(deviceSecret)}>
            Copy Secret
          </button>
        </div>
      )}

      <div
        style={{
          
          textAlign: "center",
          alignItems: "center",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        <button
          style={{
            border: "1px solid #ccc",
            textAlign: "center",
            alignItems: "center",
            padding: 10,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Remove Device
        </button>
      </div>
    </div>
  );
}