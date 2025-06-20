// === ELEMENTOS GLOBALES ===
const btnNuevo = document.getElementById('btnNuevo');
const btnCerrarFormulario = document.getElementById('btnCerrarFormulario');
const formulario = document.getElementById('formulario');
const overlayRegistro = document.getElementById('overlayRegistro');

const registroForm = document.getElementById('registroForm');
const registroBody = document.getElementById('registroBody');

const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');

const marcasDiv = document.getElementById('marcas');
const modelosDiv = document.getElementById('modelos');
const coloresDiv = document.getElementById('colores');
const preciosDiv = document.getElementById('precios');
const lavadoresDiv = document.getElementById('lavadores');

const inputMarca = document.getElementById('inputMarca');
const inputModelo = document.getElementById('inputModelo');
const inputColor = document.getElementById('inputColor');
const inputPrecio = document.getElementById('inputPrecio');
const inputLavador = document.getElementById('inputLavador');
const inputPlaca = document.getElementById('inputPlaca');
const filtroPlaca = document.getElementById('filtroPlaca');
const filtroFechaInicio = document.getElementById('filtroFechaInicio');
const filtroFechaFin = document.getElementById('filtroFechaFin');
const filtroLavador = document.getElementById('filtroLavador');
const filtroMarca = document.getElementById('filtroMarca');
const filtroModelo = document.getElementById('filtroModelo');
const filtroColor = document.getElementById('filtroColor');
const filtroPrecioMin = document.getElementById('filtroPrecioMin');
const filtroPrecioMax = document.getElementById('filtroPrecioMax');
const resultadoFiltros = document.getElementById('resultadoFiltros');
const btnToggleFiltros = document.getElementById('btnToggleFiltros');
const btnCerrarFiltros = document.getElementById('btnCerrarFiltros');
const panelFiltros = document.getElementById('panelFiltros');
const overlay = document.getElementById('overlay');

// === BASES Y LOCALSTORAGE ===
let basePlacas = [];
let registrosGuardados = JSON.parse(localStorage.getItem('registros')) || [];
let filaEditando = null;

let opciones = JSON.parse(localStorage.getItem('opciones')) || {
  Mazda: ['CX-30', 'CX-5', 'Mazda 3'],
  Toyota: ['Corolla', 'Hilux', 'Yaris'],
  Nissan: ['Sentra', 'Versa', 'NP300'],
};
let coloresBase = JSON.parse(localStorage.getItem('coloresBase')) || ['Blanco', 'Negro', 'Rojo'];
let preciosBase = JSON.parse(localStorage.getItem('preciosBase')) || ['100', '120', '200'];
let lavadoresBase = JSON.parse(localStorage.getItem('lavadoresBase')) || ['Luis', 'Ana', 'Pedro'];

// === UTILIDADES ===
const abrirFormulario = () => {
  formulario.classList.add('activo');
  overlayRegistro.classList.add('activo');
  btnNuevo.textContent = '✕ Cerrar';
};
const cerrarFormulario = () => {
  formulario.classList.remove('activo');
  overlayRegistro.classList.remove('activo');
  btnNuevo.textContent = '+ Registro';
  registroForm.reset();
  filaEditando = null;
};
const activarBoton = (contenedor, valor) => {
  [...contenedor.children].forEach(b => b.classList.toggle('activo', b.textContent === valor || b.textContent === `$${valor}`));
};
const guardarLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const parseFecha = (texto) => {
  const partes = texto.split('/');
  return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
};

// === GUARDAR Y EDITAR REGISTROS ===
registroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nuevoRegistro = {
    placa: inputPlaca.value.trim().toUpperCase(),
    marca: inputMarca.value,
    modelo: inputModelo.value,
    color: inputColor.value,
    precio: inputPrecio.value,
    lavador: inputLavador.value,
    fechaHora: new Date().toISOString(),
  };

  if (filaEditando !== null) {
    registrosGuardados[filaEditando] = nuevoRegistro;
    filaEditando = null;
  } else {
    registrosGuardados.push(nuevoRegistro);
  }

  guardarLocal('registros', registrosGuardados);
  mostrarRegistros(registrosGuardados);
  cerrarFormulario();
});

// === RENDERIZAR OPCIONES COMO BOTONES ===
const renderBotones = (arr, contenedor, inputHidden, prefijo = '') => {
  contenedor.innerHTML = '';
  arr.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = prefijo + item;
    btn.className = 'btn-opcion';
    btn.addEventListener('click', () => {
      inputHidden.value = item;
      activarBoton(contenedor, btn.textContent);
    });
    contenedor.appendChild(btn);
  });
};

renderBotones(Object.keys(opciones), marcasDiv, inputMarca);
renderBotones(coloresBase, coloresDiv, inputColor);
renderBotones(preciosBase, preciosDiv, inputPrecio, '$');
renderBotones(lavadoresBase, lavadoresDiv, inputLavador);

inputMarca.addEventListener('change', () => {
  const modelos = opciones[inputMarca.value] || [];
  renderBotones(modelos, modelosDiv, inputModelo);
});

