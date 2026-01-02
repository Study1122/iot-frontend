import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../api/Axios";

export default function DeviceDetails() {
  const { deviceId } = useParams(); // device.deviceId (string)
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [features, setFeatures] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [plainSecret, setPlainSecret] = useState(null);

  //add update delete devices
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    featureId: "",
    name: "",
    type: "switch"
  });
  const [editingFeature, setEditingFeature] = useState(null);
  

  const [telemetryLoading, setTelemetryLoading] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH DEVICE ================= */
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await Axios.get(`/devices/${deviceId}`);
        setDevice(res.data.data);
        setFeatures(res.data.data.features || []);
      } catch (err) {
        alert("No device found");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [deviceId, navigate]);

  /* ================= FETCH TELEMETRY (AUTO REFRESH) ================= */
  useEffect(() => {
    if (!device) return;

    const fetchTelemetry = async () => {
      try {
        const res = await Axios.get(
          `/devices/${device.deviceId}/telemetry?limit=20`
        );
        setTelemetry(res.data.data);
      } catch (err) {
        console.error("Failed to load telemetry", err);
      } finally {
        setTelemetryLoading(false);
      }
    };

    fetchTelemetry(); // initial fetch
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, [device]);

  /* ================= DEVICE ACTIONS ================= */
  const regenerateSecret = async () => {
    if (!window.confirm("Regenerate secret? Old secret will stop working.")) return;

    try {
      setActionLoading(true);
      const res = await Axios.patch(
        `/devices/${device._id}/regenerate-secret`
      );
      setPlainSecret(res.data.data.plainSecret);
    } catch {
      alert("Failed to regenerate secret");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDevice = async () => {
    if (!window.confirm("Delete this device permanently?")) return;

    try {
      setActionLoading(true);
      await Axios.delete(`/devices/${device._id}`);
      navigate("/dashboard");
    } catch {
      alert("Failed to delete device");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= FEATURE CONTROL ================= */
  const updateFeatureControl = async (featureId, payload) => {
    try {
      const res = await Axios.patch(
        `/devices/${device.deviceId}/feature`,
        { featureId, ...payload }
      );

      setFeatures(prev =>
        prev.map(f =>
          f.featureId === featureId ? { ...f, ...res.data.data } : f
        )
      );
    } catch (err) {
      console.error("Feature update failed", err);
      alert("Failed to update device feature");
    }
  };

  const toggleFeature = (feature) => {
    updateFeatureControl(feature.featureId, {
      isOn: !feature.isOn
    });
  };

  const changeFanSpeed = (feature, level) => {
    updateFeatureControl(feature.featureId, {
      level,
      isOn: level > 0
    });
  };
  //add feature
  const addFeature = async () => {
    if (!newFeature.featureId || !newFeature.type) {
      alert("FeatureId and type are required");
      return;
    }
  
    try {
      setActionLoading(true);
  
      const res = await Axios.post(
        `/devices/${device.deviceId}/feature`,
        newFeature
      );
  
      setFeatures(prev => [...prev, res.data.data]);
  
      setNewFeature({ featureId: "", name: "", type: "switch" });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  //update feature
  const updateFeatureMeta = async () => {
    try {
      setActionLoading(true);
  
      const res = await Axios.patch(
        `/devices/${device.deviceId}/feature`,
        {
          featureId: editingFeature.featureId,
          name: editingFeature.name,
          type: editingFeature.type
        }
      );
  
      setFeatures(prev =>
        prev.map(f =>
          f.featureId === editingFeature.featureId
            ? { ...f, ...res.data.data }
            : f
        )
      );
  
      setEditingFeature(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update feature");
    } finally {
      setActionLoading(false);
    }
  };
  
  //delete feature
  const removeFeature = async (featureId) => {
    if (!window.confirm("Remove this feature?")) return;
  
    try {
      setActionLoading(true);
  
      await Axios.delete(
        `/devices/${device.deviceId}/feature/${featureId}`
      );
  
      setFeatures(prev =>
        prev.filter(f => f.featureId !== featureId)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to remove feature");
    } finally {
      setActionLoading(false);
    }
  };
    

  /* ================= UI ================= */
  if (loading) return <h2>Loading device...</h2>;
  if (!device) return null;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>{device.deviceName}</h2>
      <p><strong>Device ID:</strong> {device.deviceId}</p>
      <p><strong>Status:</strong> {device.status}</p>
      <p><strong>Last Seen:</strong> {device.lastSeen}</p>

      {/* ================= SECRET ================= */}
      {plainSecret && (
        <div style={{ marginTop: 20, padding: 15, background: "#333", borderRadius: 6 }}>
          <h4>New Device Secret</h4>
          <div style={{ wordBreak: "break-all" }}>{plainSecret}</div>
          <button onClick={() => navigator.clipboard.writeText(plainSecret)}>
            Copy Secret
          </button>
          <p style={{ color: "orange", fontSize: 12 }}>
            ⚠ Save this now. You won’t see it again.
          </p>
        </div>
      )}

      {/* ================= CONTROLS ================= */}
      <div style={{ marginTop: 30, padding: 15, border: "1px solid #444", borderRadius: 6 }}>
        <h3>🎛 Device Controls</h3>
        <button onClick={() => setShowAddForm(v => !v)}>
          ➕ Add Feature
        </button>
        {showAddForm && (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid #555" }}>
            <input
              placeholder="Feature ID"
              value={newFeature.featureId}
              onChange={e =>
                setNewFeature({ ...newFeature, featureId: e.target.value })
              }
            />
        
            <input
              placeholder="Display Name"
              value={newFeature.name}
              onChange={e =>
                setNewFeature({ ...newFeature, name: e.target.value })
              }
            />
        
            <select
              value={newFeature.type}
              onChange={e =>
                setNewFeature({ ...newFeature, type: e.target.value })
              }
            >
              <option value="switch">Switch</option>
              <option value="bulb">Bulb</option>
              <option value="fan">Fan</option>
            </select>
        
            <button onClick={addFeature}>Save</button>
          </div>
        )}
        {features.length === 0 && <p>No controls configured</p>}
      
        {features.map(feature => (
          <div
            key={feature.featureId}
            style={{
              marginBottom: 12,
              padding: 10,
              border: "1px solid #555",
              borderRadius: 6
            }}
          >
            <strong>
              {feature.featureId}
              {feature.name && ` — ${feature.name}`}
            </strong>
      
            {/* Bulb or generic switch */}
            {(feature.type === "bulb" || feature.type === "switch") && (
              <div style={{ marginTop: 6 }}>
                Status: {feature.isOn ? "ON" : "OFF"}
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature.isOn ? "Turn OFF" : "Turn ON"}
                </button>
              </div>
            )}
      
            {/* Fan control */}
            {feature.type === "fan" && (
              <div style={{ marginTop: 6 }}>
                Status: {feature.isOn ? "ON" : "OFF"}
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature.isOn ? "Turn OFF" : "Turn ON"}
                </button>
      
                <div style={{ marginTop: 6 }}>
                  <label>Speed: {feature.level}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={feature.level}
                    disabled={!feature.isOn}
                    onChange={(e) =>
                      changeFanSpeed(feature, Number(e.target.value))
                    }
                  />
                </div>
              </div>
            )}
            <button onClick={() => setEditingFeature({ ...feature })}>✏</button>
            <button onClick={() => removeFeature(feature.featureId)}>🗑</button>
          </div>
        ))}
        
        {/*Edit the controll*/}
        {editingFeature && (
          <div style={{ marginTop: 15 }}>
            <h4>Edit Feature</h4>
            <input
              value={editingFeature.name}
              onChange={e =>
                setEditingFeature({ ...editingFeature, name: e.target.value })
              }
            />
            <select
              value={editingFeature.type}
              onChange={e =>
                setEditingFeature({ ...editingFeature, type: e.target.value })
              }
            >
              <option value="switch">Switch</option>
              <option value="bulb">Bulb</option>
              <option value="fan">Fan</option>
            </select>
            <button onClick={updateFeatureMeta}>Update</button>
            <button onClick={() => setEditingFeature(null)}>Cancel</button>
          </div>
        )}
      </div>

      {/* ================= TELEMETRY ================= */}
      <div style={{ marginTop: 30, padding: 15, border: "1px solid #444", borderRadius: 6 }}>
        <h3>📡 Recent Telemetry</h3>

        {telemetryLoading && <p>Loading telemetry...</p>}
        {!telemetryLoading && telemetry.length === 0 && <p>No telemetry data</p>}

        {!telemetryLoading &&
          telemetry.filter(t => t.eventType === "sensor").map((t, i) => (
            <div key={i}>
              🌡 {t.data.temperature ?? "--"}°C | 
              💧 {t.data.humidity ?? "--"}% | 
              ⚡ {t.data.voltage ?? "--"}V | 
              🕒{" "}
              {new Date(t.createdAt).toLocaleString()}
            </div>
          ))}
      </div>

      {/* ================= DANGER ZONE ================= */}
      <div style={{ marginTop: 30, padding: 15, border: "1px solid red", borderRadius: 6 }}>
        <h3 style={{ color: "red" }}>Danger Zone</h3>
        <button onClick={regenerateSecret} disabled={actionLoading}>
          🔄 Regenerate Secret
        </button>
        <button
          onClick={deleteDevice}
          disabled={actionLoading}
          style={{ marginLeft: 10, color: "red" }}
        >
          🗑 Delete Device
        </button>
      </div>
    </div>
  );
}