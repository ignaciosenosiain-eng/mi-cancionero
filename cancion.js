async function cargarCancion() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  const res = await fetch("cancionero.json");
  const canciones = await res.json();
  const cancion = canciones[id];

  document.getElementById("titulo").textContent = cancion.title;

  const contenedor = document.getElementById("contenido");

  cancion.lines.forEach(line => {
    const divLinea = document.createElement("div");
    divLinea.className = "line";

    line.syllables.forEach(s => {
      const syl = document.createElement("div");
      syl.className = "syllable";

      const chord = document.createElement("div");
      chord.className = "chord";
      chord.textContent = s.chord || "";

      const text = document.createElement("div");
      text.className = "text";
      text.textContent = s.text;

      syl.appendChild(chord);
      syl.appendChild(text);
      divLinea.appendChild(syl);
    });

    contenedor.appendChild(divLinea);
  });
}

cargarCancion();
