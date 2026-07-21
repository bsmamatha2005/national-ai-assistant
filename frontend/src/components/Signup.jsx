import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Signup({ onSwitchToLogin }) {
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="welcome-mark">ಸ್ವಾಗತ</div>
        <h1>Create your account</h1>
        <p className="welcome-subtitle">It takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
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
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin}>Log in</button>
        </p>
      </div>
    </div>
  );
}

export default Signup;