const urlBase = "https://backpracticaagile.onrender.com/api";

const cuotaId = new URLSearchParams(window.location.search).get("cuotaId");
document.getElementById("cuotaId").value = cuotaId;

const lblMontoTotal = document.getElementById("lblMontoTotal");
const lblRestante = document.getElementById("lblRestante");
const listaPagos = document.getElementById("lista-pagos");

function cargarInfoCuota() {
  Promise.all([
    fetch(`${urlBase}/cuotas/detalle/${cuotaId}`).then(r => r.json()),
    fetch(`${urlBase}/cuotas/${cuotaId}/restante`).then(r => r.json()),
    fetch(`${urlBase}/pagos/cuota/${cuotaId}`).then(r => r.json())
  ])
  .then(([cuota, restante, pagos]) => {
    document.getElementById("lblNumeroCuota").textContent = cuota.numero;
    lblMontoTotal.textContent = cuota.montoFinal.toFixed(2);
    lblRestante.textContent = parseFloat(restante).toFixed(2);

    listaPagos.innerHTML = "";

    pagos.forEach(pago => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.padding = "4px 0";

      const span = document.createElement("span");
      span.textContent = `${pago.metodoPago}: S/ ${pago.monto.toFixed(2)}`;

      const btn = document.createElement("button");
      btn.className = "btn-eliminar btn-eliminar-clear";
      btn.setAttribute("data-id", pago.id);
      btn.textContent = "❌";
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.color = "red";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "1.2em";
      btn.style.marginLeft = "10px";

      li.appendChild(span);
      li.appendChild(btn);
      listaPagos.appendChild(li);
    });

    // Agrega eventos a los botones eliminar (❌)
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => {
        const pagoId = btn.getAttribute("data-id");
        if (confirm("¿Estás seguro de eliminar este pago?")) {
          fetch(`${urlBase}/pagos/parcial/${pagoId}`, {
            method: "DELETE"
          })
          .then(() => {
            alert("✅ Pago eliminado correctamente.");
            cargarInfoCuota(); // Refresca todo
          })
          .catch(err => {
            alert("❌ Error al eliminar el pago.");
            console.error(err);
          });
        }
      });
    });

    // Habilitar o deshabilitar botón finalizar
    document.getElementById("btnFinalizar").disabled = parseFloat(restante) > 0;
  })
  .catch(err => {
    alert("Error al cargar la información de la cuota.");
    console.error(err);
  });
}


document.getElementById("form-pago").addEventListener("submit", e => {
  e.preventDefault();

  const metodo = document.getElementById("metodo").value;
  const monto = document.getElementById("monto").value;
  const file = document.getElementById("comprobante").files[0];

  const formData = new FormData();
  formData.append("cuotaId", cuotaId);
  formData.append("metodo", metodo);
  formData.append("monto", monto);
  if (file) formData.append("file", file);

  fetch(`${urlBase}/pagos/parcial`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(() => {
    alert("✅ Pago registrado.");
    cargarInfoCuota();
    document.getElementById("form-pago").reset();
  })
  .catch(err => {
    alert("Error al registrar el pago.");
    console.error(err);
  });
});

document.getElementById("btnMercadoPago").addEventListener("click", () => {
  fetch(`${urlBase}/pagos/mp/link?cuotaId=${cuotaId}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.link) {
        window.open(data.link, "_blank");
      } else {
        alert("No se pudo generar el link.");
      }
    })
    .catch(err => {
      alert("Error al generar el link de Mercado Pago.");
      console.error(err);
    });
});

document.getElementById("btnFinalizar").addEventListener("click", () => {
  fetch(`${urlBase}/cuotas/${cuotaId}/cerrar`, { method: "POST" })
    .then(() => {
      alert("🎉 Comprobante generado. Cuota cerrada.");

      // Ahora descargar el comprobante PDF
      fetch(`${urlBase}/cuotas/comprobantes/cuota/${cuotaId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("No se pudo descargar el comprobante.");
          }
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `comprobante_cuota_${cuotaId}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(err => {
          alert("Error al descargar el comprobante.");
          console.error(err);
        });

      // Recargar información
      cargarInfoCuota();
    })
    .catch(err => {
      alert("Error al cerrar la cuota.");
      console.error(err);
    });
});


window.onload = cargarInfoCuota;
