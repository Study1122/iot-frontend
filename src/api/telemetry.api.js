import Axios from "./Axios";

export const fetchDeviceTelemetry = (deviceId, limit = 20) => {
  return Axios.get(
    `/devices/${deviceId}/telemetry?limit=${limit}`,
    { withCredentials: true }
  );
};