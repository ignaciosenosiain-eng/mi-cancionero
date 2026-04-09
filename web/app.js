// ===============================
// CARGAR CATEGORÍAS
// ===============================

fetch('./config/categories.json')
  .then(response => response.json())
  .then(categories => {
    const select = document.getElementById('categoriaSelect');

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  });


// ===============================
// VARIABLES GLOBALES
// ===============================

let todasLasCanciones = []; // Lista de objetos {file, title, category}
let datosCanciones = {};    // Cache de canciones ya cargadas


// ===============================
// CARGAR LISTA DE CANCIONES
// ===============================

function cargarCanciones() {
  fetch('./config/index.json')
    .then(response => response.json())
    .then(data => {
      todasLasCanciones = data.songs;   // ← AQUÍ ESTABA EL PROBLEMA
      mostrarCanciones(todasLasCanciones);
    });
}


// ===============================
// MOSTRAR CANCIONES EN PANTALLA
// ===============================

function mostrarCanciones(lista) {
  const contenedor = document.getElementById('listaCanciones');
  contenedor.innerHTML = '';

  lista.forEach(song => {
    const nombreArchivo = song.file;

    // Si ya está en cache, úsalo
    if (datosCanciones[nombreArchivo]) {
      insertarCancionEnLista(song, datosCanciones[nombreArchivo]);
      return;
    }

    // Si no, cargarla
    fetch('./canciones/' + nombreArchivo)
      .then(response => response.json())
      .then(cancion => {
        datosCanciones[nombreArchivo] = cancion; // Guardar en cache
        insertarCancionEnLista(song, cancion);
      });
  });
}


// ===============================
// FUNCIÓN AUXILIAR PARA INSERTAR
// ===============================

function insertarCancionEnLista(song, cancion) {
  const contenedor = document.getElementById('listaCanciones');

  const div = document.createElement('div');
  div.classList.add('cancion-item');

  div.innerHTML = `
    <a href="cancion.html?file=${song.file}">
      ${song.title}
      <span class="categoria">(${song.category})</span>
    </a>
  `;

  contenedor.appendChild(div);
}


// ===============================
// FILTRAR POR CATEGORÍA
// ===============================

document.getElementById('categoriaSelect').addEventListener('change', function () {
  const categoria = this.value;

  if (categoria === '') {
    mostrarCanciones(todasLasCanciones);
    return;
  }

  const filtradas = todasLasCanciones.filter(song => song.category === categoria);

  mostrarCanciones(filtradas);
});


// ===============================
// INICIO
// ===============================

cargarCanciones();
