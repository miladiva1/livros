const STORAGE_KEY = "minha-estante-br-v1";

const statusLabels = {
  "quero-comprar": "Quero comprar",
  lendo: "Lendo",
  "ja-li": "Já li",
  comprado: "Comprado",
};

const sampleBooks = [
  {
    id: crypto.randomUUID(),
    title: "Um defeito de cor",
    author: "Ana Maria Gonçalves",
    publisher: "Record",
    status: "quero-comprar",
    link: "https://www.record.com.br/",
    cover: "",
    notes: "Exemplo inicial para testar a lista.",
    priority: true,
    updatedAt: Date.now() - 1000,
  },
  {
    id: crypto.randomUUID(),
    title: "Quarto de despejo",
    author: "Carolina Maria de Jesus",
    publisher: "Ática",
    status: "ja-li",
    link: "https://www.atica.com.br/",
    cover: "",
    notes: "Manter na lista de lidos.",
    priority: false,
    updatedAt: Date.now() - 2000,
  },
  {
    id: crypto.randomUUID(),
    title: "Torto arado",
    author: "Itamar Vieira Junior",
    publisher: "Todavia",
    status: "comprado",
    link: "https://todavialivros.com.br/",
    cover: "",
    notes: "",
    priority: false,
    updatedAt: Date.now() - 3000,
  },
];

const state = {
  books: loadBooks(),
  status: "todos",
  search: "",
  publisher: "todas",
  sort: "updated-desc",
  deferredPrompt: null,
};

const els = {
  totalBooks: document.querySelector("#totalBooks"),
  wishlistBooks: document.querySelector("#wishlistBooks"),
  readBooks: document.querySelector("#readBooks"),
  priorityBooks: document.querySelector("#priorityBooks"),
  statusTabs: [...document.querySelectorAll(".status-tab")],
  installButton: document.querySelector("#installButton"),
  exportButton: document.querySelector("#exportButton"),
  importFile: document.querySelector("#importFile"),
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

function loadBooks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return sampleBooks;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : sampleBooks;
  } catch {
    return sampleBooks;
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
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
  renderSummary();
  renderPublisherFilter();
  renderStatusTabs();
  renderBooks();
}

function renderSummary() {
  els.totalBooks.textContent = state.books.length;
  els.wishlistBooks.textContent = state.books.filter((book) => book.status === "quero-comprar").length;
  els.readBooks.textContent = state.books.filter((book) => book.status === "ja-li").length;
  els.priorityBooks.textContent = state.books.filter((book) => book.priority).length;
}

function renderPublisherFilter() {
  const current = els.publisherFilter.value || state.publisher;
  const publishers = [...new Set(state.books.map((book) => book.publisher).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

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
    } else {
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

function deleteBook(id) {
  const book = state.books.find((item) => item.id === id);
  if (!book) return;

  const confirmed = confirm(`Excluir "${book.title}" da sua lista?`);
  if (!confirmed) return;

  state.books = state.books.filter((item) => item.id !== id);
  saveBooks();
  render();
  showToast("Livro excluído.");
}

function handleSubmit(event) {
  event.preventDefault();

  const id = els.bookId.value || crypto.randomUUID();
  const existing = state.books.find((book) => book.id === id);
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

  if (existing) {
    state.books = state.books.map((item) => (item.id === id ? book : item));
    showToast("Livro atualizado.");
  } else {
    state.books = [book, ...state.books];
    showToast("Livro adicionado.");
  }

  saveBooks();
  resetForm();
  render();
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

function exportBooks() {
  const blob = new Blob([JSON.stringify(state.books, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "minha-estante-br.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Lista exportada.");
}

function importBooks(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Formato inválido");

      state.books = imported.map((book) => ({
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
      }));
      saveBooks();
      clearFilters();
      showToast("Lista importada.");
    } catch {
      showToast("Não consegui importar esse arquivo.");
    }
  };
  reader.readAsText(file);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function bindEvents() {
  els.statusTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.status = tab.dataset.status;
      render();
    });
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
  els.exportButton.addEventListener("click", exportBooks);
  els.importFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importBooks(file);
    event.target.value = "";
  });

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

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    els.installButton.hidden = false;
  });

  els.installButton.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    els.installButton.hidden = true;
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

bindEvents();
render();
