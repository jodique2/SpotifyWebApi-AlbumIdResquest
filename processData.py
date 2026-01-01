"""
processData.py

Este script é responsável por:
- Ler um ficheiro JSON gerado pelo Node.js (Spotify API)
- Perguntar ao utilizador qual JSON quer processar
- Criar pastas Artista / Álbum
- Fazer download dos álbuns usando spotdl
- Evitar downloads repetidos usando um ficheiro de registo
- Fazer downloads em paralelo para maior rapidez
"""

import json
import os
import subprocess
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# =========================================================
# FUNÇÕES AUXILIARES
# =========================================================

def sanitize_folder_name(name):
    """
    Remove caracteres inválidos para nomes de pastas no Windows.
    Exemplo: :, /, ?, *, etc.
    """
    return re.sub(r'[\\/:*?"<>|]', "_", name)


def download_album(python_exe, album_url, album_dir, artist_name, album_name, lock):
    """
    Faz o download de um álbum usando spotdl.

    - Executa spotdl dentro da pasta do álbum
    - Regista o álbum como descarregado no ficheiro de log
    - Usa lock para evitar conflitos entre threads
    """
    print(f"\n🎵 A descarregar: {artist_name} - {album_name}")

    try:
        subprocess.run(
            [python_exe, "-m", "spotdl", album_url],
            cwd=album_dir,
            check=True
        )

        print(f"✅ Concluído: {artist_name} - {album_name}")

        # Atualizar ficheiro de registo (thread-safe)
        with lock:
            downloaded_log.setdefault(artist_name, []).append(album_name)
            with open(log_file, "w", encoding="utf-8") as f:
                json.dump(downloaded_log, f, indent=2, ensure_ascii=False)

    except subprocess.CalledProcessError as e:
        print(f"❌ Erro no download: {artist_name} - {album_name}")
        print(e)

# =========================================================
# CONFIGURAÇÕES (UTILIZADOR DEVE AJUSTAR AQUI)
# =========================================================

# Pasta onde estão os ficheiros JSON gerados pelo Node.js
data_dir = "data"

# Pasta final onde a música será guardada
# Estrutura final: download_root / Artista / Álbum
download_root = r"Z:\Musica"

# Caminho completo para o executável do Python
# (necessário no Windows para evitar erros)
python_exe = r"C:\Users\ruime\AppData\Local\Programs\Python\Python314\python.exe"

# Número máximo de downloads em simultâneo
max_threads = 4

# Ficheiro que guarda o registo de álbuns já descarregados
log_file = "downloaded_log.json"

# =========================================================
# PREPARAÇÃO INICIAL
# =========================================================

# Criar pasta principal de downloads, se não existir
os.makedirs(download_root, exist_ok=True)

# Carregar registo de downloads anteriores
if os.path.exists(log_file):
    with open(log_file, "r", encoding="utf-8") as f:
        downloaded_log = json.load(f)
else:
    downloaded_log = {}

# Lock para escrita segura em multi-thread
lock = threading.Lock()

# =========================================================
# ESCOLHA DO JSON A PROCESSAR
# =========================================================

json_files = [f for f in os.listdir(data_dir) if f.endswith(".json")]

if not json_files:
    print("❌ Nenhum ficheiro JSON encontrado na pasta 'data/'")
    exit()

print("📄 Ficheiros JSON disponíveis:")
for i, f in enumerate(json_files, 1):
    print(f"{i}. {f}")

choice = input("\nDigite o número do JSON que deseja descarregar: ").strip()

try:
    selected_json = json_files[int(choice) - 1]
except:
    print("❌ Escolha inválida. A sair...")
    exit()

# Ler o JSON selecionado
file_path = os.path.join(data_dir, selected_json)
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# =========================================================
# CRIAÇÃO DE PASTAS DO ARTISTA
# =========================================================

artist_name = sanitize_folder_name(data["nome_artista"])
artist_dir = os.path.join(download_root, artist_name)
os.makedirs(artist_dir, exist_ok=True)

# =========================================================
# PREPARAÇÃO DOS DOWNLOADS
# =========================================================

tasks = []

for album in data.get("albuns", []):
    album_name = sanitize_folder_name(album["nome_album"])
    album_dir = os.path.join(artist_dir, album_name)
    album_url = album.get("url_album")

    if not album_url:
        continue

    # Evitar downloads repetidos
    if (
        data["nome_artista"] in downloaded_log and
        album["nome_album"] in downloaded_log[data["nome_artista"]]
    ):
        print(f"⏭️ Já descarregado: {artist_name} - {album_name}")
        continue

    os.makedirs(album_dir, exist_ok=True)
    tasks.append(
        (python_exe, album_url, album_dir, data["nome_artista"], album["nome_album"], lock)
    )

# =========================================================
# EXECUÇÃO DOS DOWNLOADS EM PARALELO
# =========================================================

with ThreadPoolExecutor(max_workers=max_threads) as executor:
    futures = [executor.submit(download_album, *task) for task in tasks]

    for future in as_completed(futures):
        try:
            future.result()
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")

print("\n🎉 Todos os downloads concluídos!")
