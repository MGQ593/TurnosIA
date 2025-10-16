"use strict";
(() => {
  const form = document.getElementById("loginForm");
  const alert = document.getElementById("alert");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  function mostrarAlerta(mensaje, tipo) {
    alert.textContent = mensaje;
    alert.className = `alert alert-${tipo} show`;
    if (tipo === "error") {
      setTimeout(() => {
        alert.classList.remove("show");
      }, 5e3);
    }
  }
  function setLoading(loading) {
    loginBtn.disabled = loading;
    if (loading) {
      btnText.innerHTML = 'Verificando...<span class="spinner"></span>';
    } else {
      btnText.textContent = "Iniciar Sesi\xF3n";
    }
  }
  function marcarCamposError() {
    usernameInput.classList.add("error");
    passwordInput.classList.add("error");
    passwordInput.value = "";
    passwordInput.focus();
  }
  function limpiarErrores() {
    usernameInput.classList.remove("error");
    passwordInput.classList.remove("error");
  }
  async function login(credentials) {
    try {
      const response = await fetch("/api/token/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else if (data.success) {
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }
  function guardarSesion(token, username) {
    sessionStorage.setItem("admin_session_token", token);
    sessionStorage.setItem("admin_username", username);
    console.log("\u2705 Sesi\xF3n guardada:", username);
  }
  function redirigirAPanel() {
    mostrarAlerta("\u2705 Acceso concedido. Redirigiendo...", "success");
    setTimeout(() => {
      window.location.href = "/generar-qr.html";
    }, 1e3);
  }
  async function manejarSubmit(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!username || !password) {
      mostrarAlerta("Por favor completa todos los campos", "error");
      return;
    }
    setLoading(true);
    limpiarErrores();
    try {
      const resultado = await login({ username, password });
      if (resultado && resultado.success) {
        guardarSesion(resultado.token, resultado.username);
        redirigirAPanel();
      } else {
        const mensaje = resultado?.message || "Usuario o contrase\xF1a incorrectos";
        mostrarAlerta(mensaje, "error");
        marcarCamposError();
      }
    } catch (error) {
      console.error("Error en login:", error);
      mostrarAlerta("Error de conexi\xF3n. Intenta nuevamente.", "error");
    } finally {
      setLoading(false);
    }
  }
  form.addEventListener("submit", manejarSubmit);
  usernameInput.focus();
  form.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && loginBtn.disabled) {
      e.preventDefault();
    }
  });
  console.log("\u{1F510} Sistema de login admin inicializado");
})();
//# sourceMappingURL=admin-login.js.map
