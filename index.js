/**
 * index.js
 *
 * Este ficheiro:
 * - Pergunta ao utilizador o nome de um artista ou álbum
 * - Pesquisa na API do Spotify
 * - Cria um ficheiro JSON com os álbuns desse artista
 * - Chama automaticamente o script Python para descarregar
 */

import { getAccessToken, searchSpotify, getArtistAlbums } from "./spotify.js";
import readline from "node:readline";
import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

// Interface para input no terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const searchText = await ask("🔎 Pesquisa artista ou álbum: ");
  rl.close();

  if (!searchText.trim()) {
    console.log("❌ Pesquisa vazia. A sair...");
    return;
  }

  // Autenticação Spotify
  const token = await getAccessToken();

  // Pesquisa artista / álbum
  const results = await searchSpotify(searchText, token);

  // Tentativa de encontrar artista
  const artistFromSearch = results.artists.items[0];
  const artistFromAlbum = results.albums.items[0]?.artists[0];
  const artistFinal = artistFromSearch || artistFromAlbum;

  if (!artistFinal) {
    console.log("❌ Nenhum artista encontrado");
    return;
  }

  // Obter todos os álbuns do artista
  const albums = await getArtistAlbums(artistFinal.id, token);

  // Estrutura final do JSON
  const output = {
    id_artista: artistFinal.id,
    nome_artista: artistFinal.name,
    albuns: albums.map(album => ({
      id_album: album.id,
      nome_album: album.name,
      url_album: `https://open.spotify.com/album/${album.id}`,
    })),
  };

  // Criar pasta data/
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });

  // Nome do ficheiro JSON
  const fileName = `${output.nome_artista.toLowerCase().replace(/\s+/g, "_")}.json`;
  const filePath = path.join(dataDir, fileName);

  // Guardar JSON
  await fs.writeFile(filePath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n💾 JSON criado: ${filePath}`);

  // Executar script Python
  const pythonScriptPath = path.join(process.cwd(), "processData.py");

  try {
    console.log("\n🚀 A iniciar downloads com Python...");
    execSync(`python "${pythonScriptPath}"`, { stdio: "inherit" });
  } catch (err) {
    console.error("❌ Erro ao executar o script Python:", err.message);
  }
}

main();
