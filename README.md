# Minha Estante BR

PWA para organizar livros nacionais, autoras brasileiras e links de anúncios da Amazon.

## O que esta versao faz

- Cadastra livros com titulo, autora, editora, status, link da Amazon, capa e observacoes.
- Filtra por status e editora.
- Busca por titulo, autora, editora e observacoes.
- Marca prioridade de compra.
- Abre o anúncio da Amazon ao clicar no livro ou no botão "Abrir anúncio".
- Salva tudo no navegador com `localStorage`.
- Funciona como PWA com manifest e service worker.

## Como rodar

Abra `index.html` no navegador ou rode um servidor local:

```bash
python -m http.server 5173
```

Depois acesse `http://localhost:5173`.

## Proximos passos possiveis

- Publicar em Vercel, Netlify ou GitHub Pages.
- Adicionar login e sincronizacao com Firebase ou Supabase.
- Melhorar capas com upload de imagem.
- Criar listas compartilhaveis.
