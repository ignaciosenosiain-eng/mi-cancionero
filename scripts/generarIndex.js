// Script para generar automáticamente config/index.json
// Ejecutar con: node scripts/generarIndex.js

const fs = require('fs');
const path = require('path');

const carpetaCanciones = path.join(__dirname, '..', 'canciones');
const archivoIndex = path.join(__dirname, '..', 'config', 'index.json');

function generarIndex() {
  const archivos = fs.readdirSync(carpetaCanciones)
    .filter(f => f.endsWith('.json'));

  const songs = archivos.map(file => {
    const contenido = JSON.parse(
      fs.readFileSync(path.join(carpetaCanciones, file), 'utf8')
    );

    return {
      file: file,
      title: contenido.title || file.replace('.json', ''),
      category: contenido.category || "Sin categoría"
    };
  });

  const indexData = { songs };

  fs.writeFileSync(archivoIndex, JSON.stringify(indexData, null, 2), 'utf8');

  console.log("✔ index.json generado correctamente con", songs.length, "canciones");
}

generarIndex();
