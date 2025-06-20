document.addEventListener('DOMContentLoaded', () => {
// Elementos del DOM
const btnNuevo = document.getElementById('btnNuevo');
const formulario = document.getElementById('formulario');
const registroForm = document.getElementById('registroForm');
const registroBody = document.getElementById('registroBody');

let basePlacas = [];

fetch('placas.json')
  .then(response => response.json())
  .then(data => {
    basePlacas = data;
    console.log('✔ Base de placas cargada con', basePlacas.length, 'entradas.');
  })
  .catch(error => console.error('❌ Error cargando placas.json:', error));


let registrosGuardados = JSON.parse(localStorage.getItem('registros')) || [];
let contador = registrosGuardados.length + 1;
let filaEditando = null;

// Mostrar registros guardados del día actual
const hoyFecha = new Date();

const registrosDeHoy = registrosGuardados.filter(registro => {
  const partes = registro.fechaHora.split(',')[0].trim().split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const anio = parseInt(partes[2], 10);

  return (
    dia === hoyFecha.getDate() &&
    mes === hoyFecha.getMonth() + 1 &&
    anio === hoyFecha.getFullYear()
  );
});

// Agregar registros de hoy a la tabla
registrosDeHoy.forEach((registro, index) => {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${index + 1}</td>
    <td>${registro.placa}</td>
    <td>${registro.marca}</td>
    <td>${registro.modelo}</td>
    <td>${registro.color}</td>
    <td>$${registro.precio}</td>
    <td>${registro.lavador}</td>
    <td>${registro.fechaHora}</td>
    <td>
      <button class="btn-editar">Editar</button>
      <button class="btn-eliminar">Eliminar</button>
    </td>
  `;
  registroBody.appendChild(fila);
});


// Opciones de marcas y modelos
let opciones = JSON.parse(localStorage.getItem('opciones')) || {
    Mazda: ["CX-30", "CX-5", "Mazda 3", "Mazda 2"],
    Toyota: ["Corolla", "Hilux", "Yaris", "Avanza"],
    Nissan: ["Sentra", "Versa", "NP300", "X-Trail"]
  };
  
  // Elementos
  const marcasDiv = document.getElementById('marcas');
  const modelosDiv = document.getElementById('modelos');
  const inputMarca = document.getElementById('inputMarca');
  const inputModelo = document.getElementById('inputModelo');
  const inputPlaca = document.getElementById('inputPlaca');

  

  // Mostrar botones de marca
  Object.keys(opciones).forEach(marca => {
    const btn = document.createElement('button');
    btn.textContent = marca;
    btn.type = 'button';
    btn.addEventListener('click', () => seleccionarMarca(marca, btn));
    marcasDiv.appendChild(btn);
    localStorage.setItem('opciones', JSON.stringify(opciones));
  });
  
  // Al seleccionar marca, mostrar modelos
  function seleccionarMarca(marcaSeleccionada, botonSeleccionado) {
    btnAgregarModelo.disabled = false;
    inputMarca.value = marcaSeleccionada;
  
    [...marcasDiv.children].forEach(btn => btn.classList.remove('activo'));
    botonSeleccionado.classList.add('activo');
  
    modelosDiv.innerHTML = '';
    inputModelo.value = '';
  
    const marcaClave = Object.keys(opciones).find(m => m.toLowerCase() === marcaSeleccionada.toLowerCase());
    if (!marcaClave) return;
  
    // 🔧 Verifica si inputModelo tiene un valor no listado, y lo agrega
    const modeloAutocompletado = inputModelo.value;
    if (modeloAutocompletado && !opciones[marcaClave].includes(modeloAutocompletado)) {
      opciones[marcaClave].push(modeloAutocompletado);
      localStorage.setItem('opciones', JSON.stringify(opciones));
    }
  
    opciones[marcaClave].forEach(modelo => {
      const btnModelo = document.createElement('button');
      btnModelo.textContent = modelo;
      btnModelo.type = 'button';
      btnModelo.addEventListener('click', () => seleccionarModelo(modelo, btnModelo));
      modelosDiv.appendChild(btnModelo);
    });
  }
  
  
  // Al seleccionar modelo
  function seleccionarModelo(modelo, botonModelo) {
    inputModelo.value = modelo;
    [...modelosDiv.children].forEach(btn => btn.classList.remove('activo'));
    botonModelo.classList.add('activo');
  }
  



// Envío del formulario
registroForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const placa = registroForm.placa.value;
  const marca = registroForm.marca.value;
  const modelo = registroForm.modelo.value;
  const color = registroForm.color.value;
  const precio = registroForm.precio.value;
  const lavador = registroForm.lavador.value;

  const ahora = new Date();
  const fechaHora = ahora.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (filaEditando) {
    // Modo edición: actualiza valores
    filaEditando.cells[1].textContent = placa;
    filaEditando.cells[2].textContent = marca;
    filaEditando.cells[3].textContent = modelo;
    filaEditando.cells[4].textContent = color;
    filaEditando.cells[5].textContent = `$${precio}`;
    filaEditando.cells[6].textContent = lavador;
    filaEditando.cells[7].textContent = fechaHora;
    
      // 🟢 Actualizar localStorage después de editar
  const filaIndex = filaEditando.rowIndex - 1; // -1 porque la tabla no tiene encabezado
  registrosGuardados[filaIndex] = { placa, marca, modelo, color, precio, lavador, fechaHora };
  localStorage.setItem('registros', JSON.stringify(registrosGuardados));
  filaEditando = null;
} else {
  // Modo nuevo: crea fila
  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td>${contador}</td>
    <td>${placa}</td>
    <td>${marca}</td>
    <td>${modelo}</td>
    <td>${color}</td>
    <td>$${precio}</td>
    <td>${lavador}</td>
    <td>${fechaHora}</td>
    <td>
      <button class="btn-editar">Editar</button>
    </td>
  `;
  registroBody.appendChild(nuevaFila);
  contador++;

  // Guardar en localStorage (registros de lavados)
  const nuevoRegistro = { placa, marca, modelo, color, precio, lavador, fechaHora };
  registrosGuardados.push(nuevoRegistro);
  localStorage.setItem('registros', JSON.stringify(registrosGuardados));

}

    // Guardar o actualizar datos del vehículo
let vehiculosGuardados = JSON.parse(localStorage.getItem('vehiculos')) || [];
const indexVehiculo = vehiculosGuardados.findIndex(v => v.placa === placa);

const datosVehiculo = { placa, marca, modelo, color };
if (indexVehiculo !== -1) {
  vehiculosGuardados[indexVehiculo] = datosVehiculo; // actualizar
} else {
  vehiculosGuardados.push(datosVehiculo); // nuevo
}
localStorage.setItem('vehiculos', JSON.stringify(vehiculosGuardados));
  

  registroForm.reset();
  formulario.classList.add('oculto');
});
// Escuchar clics en la tabla para "Editar" o "Eliminar"
// Escuchar clics en la tabla para "Editar" o "Eliminar"
registroBody.addEventListener('click', (e) => {
  const boton = e.target;

  // Editar
  if (boton.classList.contains('btn-editar')) {
    filaEditando = boton.closest('tr');
    formulario.classList.remove('oculto');

    registroForm.placa.value = filaEditando.cells[1].textContent;
    registroForm.marca.value = filaEditando.cells[2].textContent;
    registroForm.modelo.value = filaEditando.cells[3].textContent;
    registroForm.color.value = filaEditando.cells[4].textContent;
    registroForm.precio.value = filaEditando.cells[5].textContent.replace('$', '');
    registroForm.lavador.value = filaEditando.cells[6].textContent;
  }

  // Eliminar
  if (boton.classList.contains('btn-eliminar')) {
    const fila = boton.closest('tr');
    const filaIndex = fila.rowIndex - 1;

    const confirmado = confirm("¿Seguro que deseas eliminar este registro?");
    if (confirmado) {
      fila.remove(); // quitar de la tabla
      registrosGuardados.splice(filaIndex, 1); // quitar del array

      // Guardar o limpiar localStorage según el caso
      if (registrosGuardados.length === 0) {
        localStorage.removeItem('registros');
      } else {
        localStorage.setItem('registros', JSON.stringify(registrosGuardados));
      }

      // Reindexar la tabla visualmente
      [...registroBody.rows].forEach((row, i) => {
        row.cells[0].textContent = i + 1;
      });
    }
  }
});

// Botones para agregar
const btnAgregarMarca = document.getElementById('btnAgregarMarca');
const btnAgregarModelo = document.getElementById('btnAgregarModelo');

// Agregar nueva marca
btnAgregarMarca.addEventListener('click', () => {
  const nuevaMarca = prompt("Escribe el nombre de la nueva marca:");

  if (nuevaMarca && !opciones[nuevaMarca]) {
    opciones[nuevaMarca] = [];

    const btn = document.createElement('button');
    btn.textContent = nuevaMarca;
    btn.type = 'button';
    btn.addEventListener('click', () => seleccionarMarca(nuevaMarca, btn));
    marcasDiv.appendChild(btn);
  } else if (opciones[nuevaMarca]) {
    alert("Esa marca ya existe.");
    localStorage.setItem('opciones', JSON.stringify(opciones));
  }
});

// Agregar nuevo modelo
btnAgregarModelo.addEventListener('click', () => {
    const marcaSeleccionada = inputMarca.value;
    if (!marcaSeleccionada) return;
  
    const nuevoModelo = prompt(`Escribe un modelo nuevo para ${marcaSeleccionada}:`);
  
    if (nuevoModelo && !opciones[marcaSeleccionada].includes(nuevoModelo)) {
      opciones[marcaSeleccionada].push(nuevoModelo);
  
      const btnModelo = document.createElement('button');
      btnModelo.textContent = nuevoModelo;
      btnModelo.type = 'button';
      btnModelo.addEventListener('click', () => seleccionarModelo(nuevoModelo, btnModelo));
      modelosDiv.appendChild(btnModelo);
    } else if (opciones[marcaSeleccionada].includes(nuevoModelo)) {
      alert("Ese modelo ya existe para esta marca.");
      localStorage.setItem('opciones', JSON.stringify(opciones));
    }
  });
  // === COLOR Y PRECIO ===

// Datos base
const coloresBase = JSON.parse(localStorage.getItem('coloresBase')) || ["Blanco", "Negro", "Rojo", "Gris"];
const preciosBase = JSON.parse(localStorage.getItem('preciosBase')) || ["100", "120", "150", "200"];

// Elementos
const coloresDiv = document.getElementById('colores');
const preciosDiv = document.getElementById('precios');
const inputColor = document.getElementById('inputColor');
const inputPrecio = document.getElementById('inputPrecio');
const btnAgregarColor = document.getElementById('btnAgregarColor');
const btnAgregarPrecio = document.getElementById('btnAgregarPrecio');

// Crear botones para color
coloresBase.forEach(color => {
  const btn = document.createElement('button');
  btn.textContent = color;
  btn.type = 'button';
  btn.addEventListener('click', () => {
    inputColor.value = color;
    [...coloresDiv.children].forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
  });
  coloresDiv.appendChild(btn);
});

// Crear botones para precio
preciosBase.forEach(precio => {
  const btn = document.createElement('button');
  btn.textContent = `$${precio}`;
  btn.type = 'button';
  btn.addEventListener('click', () => {
    inputPrecio.value = precio;
    [...preciosDiv.children].forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
  });
  preciosDiv.appendChild(btn);
});

// Agregar nuevo color
btnAgregarColor.addEventListener('click', () => {
  const nuevo = prompt("Escribe un nuevo color:");
  if (nuevo && !coloresBase.includes(nuevo)) {
    coloresBase.push(nuevo);
    localStorage.setItem('coloresBase', JSON.stringify(coloresBase));
    const btn = document.createElement('button');
    btn.textContent = nuevo;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      inputColor.value = nuevo;
      [...coloresDiv.children].forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
    });
    coloresDiv.appendChild(btn);
  }
});

