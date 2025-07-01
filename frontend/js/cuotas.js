async function cargarCuotas() {
  const response = await fetch('http://localhost:8080/api/cuotas/pendientes');
  const cuotas = await response.json();

  const tbody = document.getElementById('tbody-cuotas');
  const tabla = document.getElementById('tabla-cuotas');
  const mensaje = document.getElementById('mensaje-vacio');

  tbody.innerHTML = '';
  mensaje.textContent = '';

  if (cuotas.length === 0) {
    tabla.style.display = 'none';
    mensaje.textContent = 'No hay cuotas pendientes.';
    return;
  }

  tabla.style.display = 'table';

  cuotas.forEach((cuota, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>S/. ${parseFloat(cuota.monto).toFixed(2)}</td>
      <td>${cuota.fechaPago || cuota.fecha_pago}</td>
      <td>${cuota.comprobante || '-'}</td>
      <td>${cuota.medioPago || cuota.medio_pago || '-'}</td>
    `;
    tbody.appendChild(fila);
  });
}
