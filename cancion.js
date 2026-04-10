// ===============================
// OBTENER PARÁMETRO ?file=...
// ===============================
function getFileFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
}

// ===============================
// INFERIR TONALIDAD A PARTIR DE ACORDES
// ===============================
function inferirTonalidad(cancion) {
    const lineas = cancion.lines || [];
    const regexAcorde = /\b([A-G][#b]?)(m?)\b/i;

    for (const linea of lineas) {
        if (!linea.chordLine) continue;

        const match = linea.chordLine.match(regexAcorde);
        if (!match) continue;

        let nota = match[1].toUpperCase();
        let menor = match[2] === 'm';

        const relativas = {
            "A": "C",
            "D": "F",
            "E": "G",
            "B": "D",
            "F#": "A",
            "C#": "E"
        };

        if (menor) return relativas[nota] || nota;
        return nota;
    }

    return "";
}

// ===============================
// TABLA DE NOTAS PARA TRANSPOSICIÓN
// ===============================
const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function transponerAcorde(acorde, semitonos) {
    const match = acorde.match(/^([A-G][#b]?)(m?)$/);
    if (!match) return acorde;

    let [_, nota, menor] = match;

    const bemoles = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
    if (bemoles[nota]) nota = bemoles[nota];

    let idx = notas.indexOf(nota);
    if (idx === -1) return acorde;

    let nuevoIdx = (idx + semitonos + 12) % 12;
    return notas[nuevoIdx] + menor;
}

// ===============================
// MOSTRAR DATOS BÁSICOS
// ===============================
function mostrarDatos(cancion) {
    const categoria = cancion.category || "—";
    const ritmo = cancion.ritmo || "—";
    const cejilla = (cancion.cejilla ?? 0);

    const original = cancion.originalKey || inferirTonalidad(cancion) || "—";

    document.getElementById('tituloCancion').textContent = cancion.title || '';
    document.getElementById('categoriaCancion').textContent = categoria;
    document.getElementById('ritmoCancion').textContent = ritmo;
    document.getElementById('cejillaCancion').textContent = cejilla;
    document.getElementById('tonalidadOriginal').textContent = original;
    document.getElementById('tonalidadActual').textContent = original;
}

// ===============================
// MOSTRAR CONTENIDO (ACORDES + LETRA)
// ===============================
function mostrarContenido(cancion) {
    const contenedor = document.getElementById('contenidoCancion');
    let salida = '';

    const lineas = cancion.lines || [];

    lineas.forEach(linea => {
        if (linea.chordLine) salida += linea.chordLine + '\n';
        salida += (linea.lyrics || '') + '\n\n';
    });

    contenedor.textContent = salida;
}

// ===============================
// TRANSPONER TODA LA CANCIÓN
// ===============================
function transponerCancion(cancion, semitonos) {
    const contenedor = document.getElementById('contenidoCancion');
    let salida = '';

    const regexAcorde = /\b([A-G][#b]?m?)\b/g;

    cancion.lines.forEach(linea => {
        let chordLine = linea.chordLine || "";
        chordLine = chordLine.replace(regexAcorde, acorde => transponerAcorde(acorde, semitonos));

        let lyrics = linea.lyrics || "";

        salida += chordLine + "\n" + lyrics + "\n\n";
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
// TRANSFORMACIÓN DE TONALIDAD
// ===============================
function configurarTransposicion(cancion) {
    const spanActual = document.getElementById('tonalidadActual');
    const original = cancion.originalKey || inferirTonalidad(cancion) || "—";

    let semitonos = 0;

    function calcularTono() {
        if (semitonos === 0) return original;
        return `${original} (${semitonos > 0 ? '+' : ''}${semitonos})`;
    }

    function actualizar() {
        spanActual.textContent = calcularTono();
        transponerCancion(cancion, semitonos);
    }

    document.getElementById('btnMenos').addEventListener('click', () => {
        semitonos -= 1;
        actualizar();
    });

    document.getElementById('btnMas').addEventListener('click', () => {
        semitonos += 1;
        actualizar();
    });

    actualizar();
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
