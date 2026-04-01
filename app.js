// Cargar canciones desde el JSON
fetch("canciones.json")
    .then(res => res.json())
    .then(data => {
        window.canciones = data;
        mostrarCanciones(data);
    });

// Mostrar canciones en la lista
function mostrarCanciones(lista) {
    const ul = document.getElementById("lista-canciones");
    ul.innerHTML = "";

    lista.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c.titulo;
        ul.appendChild(li);
    });
}

// Buscador básico
document.getElementById("buscador").addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();
    const filtradas = canciones.filter(c =>
        c.titulo.toLowerCase().includes(texto)
    );
    mostrarCanciones(filtradas);
});
