# Minha Estante BR

PWA para organizar livros nacionais, autoras brasileiras e links de compra em editoras diferentes.

## O que esta versao faz

- Cadastra livros com titulo, autora, editora, status, link, capa e observacoes.
- Filtra por status e editora.
- Busca por titulo, autora, editora e observacoes.
- Marca prioridade de compra.
- Abre o link da editora ou pagina de compra.
- Salva tudo no navegador com `localStorage`.
- Exporta e importa a lista em JSON.
- Funciona como PWA com manifest e service worker.

## Como rodar

Abra `index.html` no navegador ou rode um servidor local:

```bash
python -m http.server 5173
```

Depois acesse `http://localhost:5173`.

## Como instalar no celular

Android:

- Abra o link no Chrome.
- Toque no menu do navegador.
- Escolha "Adicionar a tela inicial" ou "Instalar app".

iPhone:

- Abra o link no Safari.
- Toque em compartilhar.
- Escolha "Adicionar a Tela de Inicio".

## Proximos passos possiveis

- Publicar em Vercel, Netlify ou GitHub Pages.
- Adicionar login e sincronizacao com Firebase ou Supabase.
- Melhorar capas com upload de imagem.
- Criar listas compartilhaveis.
