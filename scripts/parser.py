import re
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT_DIR = ROOT / "data_parsed"
OUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------
# REGEX ROBUSTO PARA ACORDES (LATINOS + ANGLOSAJONES)
# ---------------------------------------------------------
CHORD_REGEX = re.compile(
    r"""
    ^\(?                                
    (?:
        # nombres latinos completos con sostenido/bemol
        (?:do|re|mi|fa|sol|la|si)(?:[#b])? |
        (?:DO|RE|MI|FA|SOL|LA|SI)(?:[#b])? |

        # acordes latinos abreviados: sim, mim, lam, rem, dom
        (?:[sSmMlLrRdD][iI][mM]?) |

        # nombres anglosajones
        [A-Ga-g][#b]?
    )
    (?:/[A-Ga-g][#b]?)?                 

    # acordes compuestos: sim-SOL-FA#-
    (?:-
        (?:
            (?:do|re|mi|fa|sol|la|si)(?:[#b])? |
            (?:DO|RE|MI|FA|SOL|LA|SI)(?:[#b])? |
            [A-Ga-g][#b]?
        )
    )*
    -?                                   

    (?:↓)?                              
    \)?                                 
    $                                   
    """,
    re.VERBOSE
)

# ---------------------------------------------------------
# NORMALIZACIÓN DE TOKENS DE ACORDES
# ---------------------------------------------------------
def normalize_chord_token(token: str):
    token = token.strip("()")
    parts = [p for p in re.split(r"[-]+", token) if p]
    return parts

def is_chord_token(token: str) -> bool:
    token = token.strip()
    if not token:
        return False
    return bool(CHORD_REGEX.match(token))

def is_chord_line(line: str) -> bool:
    raw_tokens = line.strip().split()
    if not raw_tokens:
        return False

    tokens = []
    for t in raw_tokens:
        tokens.extend(normalize_chord_token(t))

    return all(is_chord_token(tok) for tok in tokens)

# ---------------------------------------------------------
# PARSER PRINCIPAL (IGNORA LÍNEAS VACÍAS ENTRE ACORDES Y LETRA)
# ---------------------------------------------------------
def parse_file(path: Path):
    lines = path.read_text(encoding="cp1252").splitlines()

    result = {
        "title": lines[0].strip(),
        "sections": [
            {
                "type": "default",
                "lines": []
            }
        ]
    }

    section = result["sections"][0]
    i = 1  # empezamos después del título

    while i < len(lines):
        line = lines[i].rstrip()

        # Saltar líneas vacías
        if not line.strip():
            i += 1
            continue

        # Si es línea de acordes
        if is_chord_line(line):
            chords_raw = line.strip().split()

            # Buscar la siguiente línea NO vacía
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1

            if j < len(lines):
                lyric_line = lines[j].strip()
                lyrics_tokens = lyric_line.split()
            else:
                lyrics_tokens = []

            # Normalizar acordes compuestos
            chords = []
            for token in chords_raw:
                chords.extend(normalize_chord_token(token))

            section["lines"].append({
                "lyrics": lyrics_tokens,
                "chords": chords
            })

            i = j + 1
            continue

        # Si es letra normal
        section["lines"].append({
            "lyrics": line.split(),
            "chords": ["" for _ in line.split()]
        })

        i += 1

    return result

# ---------------------------------------------------------
# EJECUCIÓN PRINCIPAL
# ---------------------------------------------------------
def main():
    print("EJECUTANDO EL PARSER CORRECTO")

    for path in DATA_DIR.glob("*.txt"):
        song = parse_file(path)
        out_path = OUT_DIR / (path.stem + ".json")
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(song, f, ensure_ascii=False, indent=2)
        print(f"Parsed {path.name} -> {out_path.name}")

if __name__ == "__main__":
    main()
