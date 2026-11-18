const dailyPages = [35, 78, 12, 54, 90, 18, 63];
const HIGH_LIMIT = 50;
const LAZY_LIMIT = 20;
const GOOD_AVERAGE = 40;

function findMax(numbers) {
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    return max;
}

function filterPages(numbers, limit) {
    const result = [];
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] > limit) {
            result.push(numbers[i]);
        }
    }
    return result;
}

function countLazyDays(numbers, limit) {
    let count = 0;
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] <= limit) {
            count++;
        }
    }
    return count;
}

function sumPages(numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
}

function formatNumber(value) {
    return value.toFixed(1).replace(".", ",");
}

const totalPages = sumPages(dailyPages);
const maxPages = findMax(dailyPages);
const highDays = filterPages(dailyPages, HIGH_LIMIT);
const lazyDays = countLazyDays(dailyPages, LAZY_LIMIT);
const averagePages = totalPages / dailyPages.length;
const lazyShare = (lazyDays / dailyPages.length) * 100;

console.log("Страницы по дням:", dailyPages);
console.log("Всего прочитано страниц:", totalPages);
console.log("Максимум за день:", maxPages);
console.log("Дни с высоким темпом (>" + HIGH_LIMIT + "):", highDays, "- " + highDays.length + " шт.");
console.log("Ленивые дни (<=" + LAZY_LIMIT + " страниц):", lazyDays);
console.log("Доля ленивых дней:", formatNumber(lazyShare) + "%");
console.log("Среднее в день:", formatNumber(averagePages));

if (averagePages > GOOD_AVERAGE) {
    console.log("Отличный темп чтения!");
}

document.getElementById("stats-days").textContent = dailyPages.join(", ");
document.getElementById("stats-total").textContent = totalPages;
document.getElementById("stats-max").textContent = maxPages;
document.getElementById("stats-high").textContent = highDays.length;
document.getElementById("stats-lazy").textContent = lazyDays;
document.getElementById("stats-average").textContent = formatNumber(averagePages);
document.getElementById("stats-share").textContent = formatNumber(lazyShare) + "%";

const summary = document.getElementById("stats-summary");
if (averagePages > GOOD_AVERAGE) {
    summary.textContent = "Отличный темп чтения!";
    summary.classList.add("stats-summary--good");
} else {
    summary.textContent = "Темп ниже " + GOOD_AVERAGE + " страниц в день — есть куда расти.";
}
