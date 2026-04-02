// Obtener ID de la canción desde la URL
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

            const letraDiv = document.getElementById("letra");

            // 1) Si hay acordes y letra → mostrar ambos
            if (cancion.acordes && cancion.letra) {
                letraDiv.innerHTML =
                    `<pre>${cancion.acordes}</pre><br>` +
                    `<pre>${cancion.letra}</pre>`;
            }
            // 2) Si solo hay acordes
            else if (cancion.acordes) {
                letraDiv.innerHTML = `<pre>${cancion.acordes}</pre>`;
            }
            // 3) Si solo hay letra
            else if (cancion.letra) {
                letraDiv.innerHTML = `<pre>${cancion.letra}</pre>`;
            }
            // 4) Si no hay nada
            else {
                letraDiv.innerText = "No hay letra disponible.";
            }

        } else {
            document.getElementById("letra").innerText =
                "Canción no encontrada.";
        }
    })
    .catch(error => console.error("Error cargando JSON:", error));
