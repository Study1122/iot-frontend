import { useParams } from "react-router-dom";

export default function Device() {
  const { deviceId } = useParams();
  return <h1>Device: {deviceId}</h1>;
}