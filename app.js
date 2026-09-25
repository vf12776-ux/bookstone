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
const isChrome = /Chrome/.test(navigator.userAgent) && 
                 !/Edg|OPR|SamsungBrowser|YaBrowser|UCBrowser|MiuiBrowser/.test(navigator.userAgent);

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

let deferredPrompt;

// Элементы
const installBtnAndroid = document.getElementById('installBtnAndroid');
const installBtnIOS = document.getElementById('installBtnIOS');
const modalAndroid = document.getElementById('modalAndroid');
const modalIOS = document.getElementById('modalIOS');
const modalCall = document.getElementById('modalCall');
const callBtn = document.getElementById('callBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const openChromeBtn = document.getElementById('openChromeBtn');

// Показываем кнопки установки
if (!isStandalone) {
    if (isIOS) {
        installBtnIOS.style.display = 'flex';
    } else if (isAndroid) {
        installBtnAndroid.style.display = 'flex';
    }
}

// Кнопка "Позвонить" - открывает модалку
callBtn.addEventListener('click', () => {
    modalCall.style.display = 'flex';
});

// Android установка
if (isAndroid) {
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
    } else {
        installBtnAndroid.addEventListener('click', () => {
            modalAndroid.style.display = 'flex';
        });
    }
}

// iOS установка
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
            copyLinkBtn.textContent = 'Скопировать ссылку';
        }, 2000);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyLinkBtn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Скопировать ссылку';
        }, 2000);
    }
});

// Открыть в Chrome
openChromeBtn.addEventListener('click', () => {
    const url = window.location.href;
    const intentUrl = `intent://${new URL(url).host}${new URL(url).pathname}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
});

// Закрытие модалок
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

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