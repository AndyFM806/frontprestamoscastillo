const API_URL = "https://backpracticaagile.onrender.com/api";
let clienteConsultado = null;

document.getElementById("tipo-doc").addEventListener("change", function () {
    const tipo = this.value;
    document.getElementById("dni-extra").style.display = tipo === "DNI" ? "block" : "none";
    document.getElementById("ruc-extra").style.display = tipo === "RUC" ? "block" : "none";

    // Limpiar campos al cambiar tipo
    document.getElementById("numero-doc").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("direccion").value = "";
});

document.getElementById("consultar-btn").addEventListener("click", async () => {
    const tipoDoc = document.getElementById("tipo-doc").value;
    const numero = document.getElementById("numero-doc").value.trim();

    if (!numero) return alert("Ingrese un número de documento.");

    const endpoint = `/clientes/buscar/${numero}`;

    try {
        const res = await fetch(API_URL + endpoint);
        if (!res.ok) throw new Error("No encontrado");

        const data = await res.json();
        clienteConsultado = data;

        document.getElementById("nombre").value = data.nombre || "";
        document.getElementById("direccion").value = data.direccion || "";

    } catch (err) {
        alert("Cliente no encontrado.\n" + err.message);
        clienteConsultado = null;
    }
});

// Registrar préstamo
document.getElementById("registrar-btn").addEventListener("click", async () => {
  if (!clienteConsultado) return alert("Debe consultar un cliente primero.");

  const monto = parseFloat(document.getElementById("monto").value);
  const cuotas = parseInt(document.getElementById("cuotas").value);

  if (isNaN(monto) || monto <= 0 || monto > 19000) {
    return alert("El monto debe ser mayor a 0 y no superar los S/ 19,000 (límite diario).");
  }

  if (isNaN(cuotas) || cuotas < 1 || cuotas > 36) {
    return alert("El número de cuotas debe estar entre 1 y 36.");
  }

  try {
    const respuesta = await fetch(`${API_URL}/prestamos/totales/${clienteConsultado.dniRuc}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el total mensual.");
    const totalMensual = parseFloat(await respuesta.text());
  
    if ((totalMensual + monto) > 76000) {
      return alert("Este préstamo excede el límite mensual de S/ 76,000 por cliente.");
    }
  } catch (e) {
    console.error("Error al validar límite mensual:", e);
    return alert("Error validando el monto mensual.");
  }
  
    const body = {
      dniRuc: clienteConsultado.dniRuc,
      monto,
      plazoMeses: cuotas
    };

    try {
      const res = await fetch(`${API_URL}/prestamos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert("Préstamo registrado con éxito.");
        location.reload();
      } else {
        const err = await res.text();
        alert("Error al registrar préstamo: " + err);
      }
    } catch (error) {
      alert("Ocurrió un error al registrar.");
      console.error(error);
    }
});
