document.getElementById("cargarCuotas").addEventListener("click", async () => {
  try {
    const response = await fetch("https://backpracticaagile.onrender.com/api/cuotas/pendientes");
    const text = await response.text();

    // Imprimimos la respuesta cruda
    console.log("Texto recibido del backend:", text);

    // Intentamos convertir a JSON
    const cuotas = JSON.parse(text);

    // Limpiamos el contenedor
    const contenedor = document.getElementById("contenedorCuotas");
    contenedor.innerHTML = "";

    if (cuotas.length === 0) {
      contenedor.innerHTML = "<p>No hay cuotas pendientes.</p>";
      return;
    }

    // Creamos tabla
    const tabla = document.createElement("table");
    tabla.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Préstamo ID</th>
        <th>Fecha de Pago</th>
        <th>Monto</th>
        <th>Pagado</th>
      </tr>
    `;

    cuotas.forEach(cuota => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cuota.id}</td>
        <td>${cuota.prestamo_id}</td>
        <td>${cuota.fecha_pago}</td>
        <td>${cuota.monto}</td>
        <td>${cuota.pagado}</td>
      `;
      tabla.appendChild(fila);
    });

    contenedor.appendChild(tabla);

  } catch (error) {
    console.error("Error al procesar la respuesta:", error);
  }
});
