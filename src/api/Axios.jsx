import axios from "axios";

const Axios = axios.create({
  baseURL: "http://10.19.135.179:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
  Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default Axios;