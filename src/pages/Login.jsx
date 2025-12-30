import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../api/Axios"; // assuming this exists


export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // ✅ redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await Axios.post("/users/login", { 
        username, 
        password 
        
      });
      // Assume backend returns: { data: { token, user } }
      const { accessToken, user } = res.data.data;

      if (!accessToken) throw new Error("No token returned");

      // Save token to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", user._id);
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
  <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}