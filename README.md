# spotify-album-fetcher

Ferramenta em **Node.js + Python** que permite pesquisar artistas no Spotify,
exportar os seus metadados para JSON e descarregar automaticamente os álbuns completos
utilizando **spotDL**.

O objetivo do projeto é facilitar a **organização de bibliotecas musicais pessoais**
(e.g. Jellyfin, Plex), mantendo uma estrutura clara por artista e álbum.

## Funcionalidades

- Pesquisa de **artistas** através da Spotify Web API
- Geração automática de ficheiros **JSON** com:
  - ID do artista
  - Nome do artista
  - Lista de álbuns (ID, nome e URL do Spotify)
- Download de álbuns completos através do **spotDL**
- Organização automática: Artista / Álbum / músicas
- Downloads em paralelo
- Evita downloads duplicados através de um ficheiro de registo

## Estrutura do Projeto

```text
spotify-album-fetcher/
├── index.js              # Pesquisa no Spotify e criação dos JSON
├── spotify.js            # Funções de acesso à Spotify Web API
├── processData.py        # Download dos álbuns com spotDL
│
├── data/                 # JSONs gerados (1 por artista)
│   └── mac_miller.json
│
├── downloaded_log.json   # Registo de álbuns já descarregados
├── .env                  # Credenciais da Spotify API (não fazer commit)
├── package.json
└── README.md
```

## Requisitos

### Node.js
- Node.js **18 ou superior** (necessário para `fetch` nativo)

### Python
- Python **3.10 ou superior**
- spotDL instalado:

```bash
pip install spotdl
```

### Spotify Developer Account

Criar uma aplicação em:
https://developer.spotify.com/dashboard

### Configuração do .env

Criar um ficheiro `.env` na raiz do projeto:

```env
SPOTIFY_CLIENT_ID=coloca_aqui_o_teu_client_id
SPOTIFY_CLIENT_SECRET=coloca_aqui_o_teu_client_secret
```

**Nunca faças commit do ficheiro `.env`**

## Utilização

### 1. Instalar dependências Node.js

```bash
npm install
```

### 2. Criar o ficheiro JSON do artista

```bash
npm start
```

O programa pede um termo de pesquisa. Exemplo:

```text
Pesquisa artista ou álbum: Mac Miller
```

Será criado automaticamente:

```text
data/
└── mac_miller.json
```

Se inserires o nome de um álbum, o script identifica o artista associado
e cria o ficheiro JSON seguindo a mesma lógica.

### 3. Descarregar os álbuns

Após a criação do JSON, o script Python é executado automaticamente.

Também é possível executar apenas o Python:

```bash
python processData.py
```

O script pergunta qual o ficheiro JSON a processar.

## Organização dos downloads

Os ficheiros são organizados da seguinte forma:

```text
Z:\Musica/
└── Mac Miller/
    └── GO_OD AM (10th Anniversary)/
        ├── 01 - Intro.mp3
        ├── 02 - Doors.mp3
        └── ...
```

O diretório raiz de downloads pode ser alterado no ficheiro `processData.py`.

## Downloads em paralelo

O script Python utiliza `ThreadPoolExecutor` para descarregar vários álbuns
ao mesmo tempo.

Configuração:

```python
max_threads = 4
```

## Evitar downloads duplicados

O ficheiro:

```text
downloaded_log.json
```

Guarda os artistas e álbuns já descarregados.
Se um álbum já existir no log, não será descarregado novamente.

## Notas importantes

- Este projeto não faz bypass de DRM
- O spotDL utiliza fontes públicas (ex.: YouTube)
- Destinado apenas a uso pessoal e educativo
- Respeita sempre os termos do Spotify

## Licença

Este projeto está licenciado sob a licença **MIT**.
Consulta o ficheiro `LICENSE` para mais informações.

## Contribuições

Contribuições são bem-vindas.

Sugestões de melhoria:

- Interface CLI não-interativa
- Suporte a playlists
- Melhor sistema de logs
- Dockerização
