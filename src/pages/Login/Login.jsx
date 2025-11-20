import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import logoFondo from "../../img/logo_fondo.jpg";
import logoCelularFondo from "../../img/logo_celular_fondo.jpg";
import LoginLayout from "../../components/LoginLayout/LoginLayout";
import { authAPI } from "../../services/api";
import "./Login.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await authAPI.login(usuario, password);
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <header className="login-header">
          <img 
            src={logoFondo} 
            alt="Logo" 
            className="login-header-logo"
          />
        </header>

        <main className="login-main">
          <div className="login-content">
            <div className="login-logo-section">
              <img 
                src={logoCelularFondo} 
                alt="Logo celular" 
                className="login-logo-image"
              />
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <h1 className="login-title">Iniciar sesión</h1>
              <p className="login-description">Ingresa tus credenciales</p>

              <label className="login-field">
                <span className="login-field-label">
                  <PersonRoundedIcon /> Usuario
                </span>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-field-label">
                  <LockRoundedIcon /> Contraseña
                </span>
                <div className="login-password">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="login-toggle"
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </button>
                </div>
              </label>

              {errorMsg && <p className="login-error">{errorMsg}</p>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Acceder"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </LoginLayout>
  );
}

export default Login;