// Agregar nuevo precio
btnAgregarPrecio.addEventListener('click', () => {
  const nuevo = prompt("Escribe un nuevo precio:");
  if (nuevo && !preciosBase.includes(nuevo)) {
    preciosBase.push(nuevo);
    localStorage.setItem('preciosBase', JSON.stringify(preciosBase));
    const btn = document.createElement('button');
    btn.textContent = `$${nuevo}`;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      inputPrecio.value = nuevo;
      [...preciosDiv.children].forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      
    });
    preciosDiv.appendChild(btn);

  }
});
// === LAVADORES ===
const lavadoresBase = JSON.parse(localStorage.getItem('lavadoresBase')) || ["Luis", "Ana", "Pedro"];
const lavadoresDiv = document.getElementById('lavadores');
const inputLavador = document.getElementById('inputLavador');
const btnAgregarLavador = document.getElementById('btnAgregarLavador');
const btnEditarLavadores = document.getElementById('btnEditarLavadores');

// Mostrar botones de lavador
function renderLavadores() {
  lavadoresDiv.innerHTML = '';
  lavadoresBase.forEach(nombre => {
    const btn = document.createElement('button');
    btn.textContent = nombre;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      inputLavador.value = nombre;
      [...lavadoresDiv.children].forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
    });
    lavadoresDiv.appendChild(btn);
  });
}
renderLavadores();

