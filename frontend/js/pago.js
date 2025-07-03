// Obtener el ID de la cuota desde la URL
const cuotaId = new URLSearchParams(window.location.search).get('cuotaId');
let restante = 0;

// Elementos del DOM
const lblMontoTotal = document.getElementById('montoTotal');
const lblRestante = document.getElementById('restante');
const efectivoCheck = document.getElementById('efectivoCheck');
const efectivoMonto = document.getElementById('efectivoMonto');
const efectivoBtn = document.getElementById('efectivoBtn');
const yapeCheck = document.getElementById('yapeCheck');
const yapeMonto = document.getElementById('yapeMonto');
const yapeFile = document.getElementById('yapeFile');
const yapeBtn = document.getElementById('yapeBtn');
const mercadoPagoBtn = document.getElementById('mercadoPagoBtn');

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    fetch(`https://backpracticaagile.onrender.com/api/cuotas/detalle/${cuotaId}`)
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener detalle de la cuota");
        return response.json();
      }),
    fetch(`https://backpracticaagile.onrender.com/api/cuotas/${cuotaId}/restante`)
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener el restante de la cuota");
        return response.text(); // porque puede venir solo un número
      })
  ])
  .then(([cuota, restanteTexto]) => {
    if (!cuota || typeof cuota.monto !== "number") {
      console.error("❌ Datos de cuota inválidos:", cuota);
      return alert("No se pudo cargar la información de la cuota.");
    }

    const total = cuota.monto;
    restante = parseFloat(restanteTexto);

    if (isNaN(restante)) {
      console.error("❌ El restante recibido no es un número válido:", restanteTexto);
      return alert("Error al procesar el restante de la cuota.");
    }

    lblMontoTotal.textContent = total.toFixed(2);
    lblRestante.textContent = restante.toFixed(2);
  })
  .catch(error => {
    console.error("⚠️ Error al obtener datos:", error);
    alert("Error al cargar los datos de la cuota.");
  });
});

// Habilitar/deshabilitar campos según checkboxes
efectivoCheck.addEventListener('change', () => {
  const enabled = efectivoCheck.checked;
  efectivoMonto.disabled = !enabled;
  efectivoBtn.disabled = !enabled;
});

yapeCheck.addEventListener('change', () => {
  const enabled = yapeCheck.checked;
  yapeMonto.disabled = !enabled;
  yapeFile.disabled = !enabled;
  yapeBtn.disabled = !enabled;
});

// Función para actualizar el restante
function restar(monto) {
  restante -= monto;
  if (restante < 0) restante = 0;
  lblRestante.textContent = restante.toFixed(2);
}

// Registrar pago en efectivo
efectivoBtn.addEventListener('click', () => {
  const monto = parseFloat(efectivoMonto.value);
  if (!monto || monto <= 0 || monto > restante) {
    return alert('Monto inválido para efectivo.');
  }

  const form = new FormData();
  form.append('cuotaId', cuotaId);
  form.append('metodo', 'EFECTIVO');
  form.append('monto', monto);

  fetch('https://backpracticaagile.onrender.com/api/pagos/parcial', {
    method: 'POST',
    body: form
  })
    .then(r => r.ok ? r.json() : Promise.reject('Error en pago efectivo'))
    .then(() => {
      alert('Pago en efectivo registrado');
      restar(monto);
      efectivoMonto.value = '';
    })
    .catch(err => {
      console.error(err);
      alert('Ocurrió un error al registrar el pago en efectivo');
    });
});

// Registrar pago con Yape
yapeBtn.addEventListener('click', () => {
  const monto = parseFloat(yapeMonto.value);
  const file = yapeFile.files[0];

  if (!monto || monto <= 0 || monto > restante) {
    return alert('Monto inválido para Yape.');
  }

  if (!file) {
    return alert('Debe adjuntar el comprobante de Yape.');
  }

  const form = new FormData();
  form.append('cuotaId', cuotaId);
  form.append('metodo', 'YAPE');
  form.append('monto', monto);
  form.append('comprobante', file);

  fetch('https://backpracticaagile.onrender.com/api/pagos/parcial', {
    method: 'POST',
    body: form
  })
    .then(r => r.ok ? r.json() : Promise.reject('Error en pago Yape'))
    .then(() => {
      alert('Pago con Yape registrado');
      restar(monto);
      yapeMonto.value = '';
      yapeFile.value = '';
    })
    .catch(err => {
      console.error(err);
      alert('Ocurrió un error al registrar el pago con Yape');
    });
});

// Generar link de MercadoPago
mercadoPagoBtn.addEventListener('click', () => {
  if (restante <= 0) {
    return alert('No hay saldo pendiente para pagar.');
  }

  fetch(`https://backpracticaagile.onrender.com/api/pagos/mercadopago/crear-link?cuotaId=${cuotaId}`, {
    method: 'POST'
  })
    .then(r => r.ok ? r.json() : Promise.reject('Error al crear link de MercadoPago'))
    .then(data => {
      if (data.link) {
        window.open(data.link, '_blank');
      } else {
        alert('No se pudo generar el link de MercadoPago.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error al generar el link de pago');
    });
});
