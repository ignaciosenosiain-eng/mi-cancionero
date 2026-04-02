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

            // Mostrar acordes si existen, si no mostrar letra normal
            if (cancion.acordes && cancion.acordes.trim() !== "") {
                document.getElementById("letra").innerHTML =
                    renderAcordesSobreLetra(cancion.acordes);
            } else {
                document.getElementById("letra").innerText = cancion.letra;
            }

        } else {
            document.getElementById("letra").innerText =
                "Canción no encontrada.";
        }
    })
    .catch(error => console.error("Error cargando JSON:", error));

