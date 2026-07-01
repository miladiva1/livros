const STORAGE_KEY = "minha-estante-br-v1";
const REMEMBER_EMAIL_KEY = "minha-estante-br-remember-email";

const firebaseConfig = {
  apiKey: "AIzaSyCp4cqQEH9DZ9-Sjynpf4vTwNiM561824M",
  authDomain: "livros-b9b5e.firebaseapp.com",
  projectId: "livros-b9b5e",
  storageBucket: "livros-b9b5e.firebasestorage.app",
  messagingSenderId: "715620704508",
  appId: "1:715620704508:web:6a3118f87ff978090cf779",
  measurementId: "G-XRMQ2WVLLW",
};

function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

const statusLabels = {
  "quero-comprar": "Quero comprar",
  lendo: "Lendo",
  "ja-li": "Já li",
  comprado: "Comprado",
};


const state = {
  books: loadLocalBooks(),
  status: "todos",
  search: "",
  publisher: "todas",
  sort: "updated-desc",
  authMode: "login",
  firebaseReady: false,
  user: null,
  remoteLoaded: false,
  unsubscribeBooks: null,
  auth: null,
  db: null,
  firebaseModules: null,
};

const els = {
  totalBooks: document.querySelector("#totalBooks"),
  wishlistBooks: document.querySelector("#wishlistBooks"),
  readBooks: document.querySelector("#readBooks"),
  priorityBooks: document.querySelector("#priorityBooks"),
  statusTabs: [...document.querySelectorAll(".status-tab")],
  signedOutPanel: document.querySelector("#signedOutPanel"),
  signedInPanel: document.querySelector("#signedInPanel"),
  accountTitle: document.querySelector("#accountTitle"),
  accountHelp: document.querySelector("#accountHelp"),
  authForm: document.querySelector("#authForm"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  rememberInput: document.querySelector("#rememberInput"),
  loginModeButton: document.querySelector("#loginModeButton"),
  createAccountButton: document.querySelector("#createAccountButton"),
  logoutButton: document.querySelector("#logoutButton"),
  userEmailText: document.querySelector("#userEmailText"),
  newBookButton: document.querySelector("#newBookButton"),
  emptyNewBookButton: document.querySelector("#emptyNewBookButton"),
  searchInput: document.querySelector("#searchInput"),
  publisherFilter: document.querySelector("#publisherFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  bookList: document.querySelector("#bookList"),
  emptyState: document.querySelector("#emptyState"),
  resultCount: document.querySelector("#resultCount"),
  formPanel: document.querySelector("#formPanel"),
  formTitle: document.querySelector("#formTitle"),
  closeFormButton: document.querySelector("#closeFormButton"),
  bookForm: document.querySelector("#bookForm"),
  bookId: document.querySelector("#bookId"),
  titleInput: document.querySelector("#titleInput"),
  authorInput: document.querySelector("#authorInput"),
  publisherInput: document.querySelector("#publisherInput"),
  statusInput: document.querySelector("#statusInput"),
  linkInput: document.querySelector("#linkInput"),
  coverInput: document.querySelector("#coverInput"),
  notesInput: document.querySelector("#notesInput"),
  priorityInput: document.querySelector("#priorityInput"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  bookTemplate: document.querySelector("#bookTemplate"),
  toast: document.querySelector("#toast"),
};

function loadLocalBooks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeBook) : [];
  } catch {
    return [];
  }
}

function normalizeBook(book) {
  return {
    id: book.id || crypto.randomUUID(),
    title: book.title || "Sem título",
    author: book.author || "Autoria não informada",
    publisher: book.publisher || "",
    status: statusLabels[book.status] ? book.status : "quero-comprar",
    link: book.link || "",
    cover: book.cover || "",
    notes: book.notes || "",
    priority: Boolean(book.priority),
    updatedAt: book.updatedAt || Date.now(),
  };
}

function saveLocalBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
}

function booksCollection() {
  const { collection } = state.firebaseModules.firestore;
  return collection(state.db, "users", state.user.uid, "books");
}

async function saveBook(book) {
  if (state.user && state.firebaseReady) {
    const { setDoc, doc } = state.firebaseModules.firestore;
    await setDoc(doc(booksCollection(), book.id), book);
    return;
  }

  const existing = state.books.some((item) => item.id === book.id);
  state.books = existing ? state.books.map((item) => (item.id === book.id ? book : item)) : [book, ...state.books];
  saveLocalBooks();
  render();
}