// Agregar nuevo lavador
btnAgregarLavador.addEventListener('click', () => {
  const nuevo = prompt("Nombre del nuevo lavador:");
  if (nuevo && !lavadoresBase.includes(nuevo)) {
    lavadoresBase.push(nuevo);
    localStorage.setItem('lavadoresBase', JSON.stringify(lavadoresBase));
    renderLavadores();
  } else if (lavadoresBase.includes(nuevo)) {
    alert("Ese lavador ya está registrado.");
  }
});

// Editar lavadores
btnEditarLavadores.addEventListener('click', () => {
  const actual = prompt("Nombre del lavador que quieres editar o eliminar:");
  if (!actual || !lavadoresBase.includes(actual)) {
    alert("Lavador no encontrado.");
    return;
  }

  const accion = prompt(`¿Qué deseas hacer con "${actual}"?\n- Escribe el nuevo nombre para renombrar\n- Escribe "eliminar" para borrarlo`).trim();

  if (accion.toLowerCase() === "eliminar") {
    const confirmado = confirm(`¿Seguro que deseas eliminar a "${actual}"?`);
    if (confirmado) {
      const index = lavadoresBase.indexOf(actual);
      lavadoresBase.splice(index, 1);
      renderLavadores();
    }
  } else if (accion && accion !== actual) {
    if (lavadoresBase.includes(accion)) {
      alert("Ese nombre ya existe.");
    } else {
      const index = lavadoresBase.indexOf(actual);
      lavadoresBase[index] = accion;
      renderLavadores();
    }
  }
});

