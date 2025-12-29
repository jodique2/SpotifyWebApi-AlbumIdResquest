import json
import os
import subprocess
import re

# função para limpar nomes de pastas
def sanitize_folder_name(name):
    return re.sub(r'[\\/:*?"<>|]', "_", name)

json_file_name = "mac_miller.json"
data_dir = "data"
download_root = "downloadedSongs"

# ler JSON
file_path = os.path.join(data_dir, json_file_name)
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

artist_name = sanitize_folder_name(data["nome_artista"])
artist_dir = os.path.join(download_root, artist_name)
os.makedirs(artist_dir, exist_ok=True)

album = data["albuns"][0]
album_name = sanitize_folder_name(album["nome_album"])
album_dir = os.path.join(artist_dir, album_name)
os.makedirs(album_dir, exist_ok=True)

print(f"\n🎵 Baixando álbum: {album['nome_album']} de {data['nome_artista']}")

# usar o caminho absoluto do Python se necessário
python_exe = r"C:\Users\ruime\AppData\Local\Programs\Python\Python314\python.exe"

url = album["url_album"]
subprocess.run([python_exe, "-m", "spotdl", url], cwd=album_dir, check=True)

print("\n🎉 Teste concluído!")
