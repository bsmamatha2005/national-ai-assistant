import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onSwitchToSignup }) {
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="welcome-mark">ನಮಸ್ಕಾರ</div>
        <h1>Welcome back</h1>
        <p className="welcome-subtitle">Log in to continue your chat.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        {/* OAuth temporarily disabled — enable once Google/GitHub apps are
            fully configured. Just uncomment the two buttons below. */}
        {/*
        <button className="oauth-btn google" onClick={loginWithGoogle}>
          Continue with Google
        </button>
        <button className="oauth-btn github" onClick={loginWithGithub}>
          Continue with GitHub
        </button>
        */}

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToSignup}>Sign up</button>
        </p>
      </div>
    </div>
  );
}

export default Login;