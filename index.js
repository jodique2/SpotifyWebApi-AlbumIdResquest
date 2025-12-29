import {
  getAccessToken,
  searchSpotify,
  getArtistAlbums,
} from "./spotify.js";

import readline from "node:readline";
import fs from "node:fs/promises";
import path from "node:path";

// criar interface do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const searchText = await ask("🔎 Pesquisa artista ou álbum: ");

  if (!searchText.trim()) {
    console.log("Pesquisa vazia. A sair...");
    rl.close();
    return;
  }

  const token = await getAccessToken();
  const results = await searchSpotify(searchText, token);

  const artistFromSearch = results.artists.items[0];
  const artistFromAlbum = results.albums.items[0]?.artists[0];
  const artistFinal = artistFromSearch || artistFromAlbum;

  if (!artistFinal) {
    console.log("Nenhum resultado encontrado");
    rl.close();
    return;
  }

  const albums = await getArtistAlbums(artistFinal.id, token);

  // JSON FINAL FORMATADO
  const output = {
    id_artista: artistFinal.id,
    nome_artista: artistFinal.name,
    albuns: albums.map(album => ({
      id_album: album.id,
      nome_album: album.name,
    })),
  };

  // imprimir JSON bonito
  console.log(JSON.stringify(output, null, 2));

  // criar pasta data se não existir
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });

  // nome do ficheiro
  const fileName = `${output.nome_artista
    .toLowerCase()
    .replace(/\s+/g, "_")}.json`;

  const filePath = path.join(dataDir, fileName);

  // escrever ficheiro
  await fs.writeFile(filePath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n💾 Guardado em: ${filePath}`);

  rl.close();
}

main();
