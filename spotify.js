import "dotenv/config";

/**
 * Obtém um token de acesso à API do Spotify
 * Usa Client Credentials Flow
 */
export async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * Pesquisa genérica no Spotify (artista ou álbum)
 */
export async function searchSpotify(query, token) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=artist,album&limit=5`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
}

/**
 * Obtém todos os álbuns de um artista
 * Inclui álbuns e singles
 * Remove duplicados no final
 */
export async function getArtistAlbums(artistId, token) {
  let url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`;
  let albums = [];

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    albums.push(...data.items);
    url = data.next;
  }

  // Remover duplicados pelo nome
  return [...new Map(albums.map(a => [a.name, a])).values()];
}
