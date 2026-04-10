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

    // Detecta acordes tipo DO, RE, MI, FA#, SOLm, etc.
    const regexAcorde = /\b([A-G][#b]?)(m?)\b/i;

    for (const linea of lineas) {
        if (!linea.chordLine) continue;

        const match = linea.chordLine.match(regexAcorde);
        if (!match) continue;

        let nota = match[1].toUpperCase(); // DO, RE, MI...
        let menor = match[2] === 'm';

        // Relativas menores → mayores
        const relativas = {
            "A": "C",   // lam → DO
            "D": "F",   // rem → FA
            "E": "G",   // mim → SOL
            "B": "D",   // sim → RE
            "F#": "A",  // fa#m → LA
            "C#": "E"   // do#m → MI
        };

        if (menor) {
            return relativas[nota] || nota;
        }

        return nota;
    }

    return ""; // si no hay acordes
}

// ===============================
// MOSTRAR DATOS BÁSICOS
// ===============================
function mostrarDatos(cancion) {
    const categoria = cancion.category || "—";
    const ritmo = cancion.ritmo || "—";
    const cejilla = (cancion.cejilla ?? 0);

    // Si no hay tonalidad en JSON → inferirla
    const original = cancion.originalKey || inferirTonalidad(cancion) || "—";

    document.getElementById('tituloCancion').textContent = cancion.title || '';
    document.get
