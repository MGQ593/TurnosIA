"use strict";
(() => {
  let currentURL = "";
  const qrContainer = document.getElementById("qr-container");
  const qrCanvas = document.getElementById("qr-canvas");
  const urlDisplay = document.getElementById("url-display");
  async function generarQR() {
    try {
      const response = await fetch("/api/token/generar-acceso");
      const data = await response.json();
      if (!data.success || !data.data) {
        alert("Error generando token de acceso");
        return;
      }
      const baseURL = window.location.origin;
      currentURL = `${baseURL}${data.data.url}`;
      if (urlDisplay) {
        urlDisplay.textContent = currentURL;
      }
      if (qrCanvas && typeof QRious !== "undefined") {
        const qr = new QRious({
          element: qrCanvas,
          value: currentURL,
          size: 300,
          level: "H",
          background: "white",
          foreground: "#2d3748"
        });
        console.log("\u2705 QR generado:", currentURL);
      } else {
        console.error("\u274C Canvas o QRious no disponible");
      }
      if (qrContainer) {
        qrContainer.classList.add("show");
      }
    } catch (error) {
      console.error("Error generando QR:", error);
      alert("Error generando QR. Verifica que el servidor est\xE9 corriendo.");
    }
  }
  function descargarQR() {
    if (!qrCanvas) {
      console.error("Canvas no encontrado");
      return;
    }
    try {
      const link = document.createElement("a");
      link.download = `qr-turno-${Date.now()}.png`;
      link.href = qrCanvas.toDataURL("image/png");
      link.click();
      console.log("\u{1F4BE} QR descargado");
    } catch (error) {
      console.error("Error descargando QR:", error);
      alert("\u274C Error al descargar el QR");
    }
  }
  async function copiarURL() {
    if (!currentURL) {
      alert("\u274C No hay URL para copiar");
      return;
    }
    try {
      await navigator.clipboard.writeText(currentURL);
      alert("\u2705 URL copiada al portapapeles");
      console.log("\u{1F4CB} URL copiada:", currentURL);
    } catch (error) {
      console.error("Error copiando URL:", error);
      alert("\u274C Error copiando URL");
    }
  }
  window.generarQR = generarQR;
  window.descargarQR = descargarQR;
  window.copiarURL = copiarURL;
  window.addEventListener("load", () => {
    console.log("\u{1F510} Generador de QR inicializado");
    generarQR();
  });
  if (typeof QRious === "undefined") {
    console.error("\u274C QRious no est\xE1 cargado. Verifica el CDN.");
  }
})();
//# sourceMappingURL=generar-qr.js.map
