import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import util from "node:util";

const execPromise = util.promisify(exec);

const dataDir = path.join(process.cwd(), "data");
const downloadRoot = path.join(process.cwd(), "downloadedSongs");

// <<< ALTERA AQUI o nome do JSON que queres testar >>>
const jsonFileName = "mac_miller.json";

async function main() {
  const filePath = path.join(dataDir, jsonFileName);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    const artistName = json.nome_artista.replace(/[\/\\?%*:|"<>]/g, "_");
    const artistDir = path.join(downloadRoot, artistName);

    await fs.mkdir(artistDir, { recursive: true });

    // pegar apenas o primeiro álbum
    const album = json.albuns[0];
    if (!album) {
      console.log("Nenhum álbum encontrado no JSON!");
      return;
    }

    const albumName = album.nome_album.replace(/[\/\\?%*:|"<>]/g, "_");
    const albumDir = path.join(artistDir, albumName);

    await fs.mkdir(albumDir, { recursive: true });

    console.log(`\n🎵 Baixando álbum: ${album.nome_album} de ${json.nome_artista} ${album.url_album}`);

    const { stdout, stderr } = await execPromise(`python -m spotdl ${album.url_album}`, {
        cwd: albumDir,
    });


    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log(`✅ Download concluído: ${album.nome_album}`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  console.log("\n🎉 Teste concluído!");
}

main();
