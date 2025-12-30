import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../api/Axios";

export default function DeviceDetails() {
  const { deviceId } = useParams();

  const [status, setStatus] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeviceData = async () => {
    try {
      const [statusRes, telemetryRes] = await Promise.all([
        Axios.get(`/devices/${deviceId}/status`),
        Axios.get(`/devices/${deviceId}/telemetry?limit=10`)
      ]);

      setStatus(statusRes.data.data);
      setTelemetry(telemetryRes.data.data);
    } catch (err) {
      console.error("Failed to load device data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();

    const interval = setInterval(fetchDeviceData, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (loading) return <h3>Loading...</h3>;

  const latest = telemetry[0];

  return (
    <div style={{ padding: 20 }}>
      <h2>Device: {deviceId}</h2>

      {/* STATUS */}
      <p>
        Status:{" "}
        <b style={{ color: status?.online ? "green" : "red" }}>
          {status?.online ? "ONLINE" : "OFFLINE"}
        </b>
      </p>

      {/* TELEMETRY */}
      {latest ? (
        <>
          <p>🌡 Temp: {latest.data.temperature} °C</p>
          <p>💧 Humidity: {latest.data.humidity} %</p>
          <p>⚡ Voltage: {latest.data.voltage} V</p>
          <small>
            Last update:{" "}
            {new Date(latest.createdAt).toLocaleString()}
          </small>
        </>
      ) : (
        <p>No telemetry data yet</p>
      )}
    </div>
  );
}
