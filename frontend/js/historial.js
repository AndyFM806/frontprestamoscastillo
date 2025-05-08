const backendUrl = 'https://backpracticaagile.onrender.com/api/prestamos/historial';
const tabla = document.getElementById('tabla-historial');

document.addEventListener('DOMContentLoaded', () => {
  fetch(backendUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener el historial de préstamos');
      }
      return response.json();
    })
    .then(data => {
      tabla.innerHTML = ''; // Limpiar tabla antes de rellenar
      data.forEach(prestamo => {
        const fila = document.createElement('tr');

        // Cliente puede tener DNI o RUC, mostrar el que corresponda
        const doc = prestamo.cliente.dni ? prestamo.cliente.dni : prestamo.cliente.ruc;
        const nombre = prestamo.cliente.nombre || '';
        const apellido = prestamo.cliente.apellido || '';
        const razonSocial = prestamo.cliente.razonSocial || '';
        const nombreCompleto = nombre && apellido ? `${nombre} ${apellido}` : razonSocial;

        fila.innerHTML = `
          <td>${prestamo.id}</td>
          <td>${doc}</td>
          <td>${nombreCompleto}</td>
          <td>${prestamo.fecha}</td>
          <td>S/ ${prestamo.monto.toFixed(2)}</td>
          <td><a href="${prestamo.cronograma.url}" target="_blank">📄 Ver PDF</a></td>
        `;

        tabla.appendChild(fila);
      });
    })
    .catch(error => {
      console.error('Error al cargar el historial:', error);
      tabla.innerHTML = `<tr><td colspan="6">No se pudo cargar el historial</td></tr>`;
    });
});
