// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}

// Определение платформы
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isAndroid = /Android/.test(navigator.userAgent);

// Определяем Chrome (исключая Edge, Opera, Samsung, Яндекс и другие)
const isChrome = /Chrome/.test(navigator.userAgent) && 
                 !/Edg|OPR|SamsungBrowser|YaBrowser|UCBrowser|MiuiBrowser/.test(navigator.userAgent);

// Проверка, установлено ли уже PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// Переменная для хранения события установки (только для Chrome)
let deferredPrompt;

// Элементы
const installBtnAndroid = document.getElementById('installBtnAndroid');
const installBtnIOS = document.getElementById('installBtnIOS');
const modalAndroid = document.getElementById('modalAndroid');
const modalIOS = document.getElementById('modalIOS');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const openChromeBtn = document.getElementById('openChromeBtn');

// Показываем кнопку установки если PWA еще не установлено
if (!isStandalone) {
    if (isIOS) {
        installBtnIOS.style.display = 'flex';
    } else if (isAndroid) {
        installBtnAndroid.style.display = 'flex';
    }
}

// === ANDROID ===
if (isAndroid) {
    // Chrome: нативная установка через beforeinstallprompt
    if (isChrome) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });

        installBtnAndroid.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtnAndroid.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    } 
    // Яндекс и другие браузеры: показываем модалку
    else {
        installBtnAndroid.addEventListener('click', () => {
            modalAndroid.style.display = 'flex';
        });
    }
}

// === iOS ===
if (isIOS) {
    installBtnIOS.addEventListener('click', () => {
        modalIOS.style.display = 'flex';
    });
}

// Копирование ссылки
copyLinkBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        copyLinkBtn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            copyLinkBtn.textContent = '📋 Скопировать ссылку';
        }, 2000);
    } catch (err) {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyLinkBtn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            copyLinkBtn.textContent = '📋 Скопировать ссылку';
        }, 2000);
    }
});

// Открыть в Chrome (Android)
openChromeBtn.addEventListener('click', () => {
    const url = window.location.href;
    const intentUrl = `intent://${new URL(url).host}${new URL(url).pathname}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
});

// Закрытие модалок
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Закрытие модалки по клику вне её
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Скрываем кнопки после установки
window.addEventListener('appinstalled', () => {
    installBtnAndroid.style.display = 'none';
    installBtnIOS.style.display = 'none';
});