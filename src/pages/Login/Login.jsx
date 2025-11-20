import React, { useState, useEffect } from "react";
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
  const [inputFocused, setInputFocused] = useState(false);
  const [formZoomed, setFormZoomed] = useState(false);
  const navigate = useNavigate();

  // Función para hacer scroll al campo cuando recibe el foco
  const handleInputFocus = (e, setFocused) => {
    setFocused(true);
    
    if (window.innerWidth <= 480) {
      const input = e.target;
      
      // Primero, asegurar que el input esté visible usando scrollIntoView
      // Usar 'instant' para que sea más rápido y confiable
      input.scrollIntoView({ 
        behavior: 'instant', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Usar requestAnimationFrame para asegurar que el scroll se complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Verificar que el input esté visible antes de bloquear scroll
          const rect = input.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          // Si no está completamente visible, hacer otro scroll
          if (!isVisible) {
            input.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
          
          // Bloquear scroll después de asegurar que el campo esté visible
          setTimeout(() => {
            document.body.classList.add('login-input-focused');
            document.documentElement.classList.add('login-input-focused');
          }, 300);
        });
      });
    }
  };

  const handleInputBlur = (setFocused) => {
    setFocused(false);
    // Remover clases con un pequeño delay para evitar parpadeos
    setTimeout(() => {
      document.body.classList.remove('login-input-focused');
      document.documentElement.classList.remove('login-input-focused');
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Activar zoom del formulario en móviles
    if (window.innerWidth <= 480) {
      setFormZoomed(true);
      // Haptic feedback en dispositivos móviles (si está disponible)
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // Hacer scroll al formulario y centrarlo
      const form = e.target;
      setTimeout(() => {
        form.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
    }
    
    setLoading(true);

    try {
      const response = await authAPI.login(usuario, password);
      
      // Haptic feedback de éxito
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      // Haptic feedback de error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setErrorMsg(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
      // Desactivar zoom si hay error después de un tiempo
      if (window.innerWidth <= 480) {
        setTimeout(() => setFormZoomed(false), 3000);
      }
    }
  };

  return (
    <LoginLayout inputFocused={inputFocused}>
      <div className={`login-container ${inputFocused ? 'input-focused' : ''}`} style={{ width: '100%', maxWidth: '100%' }}>
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

            <form className={`login-form ${formZoomed ? 'form-zoomed' : ''}`} onSubmit={handleSubmit}>
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
                  onFocus={(e) => handleInputFocus(e, setInputFocused)}
                  onBlur={() => handleInputBlur(setInputFocused)}
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
                    onFocus={(e) => handleInputFocus(e, setInputFocused)}
                    onBlur={() => handleInputBlur(setInputFocused)}
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

