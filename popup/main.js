const newTab = document.getElementById("newtab");
const ififrame = document.getElementById("ififrame");
let url = '', iframe = false, config = {};
const events = ["change", "input", "focus", "blur"];
let lock = false;

async function loadData() {
    try {
        config = await chrome.storage.local.get() || {};
        config = config.config || {};
        newTab.value = config["url"] || '';
        url = config.url || '';
        ififrame.checked = config.iframe || false;
        iframe = config.iframe || false;
    } catch (error) {
        console.error('Failed to get config from storage:', error);
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
        console.log("保存设置", e);

        let normalizedUrl = normalizeUrl(inputValue);

        if (!isValidUrl(normalizedUrl)) {
            console.warn("Invalid URL format:", normalizedUrl);
            return;
        }

        url = normalizedUrl;
        Pset("url", url)
    } catch (error) {
        console.error('Failed to save URL to storage:', error);
    } finally {
        lock = false;
    }
}

function Pset(key, value) {
    try {
        config[String(key)] = value;
        chrome.storage.local.set({ config });
    } catch (error) {
        console.error('Failed to save to storage:', error);
    }
}

function reset() {
    try {
        chrome.storage.local.clear();
    } catch (error) {
        console.error('Failed to clear from storage:', error);
        return;
    }
    url = newTab.value = '';
    iframe = ififrame.checked = false;
}

function addListener() {
    events.forEach(eventType => {
        newTab.addEventListener(eventType, () => Xset(eventType));
    });
    ififrame.addEventListener("change", () => Pset("iframe", ififrame.checked))
    document.getElementById("reset").addEventListener("click", () => reset());

}

window.onload = () => {
    loadData();
    addListener();
};
