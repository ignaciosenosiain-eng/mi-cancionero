// Obtener ID de la canción desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idCancion = parseInt(urlParams.get("id"));

// Cargar JSON sin caché
fetch('canciones2.json?nocache=' + Date.now(), { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        const cancion = data.find(c => c.id === idCancion);

        if (cancion) {
            document.getElementById("titulo").innerText = cancion.titulo;
            document.getElementById("parte").innerText = cancion.parte;
            document.getElementById("tono").innerText = cancion.tono;
            document.getElementById("ritmo").innerText = cancion.ritmo;
            document.getElementById("autor").innerText = cancion.autor;

            const letraDiv = document.getElementById("letra");

            // Procesar formato de 2 líneas: acordes arriba, letra abajo
            letraDiv.innerHTML = renderDosLineas(cancion.acordes, cancion.letra);

        } else {
            document.getElementById("letra").innerText =
                "Canción no encontrada.";
        }
    })
    .catch(error => console.error("Error cargando JSON:", error));


// -----------------------------------------------------------
// FUNCIÓN PARA FORMATO DE 2 LÍNEAS (ACORDES + LETRA)
// -----------------------------------------------------------
function renderDosLineas(acordesTexto, letraTexto) {
    const acordesLineas = acordesTexto.split('\n');
    const letraLineas = letraTexto.split('\n');

    let resultado = '';

    for (let i = 0; i < letraLineas.length; i++) {
        const acordes = acordesLineas[i] || '';
        const letra = letraLineas[i] || '';

        resultado += `
            <pre class="acorde-linea">${acordes}</pre>
            <pre class="letra-linea">${letra}</pre>
        `;
    }

    return resultado;
}

