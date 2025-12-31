import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../api/Axios"; // assuming this exists

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await Axios.post("/users/register", { 
        username, 
        password,
        email
      });
      // Assume backend returns: { data: { token, user } }
      
      // Redirect to dashboard
      navigate("/login");
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  }
  

  return (
  <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        <button
          type="button"
          onClick={() => navigate("/login")}>Log In
        </button>

      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
