const STORAGE_KEYS = {
    books: "ipmkn.lab5.books",
    theme: "ipmkn.lab5.theme",
    hidden: "ipmkn.lab5.booksHidden"
};

const BOOK_POOL = [
    { title: "Мастер и Маргарита", author: "Михаил Булгаков", cover: "images/cover-1.svg", done: true },
    { title: "Тайная история", author: "Донна Тартт", cover: "images/cover-2.svg", done: false },
    { title: "Сто лет одиночества", author: "Габриэль Гарсиа Маркес", cover: "images/cover-3.svg", done: true },
    { title: "Книжный вор", author: "Маркус Зусак", cover: "images/cover-4.svg", done: false },
    { title: "Имя розы", author: "Умберто Эко", cover: "images/cover-1.svg", done: false },
    { title: "Дом, в котором…", author: "Мариам Петросян", cover: "images/cover-2.svg", done: false },
    { title: "451° по Фаренгейту", author: "Рэй Брэдбери", cover: "images/cover-3.svg", done: false },
    { title: "Портрет Дориана Грея", author: "Оскар Уайльд", cover: "images/cover-4.svg", done: false }
];

const DEFAULT_BOOKS = BOOK_POOL.slice(0, 4);

function cloneBook(book) {
    return { title: book.title, author: book.author, cover: book.cover, done: book.done };
}

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error("Элемент #" + id + " не найден на странице");
    }
    return element;
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn("localStorage недоступен для чтения:", error);
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("Не удалось сохранить данные в localStorage:", error);
        return false;
    }
}

function isBook(value) {
    return value !== null
        && typeof value === "object"
        && typeof value.title === "string"
        && value.title.trim() !== ""
        && typeof value.author === "string"
        && typeof value.cover === "string"
        && typeof value.done === "boolean";
}

function loadBooks() {
    const raw = readStorage(STORAGE_KEYS.books);
    if (raw === null) {
        return DEFAULT_BOOKS.map(cloneBook);
    }
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error("в localStorage ожидался массив книг");
        }
        return parsed.filter(isBook).map(cloneBook);
    } catch (error) {
        console.warn("Сохранённые книги повреждены, загружен набор по умолчанию:", error);
        return DEFAULT_BOOKS.map(cloneBook);
    }
}

const themeToggleButton = getElement("theme-toggle");
const booksTitle = document.querySelector("#books h2");
const booksList = getElement("books-list");
const booksBody = getElement("books-body");
const booksEmpty = getElement("books-empty");
const addBookButton = getElement("add-book");
const removeBookButton = getElement("remove-book");
const toggleBooksButton = getElement("toggle-books");
const checkElementsButton = getElement("check-elements");

let books = loadBooks();

function saveBooks() {
    writeStorage(STORAGE_KEYS.books, JSON.stringify(books));
}

function saveHiddenState(hidden) {
    writeStorage(STORAGE_KEYS.hidden, hidden ? "true" : "false");
}

function applyBookState(button, book) {
    button.textContent = book.done ? "Прочитано" : "В процессе";
    button.classList.toggle("status--done", book.done);
    button.classList.toggle("status--progress", !book.done);
    button.setAttribute("aria-pressed", String(book.done));
    button.setAttribute("title", book.done ? "Отметить как непрочитанную" : "Отметить как прочитанную");
}

function toggleBook(button, index) {
    const book = books[index];
    if (!book) {
        console.warn("Книга с индексом " + index + " не найдена");
        return;
    }
    book.done = !book.done;
    applyBookState(button, book);
    saveBooks();
}

function createCard(book, index) {
    const card = document.createElement("article");
    card.className = "book-card";
    card.setAttribute("data-index", String(index));
    card.setAttribute("data-title", book.title);

    const cover = document.createElement("figure");
    cover.className = "book-cover";

    const image = document.createElement("img");
    image.setAttribute("src", book.cover);
    image.setAttribute("alt", "Обложка книги «" + book.title + "»");
    image.setAttribute("loading", "lazy");
    cover.appendChild(image);

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const status = document.createElement("button");
    status.type = "button";
    status.className = "status book-status";
    applyBookState(status, book);
    status.addEventListener("click", function () {
        toggleBook(status, index);
    });

    info.appendChild(title);
    info.appendChild(author);
    info.appendChild(status);
    card.appendChild(cover);
    card.appendChild(info);
    return card;
}

