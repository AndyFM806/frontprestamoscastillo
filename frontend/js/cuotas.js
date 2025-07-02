const tablaBody = document.querySelector("#tablaCuotas tbody");
const modal = document.getElementById("modal");
const resumen = document.getElementById("comprobanteResumen");
const descargarBtn = document.getElementById("descargarBtn");

let idCuotaActual = null;

function obtenerCuotas() {
  const clienteId = document.getElementById("clienteId").value;
  fetch(`https://backpracticaagile.onrender.com/api/cuotas/cliente/${clienteId}`)
    .then(res => res.json())
    .then(data => mostrarCuotas(data));
}

function mostrarCuotas(cuotas) {
  tablaBody.innerHTML = "";
  const hoy = new Date();

  cuotas.forEach(cuota => {
    const tr = document.createElement("tr");
    const fechaPago = new Date(cuota.fechaPago);

    if (cuota.pagado) tr.classList.add("pagado");
    else if (fechaPago < hoy) tr.classList.add("atrasado");
    else if (fechaPago.toDateString() === hoy.toDateString()) tr.classList.add("hoy");
    else if (diasDiferencia(hoy, fechaPago) <= 7) tr.classList.add("porVencer");
    else tr.classList.add("pendiente");

    tr.innerHTML = `
      <td>${cuota.numero}</td>
      <td>${cuota.fechaPago}</td>
      <td>S/ ${cuota.monto}</td>
      <td>${cuota.pagado ? "Pagado" : "Pendiente"}</td>
      <td>
        ${cuota.pagado ? `<button disabled>Pagado</button>` : 
        `<button onclick="pagarCuota(${cuota.id})">Pagar</button>`}
      </td>
    `;

    tablaBody.appendChild(tr);
  });
}

function diasDiferencia(fecha1, fecha2) {
  const diff = fecha2 - fecha1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function pagarCuota(id) {
  const medioPago = prompt("Seleccione medio de pago: EFECTIVO, TRANSFERENCIA o TARJETA");
  if (!medioPago) return;

  fetch(`https://backpracticaagile.onrender.com/api/cuotas/${id}/pagar?medioPago=${medioPago}`, {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      idCuotaActual = id;
      resumen.innerText = JSON.stringify(data, null, 2);
      modal.classList.remove("hidden");
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
  modal.classList.add("hidden");
  idCuotaActual = null;
}
