# Minha Estante

PWA para organizar livros e links de compra cadastrados pela usuaria.

Site publicado: https://miladiva1.github.io/livros/

Repositorio: https://github.com/miladiva1/livros

## O que esta versao faz

- Cadastra livros com titulo, autora, editora, status, link de compra, capa e observacoes.
- Filtra por status e editora.
- Busca por titulo, autora, editora e observacoes.
- Marca prioridade de compra.
- Abre exatamente o link cadastrado no livro.
- Salva no navegador com `localStorage` quando Firebase nao esta configurado.
- Sincroniza na nuvem com Firebase Auth + Firestore.
- Tem login por e-mail/senha e opcao "Lembrar de mim" sem guardar senha.
- Funciona como PWA com manifest e service worker.

## Como rodar localmente

1. Clone o repositorio:

```bash
git clone https://github.com/miladiva1/livros.git
```

2. Entre na pasta do projeto:

```bash
cd livros
```

3. Rode um servidor local:

```bash
python -m http.server 5173
```

4. Abra no navegador:

```text
http://localhost:5173
```

Tambem e possivel abrir o arquivo `index.html` direto no navegador, mas usar um servidor local evita diferencas de comportamento entre navegadores.

## Configurar banco e login

1. Crie um projeto no Firebase.
2. Ative Authentication com provedor "Email/password".
3. Crie um banco Cloud Firestore.
4. Crie um app Web no Firebase e copie o objeto `firebaseConfig`.
5. Cole os dados no topo de `app.js`, se precisar trocar de projeto Firebase.
6. Publique novamente no GitHub Pages.
7. Em Authentication, adicione `miladiva1.github.io` aos dominios autorizados.

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

## Proximos passos possiveis

- Melhorar capas com upload de imagem.
- Criar listas compartilhaveis.
- Adicionar recuperacao de senha.
- Criar filtros por genero ou categoria.