inputPlaca.addEventListener('input', () => {
  const valor = inputPlaca.value.trim().toLowerCase();
  if (valor.length < 3) return;

  const vehiculosGuardados = JSON.parse(localStorage.getItem('vehiculos')) || [];

  // 1️⃣ Buscar primero en placas.json
  const encontradoJSON = basePlacas.find(v => v.placa.toLowerCase() === valor);

  // 2️⃣ Si no está en JSON, buscar en localStorage
  const encontradoLocal = vehiculosGuardados.find(v => v.placa.toLowerCase() === valor);

  const encontrado = encontradoJSON || encontradoLocal;

  // Limpiar selección anterior
  inputMarca.value = '';
  inputModelo.value = '';
  inputColor.value = '';
  [...marcasDiv.children].forEach(btn => btn.classList.remove('activo'));
  modelosDiv.innerHTML = '';
  [...coloresDiv.children].forEach(btn => btn.classList.remove('activo'));

  if (encontrado) {
    inputMarca.value = encontrado.marca;
    inputModelo.value = encontrado.modelo;
    inputColor.value = encontrado.color;

    // 🔹 Activar o crear botón de marca
    let btnMarca = [...marcasDiv.children].find(btn => btn.textContent === encontrado.marca);
    if (!btnMarca) {
      btnMarca = document.createElement('button');
      btnMarca.textContent = encontrado.marca;
      btnMarca.type = 'button';
      btnMarca.addEventListener('click', () => {
        seleccionarMarca(encontrado.marca, btnMarca);
      });
      marcasDiv.appendChild(btnMarca);
    }
    btnMarca.click();

    const marcaClave = Object.keys(opciones).find(m => m.toLowerCase() === encontrado.marca.toLowerCase());
if (marcaClave && !opciones[marcaClave].includes(encontrado.modelo)) {
  opciones[marcaClave].push(encontrado.modelo);
  localStorage.setItem('opciones', JSON.stringify(opciones));
}

    // 🔹 Activar o crear botón de modelo
    const observer = new MutationObserver(() => {
      let btnModelo = [...modelosDiv.children].find(btn => btn.textContent === encontrado.modelo);
      if (!btnModelo) {
        btnModelo = document.createElement('button');
        btnModelo.textContent = encontrado.modelo;
        btnModelo.type = 'button';
        btnModelo.addEventListener('click', () => {
          inputModelo.value = encontrado.modelo;
          [...modelosDiv.children].forEach(b => b.classList.remove('activo'));
          btnModelo.classList.add('activo');
        });
        modelosDiv.appendChild(btnModelo);
      }
      btnModelo.click();
      observer.disconnect();
    });
    observer.observe(modelosDiv, { childList: true });

    // 🔹 Activar o crear botón de color
    let btnColor = [...coloresDiv.children].find(btn => btn.textContent === encontrado.color);
    if (!btnColor) {
      btnColor = document.createElement('button');
      btnColor.textContent = encontrado.color;
      btnColor.type = 'button';
      btnColor.addEventListener('click', () => {
        inputColor.value = encontrado.color;
        [...coloresDiv.children].forEach(b => b.classList.remove('activo'));
        btnColor.classList.add('activo');
      });
      coloresDiv.appendChild(btnColor);
    }
    btnColor.click();
  } else {
    console.warn('❗ Placa no encontrada ni en JSON ni en localStorage');
  }
});


