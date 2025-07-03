document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const cuotaId = params.get("cuotaId");
  document.getElementById("cuotaId").value = cuotaId;

  const form = document.getElementById("formPago");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pagos = [];

    const efectivo = document.getElementById("efectivo");
    if (efectivo.checked) {
      pagos.push({
        metodoPago: "EFECTIVO",
        monto: parseFloat(document.getElementById("montoEfectivo").value),
        comprobanteUrl: "https://mi-cdn.com/efectivo.jpg"
      });
    }

    const yape = document.getElementById("yape");
    if (yape.checked) {
      const file = document.getElementById("comprobanteYape").files[0];
      const imageUrl = file ? await subirACloudinary(file) : "";
      pagos.push({
        metodoPago: "YAPE",
        monto: parseFloat(document.getElementById("montoYape").value),
        comprobanteUrl: imageUrl
      });
    }

    const mercado = document.getElementById("mercado");
    if (mercado.checked) {
      pagos.push({
        metodoPago: "MERCADO_PAGO",
        monto: parseFloat(document.getElementById("montoMercado").value),
        comprobanteUrl: "https://mi-cdn.com/mercado.jpg"
      });
    }

    fetch(`https://backpracticaagile.onrender.com/api/cuotas/${cuotaId}/pago-multiple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagos)
    })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        window.location.href = "index.html";
      })
      .catch(err => alert("Error en el pago"));
  });

  async function subirACloudinary(file) {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "preset-publico");
    const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
      method: "POST",
      body: data
    });
    const json = await res.json();
    return json.secure_url;
  }
});
