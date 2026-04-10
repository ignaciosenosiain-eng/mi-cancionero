// convertirCancion.js
// ------------------------------------------------------
// Uso:
//   node scripts/convertirCancion.js archivo.txt
// ------------------------------------------------------

const fs = require("fs");

// -------------------------------------------
// Función principal de conversión
// -------------------------------------------
function convertirCancion(txtBruto) {
    // 1. Normalizar saltos de línea
    let txt = txtBruto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 2. Convertir tabs a 4 espacios
    txt = txt.replace(/\t+/g, "    ");

    // 3. Extraer cejilla: (C-2)
    let cejilla = 0;
    const cejillaMatch = txt.match(/\(C-?(\d+)\)/i);
    if (cejillaMatch) {
        cejilla = parseInt(cejillaMatch[1], 10);
        txt = txt.replace(/\(C-?\d+\)/i, "");
    }

    // 4. Extraer metadatos (# TÍTULO:, # CATEGORÍA:, # RITMO:)
    function extraerCampo(nombre) {
        const regex = new RegExp(`# ${nombre}:\\s*([\\s\\S]*?)(?=#|$)`, "i");
        const match = txt.match(regex);
        if (!match) return "";
        return match[1].trim().split("\n")[0].trim();
    }

    const title = extraerCampo("TÍTULO");
    const category = extraerCampo("CATEGORÍA");
    const ritmo = extraerCampo("RITMO");

    // 5. Extraer solo el contenido después de "# CONTENIDO:"
    const contenidoMatch = txt.split("# CONTENIDO:")[1];
    if (!contenidoMatch) {
        console.error("ERROR: No se encontró '# CONTENIDO:' en el archivo.");
        process.exit(1);
    }

    let contenido = contenidoMatch
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // 6. Regex de acordes en notación española
    const regexAcorde = /^(DO|RE|MI|FA|SOL|LA|SI)(m|m7|7|maj7|sus4|dim|aug|#|b)?$/i;

    // 7. Detectar tonalidad original por el primer acorde válido
    let originalKey = "DO";
    for (const linea of contenido) {
        const partes = linea.split(/\s+/);
        if (partes.every(p => regexAcorde.test(p))) {
            originalKey = partes[0].toUpperCase();
            break;
        }
    }

    // 8. Procesar contenido en pares acorde/letra
    const lines = [];
    for (let i = 0; i < contenido.length; i++) {
        const linea = contenido[i];
        const partes = linea.split(/\s+/);

        if (partes.every(p => regexAcorde.test(p))) {
            const chordLine = partes.join("    ");
            const lyrics = contenido[i + 1] || "";
            lines.push({ chordLine, lyrics });
            i++;
        }
    }

    // 9. Construir JSON final
    return {
        title,
        category,
        ritmo,
        cejilla,
        originalKey,
        lines
    };
}

// -------------------------------------------
// LECTURA DEL ARCHIVO DESDE CONSOLA
// -------------------------------------------
const archivo = process.argv[2];

if (!archivo) {
    console.error("Uso: node scripts/convertirCancion.js archivo.txt");
    process.exit(1);
}

const txtBruto = fs.readFileSync(archivo, "utf8");
const json = convertirCancion(txtBruto);

console.log(JSON.stringify(json, null, 4));
