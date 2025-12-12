// Obtener token
const token = sessionStorage.getItem("token");
const API_BASE_URL = "http://localhost:8080/api"; // Ajusta según tu configuración

document.getElementById("generar-btn").addEventListener("click", generarCuadreCaja);

// Configurar año actual por defecto
window.addEventListener("DOMContentLoaded", () => {
  const anioInput = document.getElementById("anio");
  const mesInput = document.getElementById("mes");
  
  const hoy = new Date();
  anioInput.value = hoy.getFullYear();
  mesInput.value = hoy.getMonth() + 1;
});

async function generarCuadreCaja() {
  const anio = document.getElementById("anio").value;
  const mes = document.getElementById("mes").value;

  // Validar que los campos estén completos
  if (!anio || !mes) {
    mostrarMensaje("Por favor completa todos los campos", "error");
    return;
  }

  // Validar que el año sea válido
  if (isNaN(anio) || anio < 2020 || anio > 2100) {
    mostrarMensaje("Año inválido", "error");
    return;
  }

  // Validar que el mes sea válido
  if (isNaN(mes) || mes < 1 || mes > 12) {
    mostrarMensaje("Mes inválido", "error");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/cuadre-caja/excel?anio=${anio}&mes=${mes}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      // Descargar el archivo Excel
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cuadre_caja_${anio}_${mes}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      mostrarMensaje("Cuadre de caja generado exitosamente", "success");
    } else {
      const errorData = await response.json().catch(() => ({}));
      mostrarMensaje(errorData.message || "Error al generar el cuadre de caja", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarMensaje("Error de conexión al generar el cuadre de caja", "error");
  }
}

function mostrarMensaje(mensaje, tipo) {
  // Eliminar mensaje anterior si existe
  const mensajeAnterior = document.querySelector(".message");
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }

  // Crear nuevo mensaje
  const div = document.createElement("div");
  div.className = `message ${tipo}`;
  div.textContent = mensaje;

  // Insertar después del formulario
  const formSection = document.querySelector(".form-section");
  formSection.parentNode.insertBefore(div, formSection.nextSibling);

  // Eliminar mensaje después de 5 segundos
  setTimeout(() => {
    div.remove();
  }, 5000);
}
