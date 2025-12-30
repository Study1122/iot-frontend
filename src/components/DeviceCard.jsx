import { useNavigate } from "react-router-dom";

export default function DeviceCard({ device }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/device/${device.deviceId}`)}
      style={{
        border: "1px solid #ccc",
        padding: 12,
        marginBottom: 12,
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      <h3>{device.deviceName}</h3>
      <p>Device ID: {device.deviceId}</p>
    </div>
  );
}
