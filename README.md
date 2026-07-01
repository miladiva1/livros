# Minha Estante BR

PWA para organizar livros nacionais, autoras brasileiras e links de compra cadastrados pela usuaria.

## O que esta versao faz

- Cadastra livros com titulo, autora, editora, status, link de compra, capa e observacoes.
- Filtra por status e editora.
- Busca por titulo, autora, editora e observacoes.
- Marca prioridade de compra.
- Abre exatamente o link cadastrado no livro.
- Salva no navegador com `localStorage` quando Firebase nao esta configurado.
- Sincroniza na nuvem com Firebase Auth + Firestore quando `firebase-config.js` esta preenchido.
- Tem login por e-mail/senha e opcao "Lembrar de mim" sem guardar senha.
- Funciona como PWA com manifest e service worker.

## Configurar banco e login

1. Crie um projeto no Firebase.
2. Ative Authentication com provedor "Email/password".
3. Crie um banco Cloud Firestore.
4. Crie um app Web no Firebase e copie o objeto `firebaseConfig`.
5. Cole os dados em `firebase-config.js`.
6. Publique novamente no GitHub Pages.

Estrutura usada no Firestore:

```text
users/{uid}/books/{bookId}
```

Regras iniciais sugeridas:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/books/{bookId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

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