const btnEditarMarca = document.getElementById('btnEditarMarca');
const btnEditarModelo = document.getElementById('btnEditarModelo');

// Editar o eliminar marca
btnEditarMarca.addEventListener('click', () => {
  const marcaActual = prompt("Escribe el nombre de la marca que deseas editar o eliminar:");
  if (!marcaActual || !opciones[marcaActual]) {
    alert("Marca no encontrada.");
    return;
  }

  const accion = prompt(`¿Qué deseas hacer con "${marcaActual}"?\n- Escribe el nuevo nombre para cambiar\n- Escribe "eliminar" para borrarla`).trim();

  if (accion.toLowerCase() === "eliminar") {
    const confirmado = confirm(`¿Seguro que deseas eliminar la marca "${marcaActual}"? Esto también borrará sus modelos.`);
    if (confirmado) {
      delete opciones[marcaActual];
      localStorage.setItem('opciones', JSON.stringify(opciones));
      location.reload();
    }
  } else if (accion && accion !== marcaActual) {
    if (opciones[accion]) {
      alert("Ese nombre de marca ya existe.");
    } else {
      opciones[accion] = opciones[marcaActual];
      delete opciones[marcaActual];
      localStorage.setItem('opciones', JSON.stringify(opciones));
      location.reload();
    }
  }
});

