// ===============================
// CARGAR LISTA DEL DÍA
// ===============================

let lista = JSON.parse(localStorage.getItem("listaDia")) || [];
const contenedor = document.getElementById("listaCancionesDia");
const pdfContent = document.getElementById("pdfContent");

let dragIndex = null; // índice del elemento arrastrado


// ===============================
// MOSTRAR LISTA CON VISTA PREVIA + DRAG & DROP
// ===============================

async function mostrarLista() {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p>No hay canciones en la lista.</p>";
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const item = lista[i];

        // Cargar canción completa
        const res = await fetch("./canciones/" + item.file);
        const cancion = await res.json();

        const div = document.createElement("div");
        div.classList.add("item-lista");

        // Hacerlo arrastrable
        div.setAttribute("draggable", "true");
        div.dataset.index = i;

        // Eventos drag & drop
        div.addEventListener("dragstart", dragStart);
        div.addEventListener("dragover", dragOver);
        div.addEventListener("drop", dropItem);

        // Título + categoría + botón eliminar
        div.innerHTML = `
            <p><strong>${cancion.title}</strong> (${cancion.category})</p>
            <button class="eliminar" data-index="${i}">Eliminar</button>
        `;

        // Vista previa completa
        const preview = document.createElement("pre");
        preview.textContent = cancion.blocks
            .map(b => (b.chords ? b.chords + "\n" : "") + (b.lyrics || ""))
            .join("\n\n");

        div.appendChild(preview);
        contenedor.appendChild(div);
    }

    // Activar botones de eliminar
    document.querySelectorAll(".eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            eliminarCancion(idx);
        });
    });
}

mostrarLista();


// ===============================
// DRAG & DROP
// ===============================

function dragStart(e) {
    dragIndex = parseInt(e.target.dataset.index, 10);
}

function dragOver(e) {
    e.preventDefault(); // necesario para permitir drop
}

function dropItem(e) {
    const dropIndex = parseInt(e.target.closest(".item-lista").dataset.index, 10);

    if (dragIndex === dropIndex) return;

    // Reordenar array
    const moved = lista.splice(dragIndex, 1)[0];
    lista.splice(dropIndex, 0, moved);

    // Guardar
    localStorage.setItem("listaDia", JSON.stringify(lista));

    // Volver a renderizar
    mostrarLista();
}


// ===============================
// ELIMINAR CANCIÓN INDIVIDUAL
// ===============================

function eliminarCancion(index) {
    lista.splice(index, 1);
    localStorage.setItem("listaDia", JSON.stringify(lista));
    mostrarLista();
}


// ===============================
// GENERAR PDF PRO
// ===============================

document.getElementById("generarPDF").addEventListener("click", async () => {

    if (lista.length === 0) {
        alert("La lista está vacía.");
        return;
    }

    pdfContent.innerHTML = ""; // limpiar

    // ===== PORTADA =====
    const portada = document.createElement("div");
    portada.style.textAlign = "center";
    portada.style.pageBreakAfter = "always";

    const fecha = new Date().toLocaleDateString("es-ES");

    portada.innerHTML = `
        <h1>Cancionero del día</h1>
        <h3>${fecha}</h3>
    `;

    pdfContent.appendChild(portada);

    // ===== ÍNDICE =====
    const indice = document.createElement("div");
    indice.innerHTML = "<h2>Índice</h2>";

    lista.forEach((item, i) => {
        indice.innerHTML += `<p>${i + 1}. ${item.title}</p>`;
    });

    indice.style.pageBreakAfter = "always";
    pdfContent.appendChild(indice);

    // ===== CANCIONES COMPLETAS =====
    for (let i = 0; i < lista.length; i++) {
        const item = lista[i];

        const res = await fetch("./canciones/" + item.file);
        const cancion = await res.json();

        const bloque = document.createElement("div");
        bloque.style.pageBreakAfter = "always";

        bloque.innerHTML = `
            <h2>${cancion.title}</h2>
            <p><strong>Categoría:</strong> ${cancion.category}</p>
            <p><strong>Ritmo:</strong> ${cancion.rhythm}</p>
            <p><strong>Cejilla:</strong> ${cancion.capo}</p>
            <p><strong>Tonalidad:</strong> ${cancion.original_key}</p>
            <hr>
        `;

        // Añadir bloques de acordes + letra
        cancion.blocks.forEach(b => {
            const pre = document.createElement("pre");
            pre.textContent =
                (b.chords ? b.chords + "\n" : "") +
                (b.lyrics ? b.lyrics : "");
            bloque.appendChild(pre);
        });

        pdfContent.appendChild(bloque);
    }

    // ===== GENERAR PDF =====
    const opciones = {
        margin: 10,
        filename: "cancionero-del-dia.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opciones).from(pdfContent).save();
});


// ===============================
// VACIAR LISTA DEL DÍA
// ===============================

document.getElementById("vaciarLista").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres vaciar la lista del día?")) {
        localStorage.removeItem("listaDia");
        lista = [];
        mostrarLista();
    }
});
