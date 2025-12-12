let config;
main();
// window.onload = async () => {
async function main() {
    console.log("%cPage To NewTab: loaded", "color: darkgoldenrod");

    // 加载配置
    try {
        // throw new Error('throw error to test catch');
        config = await chrome.storage.local.get() || {};
        config = config.config || {};
    } catch (error) {
        console.error('Failed to get config from storage:', error);
    }

    config.toggleIO = config.toggleIO ?? true;
    if (!config.toggleIO) {
        return;
    };

    // 判断当前页面是否允许
    const selfurl = location.href;
    if (selfurl.includes(config.url)) {
        console.log("%cPage To NewTab: allow", "color: darkgoldenrod");
    } else {
        console.log("%cPage To NewTab: %cnot allow", "color: darkgoldenrod", "color: red");
        return;
    };
    // 执行函数
    run();
};

function run() {
    dynamicImport();
    getMessage();
    sendMessage();
    onStorageChange();
}

function dynamicImport() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('js/inject.js'); // 或直接 textContent
    (document.head || document.documentElement).appendChild(script);
    // script.onload = () => script.remove(); // 可选：加载后清理
    return script;
}

let Interval, runtime = 0, maxtime = 8;
function sendMessage() {
    // 定时发送消息给page - 轮询
    runtime = 0;
    Interval = setInterval(_postMessage, 100);
};

function getMessage() {
    window.addEventListener('message', getMessageEvent);
}

function getMessageEvent(e) {
    if (e.data.type === 'FROM_PAGE' && e.data.ok) {
        console.log('%cCONTENT_SCRIPT message:', "color: darkgoldenrod", e.data);
        // 移除监听
        window.removeEventListener('message', getMessageEvent);
        // 停止轮询
        clearInterval(Interval);
    }
}

function onStorageChange() {
    chrome.storage.onChanged.addListener(
        (changes, areaName) => {
            // console.log('%cStorage change:', "color: darkgoldenrod", changes, areaName);
            if (areaName === 'local') {
                if (changes.config) {
                    config = changes.config.newValue;
                    _postMessage(false);
                }
            }
        }
    )
}

function _postMessage(it = true) {
    window.postMessage({
        type: 'FROM_CONTENT_SCRIPT',
        config: config,
        time: Date.now(),
    }, '*');
    if (it && ++runtime === maxtime && Interval) {
        clearInterval(Interval);
    }
}