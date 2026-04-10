// ===============================
// OBTENER PARÁMETRO ?file=...
// ===============================
function getFileFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
}

// ===============================
// MAPAS DE NOTAS (ES ↔ EN)
// ===============================
const notasES = ["DO","DO#","RE","RE#","MI","FA","FA#","SOL","SOL#","LA","LA#","SI"];
const notasEN = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const mapaEStoEN = {
    "DO":"C","DO#":"C#","RE":"D","RE#":"D#","MI":"E","FA":"F","FA#":"F#",
    "SOL":"G","SOL#":"G#","LA":"A","LA#":"A#","SI":"B",

    "LAM":"Am","REM":"Dm","MIM":"Em","FAM":"Fm","SOLM":"Gm","SIM":"Bm",
    "FA#M":"F#m","DO#M":"C#m","SOL#M":"G#m","LA#M":"A#m","RE#M":"D#m"
};

const mapaENtoES = {
    "C":"DO","C#":"DO#","D":"RE","D#":"RE#","E":"MI","F":"FA","F#":"FA#",
    "G":"SOL","G#":"SOL#","A":"LA","A#":"LA#","B":"SI",

    // menores naturales
    "Am":"lam",
    "Bm":"sim",
    "Cm":"dom",
    "Dm":"rem",
    "Em":"mim",
    "Fm":"fam",
    "Gm":"solm",

    // menores con sostenido
    "C#m":"do#m",
    "D#m":"re#m",
    "F#m":"fa#m",
    "G#m":"sol#m",
    "A#m":"la#m"
};

// ===============================
// INFERIR TONALIDAD
// ===============================
function inferirTonalidad(cancion) {
    const lineas = cancion.lines || [];
    const regex = /\b((DO|RE|MI|FA|SOL|LA|SI)(#)?(m)?)\b/i;

    for (const linea of lineas) {
        if (!linea.chordLine) continue;
        const m = linea.chordLine.toUpperCase().match(regex);
        if (!m) continue;

        let nota = m[1].toUpperCase();
        let menor = nota.endsWith("M");

        if (menor) {
            const base = nota.replace("M","");
            const relativas = {
                "LA":"DO","RE":"FA","MI":"SOL","SI":"RE","FA#":"LA","DO#":"MI"
            };
            return relativas[base] || base;
        }

        return nota.replace("M","");
    }
    return "";
}

// ===============================
// CONVERTIR ACORDE ES → EN
// ===============================
function acordeEStoEN(acorde) {
    const up = acorde.toUpperCase();
    if (mapaEStoEN[up]) return mapaEStoEN[up];
    return acorde;
}

// ===============================
// CONVERTIR ACORDE EN → ES
// ===============================
function acordeENtoES(acorde) {
    acorde = acorde.replace("M", "m"); // normalizar
    if (mapaENtoES[acorde]) return mapaENtoES[acorde];
    return acorde;
}

// ===============================
// TRANSPONER ACORDE (EN)
// ===============================
function transponerAcordeEN(acorde, semitonos) {
    const match = acorde.match(/^([A-G][#]?)(m?)$/i);
    if (!match) return acorde;

    let [_, nota, menor] = match;
    nota = nota.toUpperCase();

    let idx = notasEN.indexOf(nota);
    if (idx === -1) return acorde;

    let nuevoIdx = (idx + semitonos + 12) % 12;
    return notasEN[nuevoIdx] + (menor ? "m" : "");
}

// ===============================
// TRANSPONER ACORDE (ES → EN → ES)
// ===============================
function transponerAcordeES(acorde, semitonos) {
    const en = acordeEStoEN(acorde);
    const transEN = transponerAcordeEN(en, semitonos);
    return acordeENtoES(transEN);
}

// ===============================
// MOSTRAR DATOS
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

    document.getElementById('tonoOriginalTexto').textContent = original;
    document.getElementById('tonalidadActual').textContent = original;
}

// ===============================
// MOSTRAR CONTENIDO
// ===============================
function mostrarContenido(cancion) {
    const contenedor = document.getElementById('contenidoCancion');
    let salida = "";

    cancion.lines.forEach(l => {
        if (l.chordLine) salida += l.chordLine + "\n";
        salida += (l.lyrics || "") + "\n\n";
    });

    contenedor.textContent = salida;
}

// ===============================
// CALCULAR TONALIDAD REAL
// ===============================
function calcularTonalidadReal(original, semitonos) {
    const originalEN = mapaEStoEN[original] || original;
    const idx = notasEN.indexOf(originalEN);
    if (idx === -1) return original;

    const nuevoIdx = (idx + semitonos + 12) % 12;
    const nuevaEN = notasEN[nuevoIdx];
    return mapaENtoES[nuevaEN] || nuevaEN;
}

// ===============================
// TRANSPONER CANCIÓN
// ===============================
function transponerCancion(cancion, semitonos) {
    const contenedor = document.getElementById('contenidoCancion');
    let salida = "";

    const regex = /\b((DO|RE|MI|FA|SOL|LA|SI)(#)?(m)?)\b/gi;

    cancion.lines.forEach(l => {
        let chordLine = (l.chordLine || "").replace(regex, acorde =>
            transponerAcordeES(acorde, semitonos)
        );

        salida += chordLine + "\n" + (l.lyrics || "") + "\n\n";
    });

    contenedor.textContent = salida;
}

// ===============================
// LISTA DEL DÍA
// ===============================
function configurarListaDia(file, cancion) {
    const btn = document.getElementById('btnListaDia');

    btn.addEventListener('click', () => {
        const clave = 'listaDia';
        const actual = JSON.parse(localStorage.getItem(clave) || '[]');

        if (!actual.some(x => x.file === file)) {
            actual.push({
                file,
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

    function actualizar() {
        const tonoReal = calcularTonalidadReal(original, semitonos);

        const desplazamiento = semitonos === 0
            ? ""
            : ` (${semitonos > 0 ? "+" : ""}${semitonos})`;

        spanActual.textContent = tonoReal + desplazamiento;

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

    // Reset al pulsar icono o texto
    document.getElementById('resetIcono').addEventListener('click', () => {
        semitonos = 0;
        actualizar();
    });

    document.getElementById('tonoOriginalTexto').addEventListener('click', () => {
        semitonos = 0;
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
        alert("Falta parámetro ?file=");
        return;
    }

    fetch("./canciones/" + file)
        .then(r => r.json())
        .then(cancion => {
            mostrarDatos(cancion);
            mostrarContenido(cancion);
            configurarListaDia(file, cancion);
            configurarTransposicion(cancion);
        })
        .catch(err => {
            console.error(err);
            alert("No se pudo cargar la canción");
        });
})();
