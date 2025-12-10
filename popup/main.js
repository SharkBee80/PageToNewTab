const webUrl = document.getElementById("webUrl");
const iframeIo = document.getElementById("iframeIo");
const toggleIo = document.getElementById("toggleIo");
const targetIo = document.getElementById("targetIo");
const whereTo = document.getElementById("whereTo");
const whereToLoad = document.getElementById("whereToLoad");
let url = '', iframeIO, toggleIO, targetIO, whereTO, config = {};
const events = ["change", "input", "focus", "blur"];
const targets = ["_self", "_blank", "_parent", "_top", "_unfencedTop"];
let lock = false;

async function loadData() {
    try {
        config = await chrome.storage.local.get() || {};
        config = config.config || {};
        // 初始化
        url = webUrl.value = config["url"] || '';
        iframeIO = iframeIo.checked = config.iframeIO ?? false;
        toggleIO = toggleIo.checked = config.toggleIO ?? true;
        targetIO = targetIo.checked = config.targetIO ?? false;
        whereTO = whereTo.value = config.whereTO ?? 0;
        enableToggle();
        // 显示
        whereToLoad.innerHTML = targets[String(whereTO)];
        // whereTo.dispatchEvent(new Event("input"));
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

function webUrlFormat(e) {
    if (lock) return;
    try {
        lock = true;
        const inputValue = webUrl.value.trim();
        if (inputValue === url || !inputValue) return;
        console.log("保存设置", e);

        let normalizedUrl = normalizeUrl(inputValue);

        if (!isValidUrl(normalizedUrl)) {
            console.warn("Invalid URL format:", normalizedUrl);
            return;
        }

        url = normalizedUrl;
        storageSet("url", url)
    } catch (error) {
        console.error('Failed to save URL to storage:', error);
    } finally {
        lock = false;
    }
}

function storageSet(key, value) {
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
    // 重置
    url = webUrl.value = '';
    iframeIO = iframeIo.checked = false;
    toggleIO = toggleIo.checked = true;
    targetIO = targetIo.checked = false;
    whereTO = whereTo.value = 0;

    config = {}
}

function addListener() {
    // 监听输入
    events.forEach(eventType => {
        webUrl.addEventListener(eventType, webUrlFormat);
    });
    iframeIo.addEventListener("change", () => storageSet("iframeIO", iframeIo.checked));
    toggleIo.addEventListener("change", () => {
        storageSet("toggleIO", toggleIo.checked);
        enableToggle();
    });
    targetIo.addEventListener("change", () => {
        storageSet("targetIO", targetIo.checked);
        enableToggle();
    });
    whereTo.addEventListener("change", () => storageSet("whereTO", whereTo.value));
    whereTo.addEventListener("input", () => whereToLoad.innerHTML = targets[whereTo.value] ?? "????");
    document.getElementById("reset").addEventListener("click", () => reset());
}

window.onload = () => {
    loadData();
    addListener();
};

function enableToggle() {
    const a = () => { if (targetIo.checked) whereTo.disabled = false; else whereTo.disabled = true; }

    if (toggleIo.checked) {
        targetIo.disabled = false;
        a();
    } else {
        targetIo.disabled = true;
        whereTo.disabled = true;
    }
}