const path = require("path");
const express = require("express");
const TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"
};

function transliterate(value) {
    return value.split("").map(function (char) {

        return Object.prototype.hasOwnProperty.call(TRANSLIT, char) ? TRANSLIT[char] : char;
    }).join("");
}
const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, "public");
const books = require("./data/books");

app.use(express.static(PUBLIC_DIR));

app.get("/api/books", function (req, res) {

    const author = String(req.query.author || "").trim().toLowerCase();
    const year = String(req.query.year || "").trim();

    let result = books;

    if (author !== "") {
         result = result.filter(function (book) {
            const bookAuthor = book.author.toLowerCase();

            return bookAuthor.includes(author)
                || transliterate(bookAuthor).includes(transliterate(author));
        });
    }

    if (year !== "") {
        result = result.filter(function (book) {
            return book.year === Number(year);
        });
    }

    res.json(result);
});

app.get("/api/status", function (req, res) {
    res.json({
        status: "ok",
        name: "Книжный червь — каталог книг",

        version: require("./package.json").version,
        time: new Date().toISOString(),

        uptime: Math.round(process.uptime()),
        books: books.length,
        routes: ["/", "/about", "/api/status", "/api/books"]
    });
});

app.get("/about", function (req, res) {

    res.sendFile(path.join(PUBLIC_DIR, "about.html"));
});

app.listen(PORT, function () {
    console.log("Сервер: http://localhost:" + PORT);
});
