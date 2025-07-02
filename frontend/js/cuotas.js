const tablaBody = document.querySelector("#tablaCuotas tbody");
const modal = document.getElementById("modal");
const resumen = document.getElementById("comprobanteResumen");
const descargarBtn = document.getElementById("descargarBtn");

let idCuotaActual = null;

document.addEventListener("DOMContentLoaded", () => {
  obtenerCuotas(); // ✅ Carga automática al abrir la página
});

function obtenerCuotas() {
  fetch("https://backpracticaagile.onrender.com/api/cuotas/pendientes")
    .then(res => res.json())
    .then(cuotas => mostrarCuotas(cuotas))
    .catch(err => {
      console.error("Error al obtener cuotas:", err);
      alert("No se pudieron cargar las cuotas.");
    });
}

function mostrarCuotas(cuotas) {
  tablaBody.innerHTML = "";
  const hoy = new Date();

  cuotas.forEach(cuota => {
    const tr = document.createElement("tr");
    const fechaPago = new Date(cuota.fechaPago);
    const pagado = cuota.pagado;

    // Estado visual
    if (pagado && esDelMes(fechaPago, hoy)) {
      tr.classList.add("pagado");
    } else if (!pagado && fechaPago < hoy) {
      tr.classList.add("atrasado");
    } else if (!pagado && mismaFecha(fechaPago, hoy)) {
      tr.classList.add("hoy");
    } else if (!pagado && diasDiferencia(hoy, fechaPago) <= 7) {
      tr.classList.add("porVencer");
    } else {
      tr.classList.add("pendiente");
    }

    tr.innerHTML = `
      <td>${cuota.numero}</td>
      <td>${cuota.fechaPago}</td>
      <td>S/ ${cuota.monto.toFixed(2)}</td>
      <td>${pagado ? "Pagado" : "Pendiente"}</td>
      <td>
        ${pagado 
          ? `<button disabled class="btn btn-disabled">Pagado</button>` 
          : `<button class="btn btn-pagar" onclick="pagarCuota(${cuota.id})">Pagar</button>`}
      </td>
    `;

    tablaBody.appendChild(tr);
  });
}

function diasDiferencia(fecha1, fecha2) {
  const diff = fecha2 - fecha1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function mismaFecha(f1, f2) {
  return f1.toISOString().slice(0, 10) === f2.toISOString().slice(0, 10);
}

function esDelMes(fecha, ref) {
  return fecha.getMonth() === ref.getMonth() && fecha.getFullYear() === ref.getFullYear();
}

function pagarCuota(id) {
  const medioPago = prompt("Seleccione medio de pago: EFECTIVO, TRANSFERENCIA o TARJETA").toUpperCase();
  if (!["EFECTIVO", "TRANSFERENCIA", "TARJETA"].includes(medioPago)) {
    alert("Medio de pago inválido.");
    return;
  }

  fetch(`https://backpracticaagile.onrender.com/api/cuotas/${id}/pagar?medioPago=${medioPago}`, {
    method: 'PUT'
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al pagar");
      return res.json();
    })
    .then(data => {
      idCuotaActual = id;
      resumen.innerText = `
Empresa: ${data.nombreEmpresa}
RUC: ${data.rucEmpresa}
Dirección: ${data.direccionEmpresa}
Teléfono: ${data.telefonoEmpresa}
Email: ${data.emailEmpresa}

Cliente: ${data.nombreCliente}
DNI/RUC: ${data.dniCliente}
Fecha de Pago: ${data.fechaPago}
Monto Pagado: S/ ${parseFloat(data.montoPagado).toFixed(2)}
Medio de Pago: ${data.medioPago}
Comprobante N°: ${data.numeroComprobante}
      `.trim();
      modal.classList.add("show");

    })
    .catch(err => {
      console.error("Error:", err);
      alert("No se pudo procesar el pago.");
    });
}

descargarBtn.addEventListener("click", () => {
  if (idCuotaActual) {
    window.open(`https://backpracticaagile.onrender.com/api/comprobantes/${idCuotaActual}/descargar`, "_blank");
    cerrarModal();
    obtenerCuotas();
  }
});

function cerrarModal() {
  modal.classList.remove("show");

  resumen.innerText = "";
  idCuotaActual = null;
}