// Editar o eliminar modelo
btnEditarModelo.addEventListener('click', () => {
  const marcaSeleccionada = inputMarca.value;
  if (!marcaSeleccionada) {
    alert("Primero selecciona una marca.");
    return;
  }

  const modeloActual = prompt(`Escribe el modelo que deseas editar o eliminar de "${marcaSeleccionada}":`);
  if (!modeloActual || !opciones[marcaSeleccionada].includes(modeloActual)) {
    alert("Modelo no encontrado.");
    return;
  }

  const accion = prompt(`¿Qué deseas hacer con "${modeloActual}"?\n- Escribe el nuevo nombre para cambiar\n- Escribe "eliminar" para borrarlo`).trim();

  if (accion.toLowerCase() === "eliminar") {
    const confirmado = confirm(`¿Seguro que deseas eliminar el modelo "${modeloActual}"?`);
    if (confirmado) {
      opciones[marcaSeleccionada] = opciones[marcaSeleccionada].filter(m => m !== modeloActual);
      localStorage.setItem('opciones', JSON.stringify(opciones));
      seleccionarMarca(marcaSeleccionada, [...marcasDiv.children].find(btn => btn.textContent === marcaSeleccionada));
    }
  } else if (accion && accion !== modeloActual) {
    if (opciones[marcaSeleccionada].includes(accion)) {
      alert("Ese modelo ya existe.");
    } else {
      const index = opciones[marcaSeleccionada].indexOf(modeloActual);
      opciones[marcaSeleccionada][index] = accion;
      localStorage.setItem('opciones', JSON.stringify(opciones));
      seleccionarMarca(marcaSeleccionada, [...marcasDiv.children].find(btn => btn.textContent === marcaSeleccionada));
    }
  }
});

// Escuchar clics en la tabla para "Editar" o "Eliminar"
registroBody.addEventListener('click', (e) => {
  const boton = e.target;

  // Editar
  if (boton.classList.contains('btn-editar')) {
    filaEditando = boton.closest('tr');
    formulario.classList.remove('oculto');

    registroForm.placa.value = filaEditando.cells[1].textContent;
    registroForm.marca.value = filaEditando.cells[2].textContent;
    registroForm.modelo.value = filaEditando.cells[3].textContent;
    registroForm.color.value = filaEditando.cells[4].textContent;
    registroForm.precio.value = filaEditando.cells[5].textContent.replace('$', '');
    registroForm.lavador.value = filaEditando.cells[6].textContent;
  }

  // Eliminar
  if (boton.classList.contains('btn-eliminar')) {
    const fila = boton.closest('tr');
    const filaIndex = fila.rowIndex - 1;

    const confirmado = confirm("¿Seguro que deseas eliminar este registro?");
    if (confirmado) {
      fila.remove();
      registrosGuardados.splice(filaIndex, 1);

      if (registrosGuardados.length === 0) {
        localStorage.removeItem('registros');
      } else {
        localStorage.setItem('registros', JSON.stringify(registrosGuardados));
      }

      // Reindexar
      [...registroBody.rows].forEach((row, i) => {
        row.cells[0].textContent = i + 1;
      });
    }
  }
});

function activarBoton(contenedor, texto) {
  [...contenedor.children].forEach(btn => {
    if (btn.textContent.toLowerCase() === texto.toLowerCase()) {
      btn.classList.add('activo');
    } else {
      btn.classList.remove('activo');
    }
  });
}

function buscarBoton(contenedor, texto) {
  return [...contenedor.children].find(btn => btn.textContent.toLowerCase() === texto.toLowerCase());
}