function updateShelfState() {
    const cards = booksList ? booksList.querySelectorAll(".book-card") : [];
    if (booksTitle) {
        booksTitle.textContent = "Книги на полке (" + cards.length + ")";
    }
    if (booksEmpty) {
        booksEmpty.hidden = cards.length > 0;
    }
    if (removeBookButton) {
        removeBookButton.disabled = cards.length === 0;
    }
}

function renderBooks() {
    if (!booksList) {
        return;
    }
    while (booksList.firstChild) {
        booksList.removeChild(booksList.firstChild);
    }
    books.forEach(function (book, index) {
        booksList.appendChild(createCard(book, index));
    });
    updateShelfState();
}

function addBook() {
    if (!booksList) {
        console.error("Добавление невозможно: список книг не найден");
        return;
    }
    const usedTitles = books.map(function (book) {
        return book.title;
    });
    let template = null;
    for (let i = 0; i < BOOK_POOL.length; i++) {
        if (usedTitles.indexOf(BOOK_POOL[i].title) === -1) {
            template = BOOK_POOL[i];
            break;
        }
    }
    if (template === null) {
        template = {
            title: "Новая книга №" + (books.length + 1),
            author: "Неизвестный автор",
            cover: "images/cover-" + ((books.length % 4) + 1) + ".svg",
            done: false
        };
    }
    const book = cloneBook(template);
    books.push(book);
    booksList.appendChild(createCard(book, books.length - 1));
    updateShelfState();
    saveBooks();
}

function removeLastBook() {
    if (!booksList) {
        console.error("Удаление невозможно: список книг не найден");
        return;
    }
    const cards = booksList.querySelectorAll(".book-card");
    if (cards.length === 0) {
        console.warn("На полке нет книг, удалять нечего");
        return;
    }
    booksList.removeChild(cards[cards.length - 1]);
    books.pop();
    updateShelfState();
    saveBooks();
}

function applyHiddenState(hidden) {
    if (!booksBody) {
        console.error("Не найден блок книг для скрытия");
        return;
    }
    booksBody.hidden = hidden;
    if (toggleBooksButton) {
        toggleBooksButton.textContent = hidden ? "Показать книги" : "Скрыть книги";
        toggleBooksButton.setAttribute("aria-expanded", String(!hidden));
    }
}

function toggleBooksVisibility() {
    const hidden = booksBody ? !booksBody.hidden : true;
    applyHiddenState(hidden);
    saveHiddenState(hidden);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (!themeToggleButton) {
        return;
    }
    const isDark = theme === "dark";
    themeToggleButton.textContent = isDark ? "Светлая тема" : "Тёмная тема";
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
    themeToggleButton.setAttribute("title", isDark ? "Включить светлую тему" : "Включить тёмную тему");
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    writeStorage(STORAGE_KEYS.theme, next);
}

function checkRequiredElements() {
    const requiredIds = [
        "theme-toggle",
        "books-title",
        "books-list",
        "books-body",
        "books-empty",
        "add-book",
        "remove-book",
        "toggle-books",
        "check-elements"
    ];
    const missing = requiredIds.filter(function (id) {
        return document.getElementById(id) === null;
    });
    const cards = document.querySelectorAll("#books-list .book-card");

    if (missing.length > 0) {
        const message = "Не найдены элементы: #" + missing.join(", #");
        console.error(message);
        alert(message);
        return;
    }
    console.log("Проверка элементов: все обязательные элементы найдены (" + requiredIds.length + " шт.)");
    console.log("Карточек книг на странице:", cards.length);
    console.log("Кнопок статуса на странице:", document.querySelectorAll(".book-status").length);
    alert("Все обязательные элементы найдены. Карточек на полке: " + cards.length);
}

applyTheme(readStorage(STORAGE_KEYS.theme) === "dark" ? "dark" : "light");
applyHiddenState(readStorage(STORAGE_KEYS.hidden) === "true");
renderBooks();

if (addBookButton) {
    addBookButton.addEventListener("click", addBook);
}
if (removeBookButton) {
    removeBookButton.addEventListener("click", removeLastBook);
}
if (toggleBooksButton) {
    toggleBooksButton.addEventListener("click", toggleBooksVisibility);
}
if (checkElementsButton) {
    checkElementsButton.addEventListener("click", checkRequiredElements);
}
if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
}
