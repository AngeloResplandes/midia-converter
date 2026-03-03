# 🎬 Mídia Converter

Conversor de mídia **full-stack** que roda 100% em memória — sem salvar arquivos no disco. Converte imagens para **WebP** e comprime vídeos para **H.264/MP4** diretamente no navegador.

![Bun](https://img.shields.io/badge/Bun-1.x-black?style=flat&logo=bun&logoColor=white&labelColor=111&color=fbf0df)
![React](https://img.shields.io/badge/React-19-20232a?style=flat&logo=react&logoColor=61DAFB&labelColor=20232a&color=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white&labelColor=3178C6&color=007ACC)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-0f172a?style=flat&logo=tailwindcss&logoColor=38bdf8&labelColor=0f172a&color=38bdf8)
![Sharp](https://img.shields.io/badge/Sharp-0.34-1a1a1a?style=flat&logo=sharp&logoColor=white&labelColor=1a1a1a&color=99cc00)
![FFmpeg](https://img.shields.io/badge/FFmpeg-5.3-171717?style=flat&logo=ffmpeg&logoColor=green&labelColor=171717&color=3cb371)
![Lucide](https://img.shields.io/badge/Lucide_React-0.575-1a1a1a?style=flat&labelColor=1a1a1a&color=f56565)

## Funcionalidades

- 🖼️ **Conversão de imagens** — JPG, JPEG, PNG, GIF (animado), TIFF, BMP, AVIF → WebP (qualidade 90)
- 🎥 **Compressão de vídeos** — MP4, MOV, MKV, AVI, WEBM → H.264/MP4 (CRF 30, max 1080p)
- ⚡ Upload e conversão em paralelo com polling de progresso em tempo real
- 📥 Download individual ou de todos os arquivos convertidos de uma vez
- 👁️ Preview inline no navegador antes de baixar
- 🗑️ Exclusão individual ou limpeza total dos jobs
- 🧠 100% em memória — nenhum arquivo é salvo no projeto

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime / Servidor | [Bun](https://bun.sh) |
| Frontend | React 19 + TypeScript |
| Estilização | Tailwind CSS v4 |
| Conversão de imagens | [Sharp](https://sharp.pixelplumbing.com) |
| Conversão de vídeos | [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) + ffmpeg-static |
| Ícones | [Lucide React](https://lucide.dev) |

## Como rodar

### Pré-requisitos

- [Bun](https://bun.sh) instalado (`>= 1.0`)

### Instalação

```bash
bun install
```

### Desenvolvimento (com HMR)

```bash
bun dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

### Produção

```bash
bun start
```

### Build estático

```bash
bun run build
```

Os arquivos são gerados na pasta `dist/`.

## Estrutura do Projeto

```
src/
├── index.ts              # Servidor Bun — rotas REST
├── index.html            # HTML raiz
├── frontend.tsx          # Entrypoint React
├── App.tsx               # Roteamento client-side (hash-based)
│
├── server/
│   ├── jobs.ts           # Store in-memory de jobs + helpers
│   ├── convert-webp.ts   # Conversão de imagens via Sharp
│   └── compress-video.ts # Compressão de vídeos via ffmpeg
│
├── hooks/
│   └── useConverter.ts   # Hook: upload, polling, download, delete
│
├── components/
│   ├── converters/
│   │   ├── ConverterPage.tsx   # Layout compartilhado de conversão
│   │   ├── ImageConverter.tsx  # Configuração para imagens
│   │   └── VideoConverter.tsx  # Configuração para vídeos
│   ├── pages/
│   │   └── LandingPage.tsx     # Página inicial
│   └── ui/
│       ├── Navbar.tsx
│       ├── FileItem.tsx        # Item de arquivo com progresso e menu
│       └── ...                 # Componentes base (button, input, select…)
│
├── types/
│   ├── job.ts            # Tipos: Job (server) e FileJob (client)
│   └── components.ts     # Tipos de props dos componentes
│
└── styles/
    ├── index.css         # Fontes, scrollbar e animações customizadas
    └── globals.css       # Variáveis CSS e Tailwind base
```

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/upload` | Envia arquivos e cria jobs em memória |
| `POST` | `/api/convert` | Inicia a conversão dos IDs informados |
| `GET` | `/api/status?ids=...` | Retorna status e progresso dos jobs |
| `GET` | `/api/download/:id` | Download do arquivo convertido |
| `GET` | `/api/preview/:id` | Preview inline (mantém o buffer) |
| `DELETE` | `/api/delete/:id` | Remove o job e libera a memória |
| `POST` | `/api/clear` | Remove todos os jobs |

## Parâmetros de Conversão

### Imagens (Sharp)
- Formato de saída: **WebP**
- Qualidade: `90` | Effort: `6`
- GIFs animados: preservados com todos os frames
- EXIF orientation: corrigido automaticamente

### Vídeos (ffmpeg)
- Codec: **libx264** | Áudio: **AAC @ 96k**
- CRF: `30` | Preset: `slower`
- Resolução máxima: **1920×1080** (downscale automático de 4K/2K)
- Bitrate máximo: `1.5M` | Buffer: `3M`
- Flag `-movflags +faststart` para streaming otimizado
- I/O via `os.tmpdir()` — arquivos temporários removidos imediatamente após leitura
