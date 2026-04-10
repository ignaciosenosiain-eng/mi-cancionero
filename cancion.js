// ===============================
// OBTENER PARÁMETRO ?file=...
// ===============================
function getFileFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file'); // ej: ALABA-AL-SENOR.json
}

// ===============================
// MOSTRAR DATOS BÁSICOS
// ===============================
function mostrarDatos(cancion) {
    document.getElementById('tituloCancion').textContent = cancion.title || '';
    document.getElementById('categoriaCancion').textContent = cancion.category || '';
    document.getElementById('ritmoCancion').textContent = cancion.ritmo || '';
    document.getElementById('cejillaCancion').textContent = (cancion.cejilla ?? 0);
    document.getElementById('tonalidadOriginal').textContent = cancion.originalKey || '';
    document.getElementById('tonalidadActual').textContent = cancion.originalKey || '';
}

// ===============================
// MOSTRAR CONTENIDO (ACORDES + LETRA)
// ===============================
function mostrarContenido(cancion) {
    const contenedor = document.getElementById('contenidoCancion');
    let salida = '';

    cancion.lines.forEach(linea => {
        if (linea.chordLine) salida += linea.chordLine + '\n';
        salida += linea.lyrics + '\n\n';
    });

    contenedor.textContent = salida;
}

// ===============================
// AÑADIR A LA LISTA DEL DÍA
// ===============================
function configurarListaDia(file, cancion) {
    const btn = document.getElementById('btnListaDia');

    btn.addEventListener('click', () => {
        const clave = 'listaDia';
        const actual = JSON.parse(localStorage.getItem(clave) || '[]');

        // Evitar duplicados por file
        const yaEsta = actual.some(item => item.file === file);
        if (!yaEsta) {
            actual.push({
                file: file,
                title: cancion.title || '',
                category: cancion.category || ''
            });
            localStorage.setItem(clave, JSON.stringify(actual));
        }

        alert('Canción añadida a la lista del día');
    });
}

// ===============================
// TRANSFORMACIÓN DE TONALIDAD (ESQUELETO)
// ===============================
function configurarTransposicion(cancion) {
    const spanActual = document.getElementById('tonalidadActual');
    let tonoActual = cancion.originalKey || '';

    function actualizarTono(nuevo) {
        tonoActual = nuevo;
        spanActual.textContent = tonoActual;
        // Aquí más adelante haremos la transposición real de acordes
    }

    document.getElementById('btnMenos').addEventListener('click', () => {
        // De momento solo marcamos que cambia (luego haremos la lógica real)
        actualizarTono(tonoActual + ' -1');
    });

    document.getElementById('btnMas').addEventListener('click', () => {
        actualizarTono(tonoActual + ' +1');
    });
}

// ===============================
// INICIO
// ===============================
(function iniciar() {
    const file = getFileFromQuery();
    if (!file) {
        alert('Falta parámetro ?file=');
        return;
    }

    fetch('./canciones/' + file)
        .then(r => r.json())
        .then(cancion => {
            mostrarDatos(cancion);
            mostrarContenido(cancion);
            configurarListaDia(file, cancion);
            configurarTransposicion(cancion);
        })
        .catch(err => {
            console.error(err);
            alert('No se pudo cargar la canción');
        });
})();
