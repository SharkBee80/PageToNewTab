let config;
const targets = ["_self", "_blank", "_parent", "_top", "_unfencedTop"];
// 保存原始方法
const originalOpen = window.open;
function getconfig() {
    // 监听来自 content_script 的消息
    window.addEventListener('message', getconfigEvent);
}

function getconfigEvent(e) {
    console.log(`%cPAGE message: `, "color: darkgoldenrod", e.data);
    if (e.data.type === 'FROM_CONTENT_SCRIPT' && e.data.config) {
        // 移除监听
        // window.removeEventListener("message", getconfigEvent);
        // 返回
        window.postMessage({
            type: 'FROM_PAGE',
            ok: true
        }, '*');
        config = e.data.config;
        run();
    }
}

const _window_open = (t) => {
    // 重写 window.open
    window.open = async function (url, target, features) {
        // 自定义逻辑
        console.log('重写前 open:', url, target);
        if (t) target = t;
        console.log('重写后 open:', url, target);
        // 可以修改参数
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // return;
        // 调用原始方法
        return originalOpen(url, target, features);
    };
}

const _a_href = (t) => {
    // a 标签
    document.querySelectorAll('a[href]').forEach(a => {
        // if (!a.target) a.target = '_top';
        if (t) {
            a.originTarget = a.target;
            a.target = t;
        };
        a.rel = 'noopener noreferrer';
    });
};

const _a_href_X = () => {
    document.querySelectorAll('a[href]').forEach(a => {
        if (a.originTarget) a.target = a.originTarget;
    });
};


function main() {
    // 获取配置
    getconfig();
}

function run() {
    // 恢复
    if (!config.targetIO) {
        if (window.open !== originalOpen) window.open = originalOpen;
        _a_href_X();
        return;
    };
    // 跳转
    let whereTO = targets[String(config.whereTO)];
    _window_open(whereTO);
    _a_href(whereTO);
}

main();

