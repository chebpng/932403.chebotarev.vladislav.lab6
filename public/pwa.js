if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(function (registration) {
            console.log("Service worker зарегистрирован, scope:", registration.scope);
        }).catch(function (error) {
            console.error("Не удалось зарегистрировать service worker:", error);
        });
    });
} else {
    console.warn("Браузер не поддерживает service worker");
}

const offlineBanner = document.getElementById("offline-banner");

function updateOnlineState() {
    if (!offlineBanner) {
        return;
    }
    offlineBanner.hidden = navigator.onLine;
}

window.addEventListener("online", updateOnlineState);
window.addEventListener("offline", updateOnlineState);
updateOnlineState();

const installButton = document.getElementById("install-app");

let installPrompt = null;

window.addEventListener("beforeinstallprompt", function (event) {

    event.preventDefault();
    installPrompt = event;
    if (installButton) {
        installButton.hidden = false;
    }
});

if (installButton) {
    installButton.addEventListener("click", async function () {
        if (!installPrompt) {
            console.warn("Браузер не предложил установку");
            return;
        }

        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        console.log("Решение об установке:", choice.outcome);
        installPrompt = null;
        installButton.hidden = true;
    });
}

window.addEventListener("appinstalled", function () {
    installPrompt = null;
    if (installButton) {
        installButton.hidden = true;
    }
    console.log("Приложение установлено");
});