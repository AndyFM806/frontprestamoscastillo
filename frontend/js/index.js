document.addEventListener("DOMContentLoaded", function () {
  const tabla = document.getElementById("tablaCuotas");
  const filtro = document.getElementById("filtroFecha");
  const apiUrl = "https://backpracticaagile.onrender.com/api/cuotas/pendientes";

  filtro.addEventListener("change", cargarCuotas);
  cargarCuotas();

  function cargarCuotas() {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => pintarCuotas(data))
      .catch(err => console.error("Error al cargar cuotas:", err));
  }

  function pintarCuotas(cuotas) {
    const hoy = new Date();
    const tablaHTML = [
      "<table><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr>"
    ];

    const filtro = document.getElementById("filtroFecha").value;
    cuotas.forEach((cuota, i) => {
      const fechaPago = new Date(cuota.fechaPago);
      const dias = Math.floor((fechaPago - hoy) / (1000 * 60 * 60 * 24));
      let clase = "", estado = "";

      if (cuota.pagado) {
        clase = "pagado";
        estado = "Pagado";
      } else if (fechaPago.toDateString() === hoy.toDateString()) {
        clase = "hoy";
        estado = "Vence Hoy";
      } else if (dias < 0 && fechaPago.getMonth() === hoy.getMonth()) {
        clase = "atrasada";
        estado = "Atrasada";
      } else if (dias >= 0 && dias <= 7) {
        clase = "semana";
        estado = "Vence esta semana";
      } else {
        estado = "Pendiente";
      }

      if (filtro === "hoy" && clase !== "hoy") return;
      if (filtro === "semana" && clase !== "semana") return;
      if (filtro === "mes" && fechaPago.getMonth() !== hoy.getMonth()) return;
      if (filtro === "anio" && fechaPago.getFullYear() !== hoy.getFullYear()) return;

      tablaHTML.push(
        `<tr class="${clase}">
          <td>${i + 1}</td>
          <td>${cuota.prestamo.cliente.nombre}</td>
          <td>${cuota.fechaPago}</td>
          <td>S/ ${cuota.monto}</td>
          <td>${estado}</td>
          <td>${cuota.pagado ? "-" : `<button onclick="pagar(${cuota.id})">Pagar</button>`}</td>
        </tr>`
      );
    });

    tablaHTML.push("</table>");
    tabla.innerHTML = tablaHTML.join("");
  }
});

function pagar(id) {
  window.location.href = "pago.html?cuotaId=" + id;
}
