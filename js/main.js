/** MenteMoneda · Smart Budget — main.js */

// 1) Navbar: agrega fondo sólido cuando el usuario baja en la página
function initNavbarScroll() {
  const navbar = document.getElementById("mmNavbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  });
}

// 1b) Menú móvil: al elegir una opción, el panel de la hamburguesa se cierra //
function initNavbarAutoClose() {
  const opciones = document.querySelectorAll(
    "#mmNavLinks a:not(.dropdown-toggle)",
  );

  opciones.forEach(function (opcion) {
    opcion.addEventListener("click", function () {
      window.jQuery("#mmNavLinks").collapse("hide");
    });
  });
}

// 2) Formularios de acceso ("Crear cuenta" e "Iniciar sesión"): valida y
//    muestra un mensaje de éxito simulado en ambos modales.
function initAuthForm(formId, successId, modalId) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  if (!form || !success) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    form.classList.add("d-none");
    success.classList.remove("d-none");
  });

  const modal = document.getElementById(modalId);
  modal.addEventListener("hidden.bs.modal", function () {
    form.reset();
    form.classList.remove("was-validated", "d-none");
    success.classList.add("d-none");
  });
}

// 3) Simulador "Agregar gasto": recalcula el saldo y agrega la fila
let saldoActual = 2500000;

function formatearCLP(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function agregarTransaccionALaLista(nombre, monto, esIngreso) {
  const lista = document.getElementById("mmTransactionList");
  const icono = esIngreso ? "bi-cash-coin" : "bi-bag";
  const signo = esIngreso ? "+" : "-";

  const fila = document.createElement("div");
  fila.className =
    "mm-row " + (esIngreso ? "mm-row--income" : "mm-row--expense");
  fila.innerHTML =
    '<div class="mm-row__left">' +
    '<span class="mm-avatar mm-avatar--sm mm-avatar--' +
    (esIngreso ? "income" : "expense") +
    '">' +
    '<i class="bi ' +
    icono +
    '"></i></span>' +
    "<div>" +
    '<p class="mm-row__name">' +
    nombre +
    "</p>" +
    '<p class="mm-row__date">Hoy</p>' +
    "</div>" +
    "</div>" +
    '<span class="mm-row__value mm-amount">' +
    signo +
    formatearCLP(monto) +
    "</span>";

  lista.insertBefore(fila, lista.firstChild);
}

function initExpenseForm() {
  const form = document.getElementById("mmGastoForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const nombre = document.getElementById("mmGastoNombre").value.trim();
    const monto = Number(document.getElementById("mmGastoMonto").value);
    const esIngreso = document.getElementById("mmGastoTipo").value === "income";

    saldoActual += esIngreso ? monto : -monto;
    document.getElementById("mmSaldoTotal").textContent =
      formatearCLP(saldoActual);
    agregarTransaccionALaLista(nombre, monto, esIngreso);

    form.reset();
    form.classList.remove("was-validated");
    window.jQuery("#modalAgregarGasto").modal("hide");
  });
}

// 4) Año del footer
function initFooterYear() {
  document.getElementById("mmYear").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", function () {
  initNavbarScroll();
  initNavbarAutoClose();
  initAuthForm("mmSignupForm", "mmSignupSuccess", "modalComenzar");
  initAuthForm("mmLoginForm", "mmLoginSuccess", "modalIniciarSesion");
  initExpenseForm();
  initFooterYear();
});
