"use strict";
(() => {
  let currentAccessToken = null;
  let expirationMinutes = 15;
  let countdownInterval = null;
  let qrGeneratedCount = 0;
  let sessionStartTime = Date.now();
  let sessionTimeInterval = null;
  let agencias = [];
  const logoImg = document.getElementById("logoImg");
  const adminUsername = document.getElementById("adminUsername");
  const errorMessage = document.getElementById("errorMessage");
  const qrCanvas = document.getElementById("qrCanvas");
  const qrCountDisplay = document.getElementById("qrCount");
  const sessionTimeDisplay = document.getElementById("sessionTime");
  async function verificarSesion() {
    const sessionToken = sessionStorage.getItem("admin_session_token");
    if (!sessionToken) {
      console.log("No hay token de sesi\xF3n, redirigiendo...");
      window.location.href = "/admin-login.html";
      return false;
    }
    try {
      const response = await fetch("/api/token/admin/verificar-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: sessionToken })
      });
      const data = await response.json();
      if (!data.success) {
        console.log("Sesi\xF3n inv\xE1lida o expirada");
        sessionStorage.removeItem("admin_session_token");
        window.location.href = "/admin-login.html";
        return false;
      }
      if (data.data?.username && adminUsername) {
        adminUsername.textContent = data.data.username;
      }
      return true;
    } catch (error) {
      console.error("Error verificando sesi\xF3n:", error);
      mostrarError("Error verificando la sesi\xF3n. Intenta iniciar sesi\xF3n nuevamente.");
      setTimeout(() => {
        window.location.href = "/admin-login.html";
      }, 2e3);
      return false;
    }
  }
  async function cargarConfiguracion() {
    try {
      const response = await fetch("/api/config/public");
      const config = await response.json();
      if (config.logoUrl && logoImg) {
        logoImg.src = config.logoUrl;
      }
      if (config.accessTokenExpirationMinutes) {
        expirationMinutes = config.accessTokenExpirationMinutes;
      }
    } catch (error) {
      console.error("Error cargando configuraci\xF3n:", error);
    }
  }
  async function cargarAgencias() {
    try {
      const response = await fetch("/api/turnos/agencias");
      const data = await response.json();
      if (data.success && data.data) {
        agencias = data.data;
        const selectAgencia = document.getElementById("selectAgencia");
        if (selectAgencia) {
          selectAgencia.innerHTML = '<option value="">Selecciona una agencia</option>';
          agencias.forEach((agencia) => {
            const option = document.createElement("option");
            option.value = agencia.id.toString();
            option.textContent = `${agencia.nombre} (${agencia.codigo})`;
            selectAgencia.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error("Error cargando agencias:", error);
      mostrarError("Error al cargar las agencias");
    }
  }
  async function generarNuevoQR() {
    try {
      mostrarError("");
      const selectAgencia = document.getElementById("selectAgencia");
      if (!selectAgencia || !selectAgencia.value) {
        mostrarError("Por favor selecciona una agencia");
        return;
      }
      const agenciaId = parseInt(selectAgencia.value);
      if (typeof qrcode === "undefined") {
        throw new Error("Librer\xEDa qrcode no est\xE1 cargada. Verifica tu conexi\xF3n a internet.");
      }
      const response = await fetch("/api/token/generar-acceso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ agenciaId })
      });
      const data = await response.json();
      if (!data.success || !data.data?.token) {
        throw new Error(data.message || "Error al generar el token");
      }
      const token = data.data.token;
      currentAccessToken = token;
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/solicitar-turno.html?id_agencia=${agenciaId}&access=${token}`;
      console.log("\u{1F4F1} Generando QR para agencia", agenciaId, "- URL:", qrUrl);
      const qr = qrcode(0, "M");
      qr.addData(qrUrl);
      qr.make();
      if (!qrCanvas) {
        throw new Error("Canvas no encontrado");
      }
      const cellSize = 8;
      const margin = 4;
      const size = qr.getModuleCount() * cellSize + margin * 2;
      qrCanvas.width = size;
      qrCanvas.height = size;
      const ctx = qrCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo obtener el contexto 2D del canvas");
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      for (let row = 0; row < qr.getModuleCount(); row++) {
        for (let col = 0; col < qr.getModuleCount(); col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              col * cellSize + margin,
              row * cellSize + margin,
              cellSize,
              cellSize
            );
          }
        }
      }
      qrGeneratedCount++;
      if (qrCountDisplay) {
        qrCountDisplay.textContent = qrGeneratedCount.toString();
      }
      console.log("\u2705 QR permanente generado exitosamente");
    } catch (error) {
      console.error("Error generando QR:", error);
      mostrarError("Error al generar el c\xF3digo QR. Por favor intenta nuevamente.");
    }
  }
  function descargarQR() {
    if (!currentAccessToken) {
      mostrarError("Primero genera un c\xF3digo QR");
      return;
    }
    if (!qrCanvas) {
      mostrarError("Canvas no encontrado");
      return;
    }
    try {
      const url = qrCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-turno-chevyplan-${Date.now()}.png`;
      link.href = url;
      link.click();
      console.log("\u{1F4BE} QR descargado");
    } catch (error) {
      console.error("Error descargando QR:", error);
      mostrarError("Error al descargar el QR");
    }
  }
  function mostrarError(mensaje) {
    if (!errorMessage) return;
    if (mensaje) {
      errorMessage.textContent = mensaje;
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none";
    }
  }
  function logout() {
    if (confirm("\xBFEst\xE1s seguro de que quieres cerrar la sesi\xF3n?")) {
      sessionStorage.removeItem("admin_session_token");
      sessionStorage.removeItem("admin_username");
      window.location.href = "/admin-login.html";
    }
  }
  function actualizarTiempoSesion() {
    sessionTimeInterval = window.setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const minutes = Math.floor(elapsed / 6e4);
      const seconds = Math.floor(elapsed % 6e4 / 1e3);
      const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      if (sessionTimeDisplay) {
        sessionTimeDisplay.textContent = display;
      }
    }, 1e3);
  }
  window.generarNuevoQR = generarNuevoQR;
  window.descargarQR = descargarQR;
  window.logout = logout;
  async function inicializar() {
    try {
      const sesionValida = await verificarSesion();
      if (!sesionValida) return;
      await cargarConfiguracion();
      await cargarAgencias();
      const btnGenerar = document.querySelector(".btn-primary");
      if (btnGenerar) {
        btnGenerar.style.display = "flex";
      }
      const btnGenerarQR = document.getElementById("btnGenerarQR");
      const btnDescargarQR = document.getElementById("btnDescargarQR");
      const btnLogout = document.getElementById("btnLogout");
      if (btnGenerarQR) {
        btnGenerarQR.addEventListener("click", () => generarNuevoQR());
      }
      if (btnDescargarQR) {
        btnDescargarQR.addEventListener("click", descargarQR);
      }
      if (btnLogout) {
        btnLogout.addEventListener("click", logout);
      }
      console.log("\u2705 Event listeners configurados correctamente");
      actualizarTiempoSesion();
      console.log("\u{1F512} Panel de admin inicializado correctamente");
    } catch (error) {
      console.error("Error en inicializaci\xF3n:", error);
      mostrarError("Error al inicializar el panel. Por favor recarga la p\xE1gina.");
    }
  }
  window.addEventListener("DOMContentLoaded", inicializar);
  window.addEventListener("beforeunload", () => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (sessionTimeInterval) clearInterval(sessionTimeInterval);
  });
  if (typeof qrcode === "undefined") {
    console.error("\u274C qrcode no est\xE1 cargado. Verifica el CDN.");
  }
})();
//# sourceMappingURL=admin-qr-generator.js.map