async function removeBook(id) {
  if (state.user && state.firebaseReady) {
    const { deleteDoc, doc } = state.firebaseModules.firestore;
    await deleteDoc(doc(booksCollection(), id));
    return;
  }

  state.books = state.books.filter((item) => item.id !== id);
  saveLocalBooks();
  render();
}

function normalize(value) {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getInitials(title) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getFilteredBooks() {
  const search = normalize(state.search);

  return state.books
    .filter((book) => state.status === "todos" || book.status === state.status)
    .filter((book) => state.publisher === "todas" || book.publisher === state.publisher)
    .filter((book) => {
      if (!search) return true;
      const haystack = normalize(`${book.title} ${book.author} ${book.publisher} ${book.notes}`);
      return haystack.includes(search);
    })
    .sort((a, b) => {
      if (state.sort === "title-asc") return a.title.localeCompare(b.title, "pt-BR");
      if (state.sort === "author-asc") return a.author.localeCompare(b.author, "pt-BR");
      if (state.sort === "priority-desc") return Number(b.priority) - Number(a.priority);
      return b.updatedAt - a.updatedAt;
    });
}

function render() {
  renderAccount();
  renderSummary();
  renderPublisherFilter();
  renderStatusTabs();
  renderBooks();
}

function renderAccount() {
  els.authForm.hidden = false;
  const creatingAccount = state.authMode === "create";

  els.accountTitle.textContent = creatingAccount ? "Criar conta" : "Entrar na conta";
  els.accountHelp.textContent = creatingAccount
    ? "Crie sua conta para salvar a lista na nuvem."
    : "Salve sua lista na nuvem e acesse em qualquer dispositivo.";
  els.loginModeButton.className = creatingAccount ? "secondary-button" : "primary-button";
  els.createAccountButton.className = creatingAccount ? "primary-button" : "secondary-button";

  if (state.user) {
    els.signedOutPanel.hidden = true;
    els.signedInPanel.hidden = false;
    els.userEmailText.textContent = state.user.email;
  } else {
    els.signedOutPanel.hidden = false;
    els.signedInPanel.hidden = true;
  }
}

function renderSummary() {
  els.totalBooks.textContent = state.books.length;
  els.wishlistBooks.textContent = state.books.filter((book) => book.status === "quero-comprar").length;
  els.readBooks.textContent = state.books.filter((book) => book.status === "ja-li").length;
  els.priorityBooks.textContent = state.books.filter((book) => book.priority).length;
}

function renderPublisherFilter() {
  const current = els.publisherFilter.value || state.publisher;
  const publishers = [...new Set(state.books.map((book) => book.publisher).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  els.publisherFilter.innerHTML = '<option value="todas">Todas</option>';
  publishers.forEach((publisher) => {
    const option = document.createElement("option");
    option.value = publisher;
    option.textContent = publisher;
    els.publisherFilter.append(option);
  });

  if (publishers.includes(current)) {
    els.publisherFilter.value = current;
  } else {
    state.publisher = "todas";
    els.publisherFilter.value = "todas";
  }
}

function renderStatusTabs() {
  els.statusTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.status === state.status);
  });
}