// 📌 Referencias a los inputs de filtro
const filtroPlaca = document.getElementById('filtroPlaca');
const filtroFechaInicio = document.getElementById('filtroFechaInicio');
const filtroFechaFin = document.getElementById('filtroFechaFin');
const filtroLavador = document.getElementById('filtroLavador');
const filtroMarca = document.getElementById('filtroMarca');
const filtroModelo = document.getElementById('filtroModelo');
const filtroColor = document.getElementById('filtroColor');
const filtroPrecioMin = document.getElementById('filtroPrecioMin');
const filtroPrecioMax = document.getElementById('filtroPrecioMax');
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
const resultadoFiltros = document.getElementById('resultadoFiltros');

// 🔍 Convertir fecha DD/MM/AAAA a Date
function parseFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split('/').map(Number);
  return new Date(anio, mes - 1, dia);
}

// 🧠 Aplicar filtros
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

  // Mostrar resultados filtrados
  registroBody.innerHTML = '';
  filtrados.forEach((registro, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${registro.placa}</td>
      <td>${registro.marca}</td>
      <td>${registro.modelo}</td>
      <td>${registro.color}</td>
      <td>$${registro.precio}</td>
      <td>${registro.lavador}</td>
      <td>${registro.fechaHora}</td>
      <td>
        <button class="btn-editar">Editar</button>
        <button class="btn-eliminar">Eliminar</button>
      </td>
    `;
    registroBody.appendChild(fila);
  });

  resultadoFiltros.textContent = `🔎 ${filtrados.length} resultado(s) encontrado(s).`;
});

// === PANEL DE FILTROS ===
const panelFiltros = document.getElementById('panelFiltros');
const btnMostrarFiltros = document.getElementById('btnToggleFiltros');
const btnCerrarFiltros = document.getElementById('btnCerrarFiltros');
const overlay = document.getElementById('overlay');

function abrirPanelFiltros() {
  panelFiltros.classList.add('activo');
  overlay.classList.add('activo');
  btnMostrarFiltros.textContent = '🎛 Ocultar filtros';
}

function cerrarPanelFiltros() {
  panelFiltros.classList.remove('activo');
  overlay.classList.remove('activo');
  btnMostrarFiltros.textContent = '🎛 Mostrar filtros';
}

if (btnMostrarFiltros) {
  btnMostrarFiltros.addEventListener('click', () => {
    const estaActivo = panelFiltros.classList.contains('activo');
    estaActivo ? cerrarPanelFiltros() : abrirPanelFiltros();
  });
}

if (btnCerrarFiltros) {
  btnCerrarFiltros.addEventListener('click', cerrarPanelFiltros);
}

if (overlay) {
  overlay.addEventListener('click', () => {
    if (panelFiltros.classList.contains('activo')) cerrarPanelFiltros();
  });
}

// === PANEL DE NUEVO REGISTRO ===



function abrirFormulario() {
  formulario.classList.add('activo');
  overlayRegistro.classList.add('activo');
  btnNuevo.textContent = '✕ Cerrar';
}

function cerrarFormulario() {
  formulario.classList.remove('activo');
  overlayRegistro.classList.remove('activo');
  btnNuevo.textContent = '+ Registro';
  const formElement = formulario.querySelector('form');
  if (formElement) formElement.reset(); // 🔄 Limpia campos
}

if (btnNuevo) {
  btnNuevo.addEventListener('click', () => {
    const estaActivo = formulario.classList.contains('activo');
    estaActivo ? cerrarFormulario() : abrirFormulario();
  });
}

if (btnCerrarFormulario) {
  btnCerrarFormulario.addEventListener('click', cerrarFormulario);
}

if (overlayRegistro) {
  overlayRegistro.addEventListener('click', () => {
    if (formulario.classList.contains('activo')) cerrarFormulario();
  });
}

// === ESCAPE UNIFICADO
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (panelFiltros.classList.contains('activo')) cerrarPanelFiltros();
    if (formulario.classList.contains('activo')) cerrarFormulario();
  }
});
});