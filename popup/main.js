const newTab = document.getElementById("newtab");
let url = '';
const events = ["change", "input", "focus", "blur"];
let lock = false;

function Xget() {
    try {
        chrome.storage.local.get("url", (r) => {
            newTab.value = r.url || '';
            url = r.url || '';
        });
    } catch (error) {
        console.error('Failed to get URL from storage:', error);
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function normalizeUrl(input) {
    if (!input) return "";
    if (input.startsWith("http://") || input.startsWith("https://")) {
        return input;
    }
    return "https://" + input;
}

function Xset(e) {
    if (lock) return;
    try {
        lock = true;
        const inputValue = newTab.value.trim();
        if (inputValue === url || inputValue === "") return;

        let normalizedUrl = normalizeUrl(inputValue);

        // 基础有效性检查
        if (!isValidUrl(normalizedUrl)) {
            console.warn("Invalid URL format:", normalizedUrl);
            return;
        }

        url = normalizedUrl;
        chrome.storage.local.set({ url }, () => {
            // 成功回调保持简洁
        });
    } catch (error) {
        console.error('Failed to save URL to storage:', error);
    } finally {
        lock = false;
    }
}

function addListenerOnce() {
    events.forEach(eventType => {
        newTab.addEventListener(eventType, () => Xset(eventType));
    });
}

window.onload = () => {
    Xget();
    addListenerOnce();
};