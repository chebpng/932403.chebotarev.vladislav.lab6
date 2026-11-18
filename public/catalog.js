const form = document.getElementById("filter-form");
const authorInput = document.getElementById("author");
const yearInput = document.getElementById("year");
const list = document.getElementById("catalog-list");
const booksCount = document.getElementById("books-count");
const message = document.getElementById("catalog-message");
const requestUrl = document.getElementById("request-url");

const initialParams = new URLSearchParams(window.location.search);
if (initialParams.has("author")) {
    authorInput.value = initialParams.get("author");
}
if (initialParams.has("year")) {
    yearInput.value = initialParams.get("year");
}

function buildQuery() {
    const params = new URLSearchParams();
    const author = authorInput.value.trim();
    const year = yearInput.value.trim();
    if (author !== "") {
        params.set("author", author);
    }
    if (year !== "") {
        params.set("year", year);
    }
    return params;
}

function createCard(book) {
    const card = document.createElement("article");
    card.className = "book-card";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const year = document.createElement("p");
    year.className = "book-year";
    year.textContent = book.year + " год";

    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(year);
    return card;
}

async function loadBooks(params) {
    const query = params.toString();
    const url = "/api/books" + (query === "" ? "" : "?" + query);

    requestUrl.textContent = url;
    message.textContent = "Загрузка…";

    try {
        const response = await fetch(url, { headers: { "Accept": "application/json" } });

        if (!response.ok) {
            throw new Error("сервер ответил " + response.status);
        }

        const data = await response.json();

        list.replaceChildren();
        data.forEach(function (book) {
            list.appendChild(createCard(book));
        });

        booksCount.textContent = String(data.length);
        message.textContent = data.length === 0
            ? "Ничего не найдено. Попробуйте другого автора или год."
            : "";
    } catch (error) {

        console.error("Не удалось загрузить каталог:", error);
        list.replaceChildren();
        booksCount.textContent = "0";
        message.textContent = "Не удалось получить книги: " + error.message;
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const params = buildQuery();

    const query = params.toString();
    history.replaceState({}, "", query === "" ? "/" : "/?" + query);

    loadBooks(params);
});

form.addEventListener("reset", function () {
    window.setTimeout(function () {
        history.replaceState({}, "", "/");
        loadBooks(buildQuery());
    }, 0);
});

loadBooks(buildQuery());