marcasDiv.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const marca = e.target.textContent;
    inputMarca.value = marca;
    activarBoton(marcasDiv, marca);
    renderBotones(opciones[marca] || [], modelosDiv, inputModelo);
  }
});

// === CARGAR JSON DE PLACAS ===
fetch('placas.json')
  .then(res => res.json())
  .then(data => (basePlacas = data))
  .catch(err => console.error('Error cargando placas:', err));

// === MOSTRAR REGISTROS EN LA TABLA ===
const mostrarRegistros = (datos) => {
  registroBody.innerHTML = '';
  datos.forEach((r, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${r.placa}</td>
      <td>${r.marca}</td>
      <td>${r.modelo}</td>
      <td>${r.color}</td>
      <td>$${r.precio}</td>
      <td>${r.lavador}</td>
      <td>${new Date(r.fechaHora).toLocaleString()}</td>
      <td><button class="btn-editar">Editar</button><button class="btn-eliminar">Eliminar</button></td>
    `;
    fila.dataset.index = index;
    registroBody.appendChild(fila);
  });
};

registroBody.addEventListener('click', e => {
  const fila = e.target.closest('tr');
  const index = fila.dataset.index;
  const registro = registrosGuardados[index];

  if (e.target.classList.contains('btn-editar')) {
    inputPlaca.value = registro.placa;
    inputMarca.value = registro.marca;
    inputModelo.value = registro.modelo;
    inputColor.value = registro.color;
    inputPrecio.value = registro.precio;
    inputLavador.value = registro.lavador;
    activarBoton(marcasDiv, registro.marca);
    renderBotones(opciones[registro.marca], modelosDiv, inputModelo);
    activarBoton(modelosDiv, registro.modelo);
    activarBoton(coloresDiv, registro.color);
    activarBoton(preciosDiv, `$${registro.precio}`);
    activarBoton(lavadoresDiv, registro.lavador);
    filaEditando = index;
    abrirFormulario();
  }

  if (e.target.classList.contains('btn-eliminar')) {
    if (confirm('¿Eliminar este registro?')) {
      registrosGuardados.splice(index, 1);
      guardarLocal('registros', registrosGuardados);
      mostrarRegistros(registrosGuardados);
    }
  }
});

// === APLICAR FILTROS ===
btnAplicarFiltros.addEventListener('click', () => {
  let registros = JSON.parse(localStorage.getItem('registros')) || [];

  const placa = filtroPlaca.value.trim().toLowerCase();
  const desde = filtroFechaInicio.value ? new Date(filtroFechaInicio.value + 'T00:00:00') : null;
  const hasta = filtroFechaFin.value ? new Date(filtroFechaFin.value + 'T23:59:59') : null;
  const lavador = filtroLavador.value.trim().toLowerCase();
  const marca = filtroMarca.value.trim().toLowerCase();
  const modelo = filtroModelo.value.trim().toLowerCase();
  const color = filtroColor.value.trim().toLowerCase();
  const precioMin = filtroPrecioMin.value ? parseFloat(filtroPrecioMin.value) : null;
  const precioMax = filtroPrecioMax.value ? parseFloat(filtroPrecioMax.value) : null;

  const filtrados = registros.filter(reg => {
    const fecha = new Date(reg.fechaHora);
    return (
      (!placa || reg.placa.toLowerCase().includes(placa)) &&
      (!desde || fecha >= desde) &&
      (!hasta || fecha <= hasta) &&
      (!lavador || reg.lavador.toLowerCase().includes(lavador)) &&
      (!marca || reg.marca.toLowerCase().includes(marca)) &&
      (!modelo || reg.modelo.toLowerCase().includes(modelo)) &&
      (!color || reg.color.toLowerCase().includes(color)) &&
      (!precioMin || parseFloat(reg.precio) >= precioMin) &&
      (!precioMax || parseFloat(reg.precio) <= precioMax)
    );
  });

  resultadoFiltros.textContent = `${filtrados.length} resultado(s)`;
  mostrarRegistros(filtrados);
});

// === AUTOCOMPLETAR POR PLACA ===
inputPlaca.addEventListener('change', () => {
  const entrada = inputPlaca.value.trim().toUpperCase();
  const existente = basePlacas.find(p => p.placa === entrada);
  if (existente) {
    activarBoton(marcasDiv, existente.marca);
    activarBoton(modelosDiv, existente.modelo);
    activarBoton(coloresDiv, existente.color);
    inputMarca.value = existente.marca;
    inputModelo.value = existente.modelo;
    inputColor.value = existente.color;
  }
});

// === ABRIR Y CERRAR PANELES ===
btnNuevo.addEventListener('click', () => {
  const abierto = formulario.classList.contains('activo');
  abierto ? cerrarFormulario() : abrirFormulario();
});
overlayRegistro.addEventListener('click', cerrarFormulario);

btnToggleFiltros.addEventListener('click', () => {
  panelFiltros.classList.add('activo');
  overlay.classList.add('activo');
});
btnCerrarFiltros.addEventListener('click', () => {
  panelFiltros.classList.remove('activo');
  overlay.classList.remove('activo');
});
overlay.addEventListener('click', () => {
  panelFiltros.classList.remove('activo');
  overlay.classList.remove('activo');
});
