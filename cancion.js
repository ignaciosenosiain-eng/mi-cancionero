// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

// Cargar canciones
fetch("canciones.json")
    .then(res => res.json())
    .then(data => {
        const cancion = data.find(c => c.id === id);
        mostrarCancion(cancion);
    });

function mostrarCancion(c) {
    document.getElementById("titulo").textContent = c.titulo;
    document.getElementById("parte").textContent = c.parte;
    document.getElementById("tono").textContent = c.tono;
    document.getElementById("ritmo").textContent = c.ritmo;
    document.getElementById("autor").textContent = c.autor;
    document.getElementById("acordes").textContent = c.acordes;
    document.getElementById("letra").textContent = c.letra;
}
