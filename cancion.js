// Obtener parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const idCancion = parseInt(urlParams.get("id"));

// Cargar JSON sin caché
fetch('canciones.json?nocache=' + Date.now(), { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        const cancion = data.find(c => c.id === idCancion);

        if (cancion) {
            document.getElementById("titulo").innerText = cancion.titulo;
            document.getElementById("parte").innerText = cancion.parte;
            document.getElementById("tono").innerText = cancion.tono;
            document.getElementById("ritmo").innerText = cancion.ritmo;
            document.getElementById("autor").innerText = cancion.autor;

            // Mostrar acordes sobre la letra
            document.getElementById("letra").innerHTML =
                renderAcordesSobreLetra(cancion.acordes);
        } else {
            document.getElementById("letra").innerText =
                "Canción no encontrada.";
        }
    })
    .catch(error => console.error("Error cargando JSON:", error));


// -----------------------------------------------------------
// FUNCIÓN PARA MOSTRAR ACORDES ENCIMA DE LA LETRA
// -----------------------------------------------------------
function renderAcordesSobreLetra(texto) {
    const lineas = texto.split('\n');
    let resultado = '';

    lineas.forEach(linea => {
        const acordes = [];
        let letraLimpia = linea.replace(/

\[([^\]

]+)\]

/g, (match, acorde, offset) => {
            acordes.push({ acorde, offset });
            return '';
        });

        // Construir línea de acordes
        let lineaAcordes = '';
        let pos = 0;

        acordes.forEach(a => {
            while (pos < a.offset) {
                lineaAcordes += ' ';
                pos++;
            }
            lineaAcordes += a.acorde;
            pos += a.acorde.length;
        });

        resultado += `<pre class="acorde-linea">${lineaAcordes}</pre>`;
        resultado += `<pre class="letra-linea">${letraLimpia}</pre>`;
    });

    return resultado;
}