function renderBooks() {
  const books = getFilteredBooks();
  els.bookList.innerHTML = "";
  els.emptyState.hidden = books.length > 0;
  els.resultCount.textContent =
    books.length === 1 ? "1 livro encontrado" : `${books.length} livros encontrados`;

  books.forEach((book) => {
    const item = els.bookTemplate.content.firstElementChild.cloneNode(true);
    const cover = item.querySelector("[data-cover]");
    const initials = item.querySelector("[data-cover-initials]");
    const link = item.querySelector("[data-link]");
    const notes = item.querySelector("[data-notes]");

    item.querySelector("[data-title]").textContent = book.title;
    item.querySelector("[data-meta]").textContent = `${book.author}`;
    item.querySelector("[data-status]").textContent = statusLabels[book.status] || "Sem status";
    item.querySelector("[data-publisher]").textContent = book.publisher || "Editora não informada";

    if (book.priority) item.querySelector("[data-priority]").hidden = false;

    if (book.cover) {
      const img = document.createElement("img");
      img.src = book.cover;
      img.alt = `Capa de ${book.title}`;
      img.loading = "lazy";
      img.onerror = () => {
        img.remove();
        initials.textContent = getInitials(book.title);
      };
      cover.append(img);
    } else {
      initials.textContent = getInitials(book.title);
    }

    if (book.notes) {
      notes.hidden = false;
      notes.textContent = book.notes;
    }

    if (book.link) {
      link.href = book.link;
      item.addEventListener("click", (event) => {
        const interactive = event.target.closest("a, button, input, select, textarea, label");
        if (!interactive) window.open(book.link, "_blank", "noopener,noreferrer");
      });
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.open(book.link, "_blank", "noopener,noreferrer");
        }
      });
    } else {
      item.classList.add("no-link");
      item.removeAttribute("role");
      item.removeAttribute("tabindex");
      item.setAttribute("aria-label", `${book.title} sem link cadastrado`);
      link.classList.add("disabled");
      link.removeAttribute("href");
      link.textContent = "Sem link";
    }

    item.querySelector("[data-edit]").addEventListener("click", () => editBook(book.id));
    item.querySelector("[data-delete]").addEventListener("click", () => deleteBook(book.id));
    els.bookList.append(item);
  });
}

function openForm() {
  els.formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => els.titleInput.focus(), 220);
}

function resetForm() {
  els.bookForm.reset();
  els.bookId.value = "";
  els.statusInput.value = "quero-comprar";
  els.formTitle.textContent = "Adicionar livro";
}

function editBook(id) {
  const book = state.books.find((item) => item.id === id);
  if (!book) return;

  els.bookId.value = book.id;
  els.titleInput.value = book.title;
  els.authorInput.value = book.author;
  els.publisherInput.value = book.publisher;
  els.statusInput.value = book.status;
  els.linkInput.value = book.link;
  els.coverInput.value = book.cover;
  els.notesInput.value = book.notes;
  els.priorityInput.checked = book.priority;
  els.formTitle.textContent = "Editar livro";
  openForm();
}

async function deleteBook(id) {
  const book = state.books.find((item) => item.id === id);
  if (!book) return;

  const confirmed = confirm(`Excluir "${book.title}" da sua lista?`);
  if (!confirmed) return;

  await removeBook(id);
  showToast("Livro excluído.");
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = els.bookId.value || crypto.randomUUID();
  const book = {
    id,
    title: els.titleInput.value.trim(),
    author: els.authorInput.value.trim(),
    publisher: els.publisherInput.value.trim(),
    status: els.statusInput.value,
    link: els.linkInput.value.trim(),
    cover: els.coverInput.value.trim(),
    notes: els.notesInput.value.trim(),
    priority: els.priorityInput.checked,
    updatedAt: Date.now(),
  };

  await saveBook(book);
  showToast(els.bookId.value ? "Livro atualizado." : "Livro adicionado.");
  resetForm();
}

function clearFilters() {
  state.status = "todos";
  state.search = "";
  state.publisher = "todas";
  state.sort = "updated-desc";
  els.searchInput.value = "";
  els.publisherFilter.value = "todas";
  els.sortSelect.value = "updated-desc";
  render();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function authErrorMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "Esse e-mail já tem conta. Use Entrar.",
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/operation-not-allowed": "Ative Email/Password no Firebase Authentication.",
    "auth/unauthorized-domain": "Autorize miladiva1.github.io nos domínios do Firebase.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/network-request-failed": "Falha de conexão com o Firebase.",
  };

  return messages[code] || `Erro do Firebase: ${code || "desconhecido"}`;
}

async function initFirebase() {
  const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
  if (rememberedEmail) {
    els.emailInput.value = rememberedEmail;
    els.rememberInput.checked = true;
  }

  if (!hasFirebaseConfig()) {
    renderAccount();
    return;
  }

  try {
    const [appModule, authModule, firestoreModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js"),
    ]);

    const app = appModule.initializeApp(firebaseConfig);
    state.auth = authModule.getAuth(app);
    state.db = firestoreModule.getFirestore(app);
    state.firebaseModules = { auth: authModule, firestore: firestoreModule };
    state.firebaseReady = true;

    authModule.onAuthStateChanged(state.auth, (user) => {
      state.user = user;
      state.remoteLoaded = false;
      if (state.unsubscribeBooks) state.unsubscribeBooks();
      if (user) {
        subscribeToBooks();
      } else {
        state.books = loadLocalBooks();
        render();
      }
    });
  } catch (error) {
    state.firebaseReady = false;
    console.error(error);
    showToast("Não consegui conectar ao Firebase. Usando salvamento local.");
  }
}

