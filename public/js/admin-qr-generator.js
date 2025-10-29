"use strict";
(() => {
  let currentAccessToken = null;
  let currentQrUrl = null;
  let expirationMinutes = 15;
  let countdownInterval = null;
  let qrGeneratedCount = 0;
  let sessionStartTime = Date.now();
  let sessionTimeInterval = null;
  let agencias = [];
  let agenciaEditando = null;
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
      currentQrUrl = qrUrl;
      console.log("\u{1F4F1} Generando QR para agencia", agenciaId, "- URL:", qrUrl);
      const qr = qrcode(0, "M");
      qr.addData(qrUrl);
      qr.make();
      if (!qrCanvas) {
        throw new Error("Canvas no encontrado");
      }
      const cellSize = 3;
      const margin = 3;
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
      mostrarUrlGenerada(qrUrl);
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
  function mostrarUrlGenerada(url) {
    let urlDisplay = document.getElementById("qrUrlDisplay");
    if (!urlDisplay) {
      const qrInfo = document.querySelector(".qr-info");
      if (!qrInfo) return;
      urlDisplay = document.createElement("div");
      urlDisplay.id = "qrUrlDisplay";
      urlDisplay.style.cssText = `
      margin-top: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 8px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #0369a1;
      max-width: 100%;
      overflow-x: auto;
    `;
      qrInfo.parentNode?.insertBefore(urlDisplay, qrInfo.nextSibling);
    }
    urlDisplay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <strong style="color: #0369a1; font-size: 12px;">\u{1F517} URL del QR:</strong>
      <button id="btnCopyUrl" style="
        padding: 4px 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        \u{1F4CB} Copiar URL
      </button>
    </div>
    <div style="
      background: white;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #e0f2fe;
      font-size: 11px;
      line-height: 1.4;
    ">${url}</div>
  `;
    const btnCopy = document.getElementById("btnCopyUrl");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => copiarUrl(url));
    }
  }
  function copiarUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      const btnCopy = document.getElementById("btnCopyUrl");
      if (btnCopy) {
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = "\u2705 Copiado!";
        btnCopy.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
        setTimeout(() => {
          btnCopy.innerHTML = originalText;
          btnCopy.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
        }, 2e3);
      }
    }).catch((err) => {
      console.error("Error al copiar URL:", err);
      mostrarError("No se pudo copiar la URL al portapapeles");
    });
  }
  function abrirModalNuevaAgencia() {
    agenciaEditando = null;
    const modal = document.getElementById("modalAgencia");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("formAgencia");
    if (modalTitle) modalTitle.textContent = "Nueva Agencia";
    if (form) form.reset();
    mostrarErrorModal("");
    if (modal) {
      modal.style.display = "flex";
    }
  }
  function abrirModalEditarAgencia() {
    const selectAgencia = document.getElementById("selectAgencia");
    if (!selectAgencia || !selectAgencia.value) {
      mostrarError("Por favor selecciona una agencia primero");
      return;
    }
    const agenciaId = parseInt(selectAgencia.value);
    const agencia = agencias.find((ag) => ag.id === agenciaId);
    if (!agencia) {
      mostrarError("Agencia no encontrada");
      return;
    }
    agenciaEditando = agencia;
    const modal = document.getElementById("modalAgencia");
    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = "Editar Agencia";
    const inputNombre = document.getElementById("inputNombre");
    const inputCodigo = document.getElementById("inputCodigo");
    const inputDireccion = document.getElementById("inputDireccion");
    const inputTelefono = document.getElementById("inputTelefono");
    const inputEmail = document.getElementById("inputEmail");
    if (inputNombre) inputNombre.value = agencia.nombre;
    if (inputCodigo) inputCodigo.value = agencia.codigo;
    if (inputDireccion) inputDireccion.value = agencia.direccion || "";
    if (inputTelefono) inputTelefono.value = agencia.telefono || "";
    if (inputEmail) inputEmail.value = agencia.email || "";
    mostrarErrorModal("");
    if (modal) {
      modal.style.display = "flex";
    }
  }
  function cerrarModalAgencia() {
    const modal = document.getElementById("modalAgencia");
    if (modal) {
      modal.style.display = "none";
    }
    agenciaEditando = null;
  }
  async function guardarAgencia(event) {
    event.preventDefault();
    const inputNombre = document.getElementById("inputNombre");
    const inputCodigo = document.getElementById("inputCodigo");
    const inputDireccion = document.getElementById("inputDireccion");
    const inputTelefono = document.getElementById("inputTelefono");
    const inputEmail = document.getElementById("inputEmail");
    const datos = {
      nombre: inputNombre?.value.trim(),
      codigo: inputCodigo?.value.trim().toUpperCase(),
      direccion: inputDireccion?.value.trim() || "",
      telefono: inputTelefono?.value.trim() || "",
      email: inputEmail?.value.trim() || ""
    };
    if (!datos.nombre || !datos.codigo) {
      mostrarErrorModal("Nombre y c\xF3digo son campos requeridos");
      return;
    }
    try {
      let url = "/api/turnos/agencias";
      let method = "POST";
      if (agenciaEditando) {
        url = `/api/turnos/agencias/${agenciaEditando.id}`;
        method = "PUT";
      }
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });
      const result = await response.json();
      if (!result.success) {
        mostrarErrorModal(result.message || "Error al guardar la agencia");
        return;
      }
      console.log("\u2705 Agencia guardada exitosamente");
      cerrarModalAgencia();
      await cargarAgencias();
      mostrarError("");
      const successMsg = agenciaEditando ? "Agencia actualizada exitosamente" : "Agencia creada exitosamente";
      const originalError = errorMessage?.textContent || "";
      if (errorMessage) {
        errorMessage.textContent = `\u2705 ${successMsg}`;
        errorMessage.style.display = "block";
        errorMessage.style.background = "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)";
        errorMessage.style.borderColor = "#22c55e";
        errorMessage.style.color = "#166534";
        setTimeout(() => {
          errorMessage.style.display = "none";
          errorMessage.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
          errorMessage.style.borderColor = "#f87171";
          errorMessage.style.color = "#991b1b";
          errorMessage.textContent = originalError;
        }, 3e3);
      }
    } catch (error) {
      console.error("Error guardando agencia:", error);
      mostrarErrorModal("Error al guardar la agencia. Por favor intenta nuevamente.");
    }
  }
  function mostrarErrorModal(mensaje) {
    const modalError = document.getElementById("modalError");
    if (!modalError) return;
    if (mensaje) {
      modalError.textContent = mensaje;
      modalError.style.display = "block";
    } else {
      modalError.style.display = "none";
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
  window.abrirModalNuevaAgencia = abrirModalNuevaAgencia;
  window.abrirModalEditarAgencia = abrirModalEditarAgencia;
  window.cerrarModalAgencia = cerrarModalAgencia;
  window.guardarAgencia = guardarAgencia;
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
      const btnNuevaAgencia = document.getElementById("btnNuevaAgencia");
      const btnEditarAgencia = document.getElementById("btnEditarAgencia");
      const btnCancelarModal = document.getElementById("btnCancelarModal");
      const formAgencia = document.getElementById("formAgencia");
      if (btnGenerarQR) {
        btnGenerarQR.addEventListener("click", () => generarNuevoQR());
      }
      if (btnDescargarQR) {
        btnDescargarQR.addEventListener("click", descargarQR);
      }
      if (btnLogout) {
        btnLogout.addEventListener("click", logout);
      }
      if (btnNuevaAgencia) {
        btnNuevaAgencia.addEventListener("click", abrirModalNuevaAgencia);
      }
      if (btnEditarAgencia) {
        btnEditarAgencia.addEventListener("click", abrirModalEditarAgencia);
      }
      if (btnCancelarModal) {
        btnCancelarModal.addEventListener("click", cerrarModalAgencia);
      }
      if (formAgencia) {
        formAgencia.addEventListener("submit", guardarAgencia);
      }
      const modal = document.getElementById("modalAgencia");
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            cerrarModalAgencia();
          }
        });
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
