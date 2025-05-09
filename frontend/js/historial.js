const API_URL = "https://backpracticaagile.onrender.com/api";

window.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tabla-historial");

  try {
    const res = await fetch(`${API_URL}/prestamos/historial`);
    if (!res.ok) throw new Error("No se pudo cargar el historial.");
    const prestamos = await res.json();

    if (!prestamos.length) {
      tabla.innerHTML = `<tr><td colspan="6">No hay préstamos registrados.</td></tr>`;
      return;
    }

    prestamos.forEach(prestamo => {
      const fila = document.createElement("tr");
    
      fila.innerHTML = `
        <td>${prestamo.id}</td>
        <td>${prestamo.dniRuc}</td>
        <td>${prestamo.nombre}</td>
        <td>${prestamo.fecha}</td>
        <td>S/ ${prestamo.monto}</td>
        <td>
          <button onclick="verCronograma(${prestamo.id})">📄 Ver</button>
        </td>
      `;
    
      tabla.appendChild(fila);
    });
    
  } catch (err) {
    console.error("❌ Error al cargar historial:", err.message || err);
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar historial.</td></tr>`;
  }
});

function verCronograma(prestamoId) {
  window.open(`${API_URL}/cronograma/descargar/${prestamoId}`, "_blank");
}