function subscribeToBooks() {
  const { onSnapshot, query, orderBy } = state.firebaseModules.firestore;
  const localBooks = loadLocalBooks();

  state.unsubscribeBooks = onSnapshot(
    query(booksCollection(), orderBy("updatedAt", "desc")),
    async (snapshot) => {
      const remoteBooks = snapshot.docs.map((doc) => normalizeBook({ id: doc.id, ...doc.data() }));

      if (!state.remoteLoaded && remoteBooks.length === 0 && localBooks.length > 0) {
        await Promise.all(localBooks.map((book) => saveBook(book)));
        state.remoteLoaded = true;
        return;
      }

      state.remoteLoaded = true;
      state.books = remoteBooks;
      saveLocalBooks();
      render();
    },
    () => {
      showToast("Não consegui carregar a lista da nuvem.");
    },
  );
}

async function setAuthPersistence() {
  const { setPersistence, browserLocalPersistence, browserSessionPersistence } = state.firebaseModules.auth;
  const persistence = els.rememberInput.checked ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(state.auth, persistence);

  if (els.rememberInput.checked) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, els.emailInput.value.trim());
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}

function validateAuthInputs() {
  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailLooksValid) {
    els.emailInput.focus();
    showToast("Digite um email valido para criar a conta.");
    return false;
  }

  if (password.length < 6) {
    els.passwordInput.focus();
    showToast("Digite uma senha com pelo menos 6 caracteres.");
    return false;
  }

  return true;
}

async function signIn() {
  const { signInWithEmailAndPassword } = state.firebaseModules.auth;
  await setAuthPersistence();
  await signInWithEmailAndPassword(state.auth, els.emailInput.value.trim(), els.passwordInput.value);
  els.passwordInput.value = "";
  showToast("Login realizado.");
}

async function createAccount() {
  const { createUserWithEmailAndPassword } = state.firebaseModules.auth;
  await setAuthPersistence();
  await createUserWithEmailAndPassword(state.auth, els.emailInput.value.trim(), els.passwordInput.value);
  els.passwordInput.value = "";
  showToast("Conta criada.");
}

function setAuthMode(mode) {
  state.authMode = mode;
  renderAccount();
}

async function submitAuthAction() {
  if (!validateAuthInputs()) return;

  if (!state.firebaseReady) {
    showToast("Firebase ainda nao conectou. Recarregue a pagina e tente de novo.");
    return;
  }

  try {
    if (state.authMode === "create") {
      await createAccount();
    } else {
      await signIn();
    }
  } catch (error) {
    showToast(authErrorMessage(error));
  }
}

function bindEvents() {
  els.statusTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.status = tab.dataset.status;
      render();
    });
  });

  els.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthAction();
  });

  els.loginModeButton.addEventListener("click", async () => {
    if (state.authMode !== "login") {
      setAuthMode("login");
      return;
    }

    await submitAuthAction();
  });

  els.createAccountButton.addEventListener("click", async () => {
    if (state.authMode !== "create") {
      setAuthMode("create");
      return;
    }

    await submitAuthAction();
  });

  els.logoutButton.addEventListener("click", async () => {
    if (!state.firebaseReady) return;
    await state.firebaseModules.auth.signOut(state.auth);
    showToast("Você saiu da conta.");
  });

  els.newBookButton.addEventListener("click", () => {
    resetForm();
    openForm();
  });
  els.emptyNewBookButton.addEventListener("click", () => {
    resetForm();
    openForm();
  });
  els.closeFormButton.addEventListener("click", resetForm);
  els.cancelEditButton.addEventListener("click", resetForm);
  els.bookForm.addEventListener("submit", handleSubmit);
  els.clearFiltersButton.addEventListener("click", clearFilters);

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderBooks();
  });

  els.publisherFilter.addEventListener("change", (event) => {
    state.publisher = event.target.value;
    renderBooks();
  });

  els.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderBooks();
  });
}

async function clearLegacyCache() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

bindEvents();
render();
initFirebase();
clearLegacyCache();
