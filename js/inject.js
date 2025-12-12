let config;
const targets = ["_self", "_blank", "_parent", "_top", "_unfencedTop"];

class InterceptJump {
    // 保存原始方法
    #originalOpen = window.open;
    // 参数
    #originTarget = this.randomString(undefined, { lowercase: true });
    #placeholder = this.randomString(undefined, { uppercase: true });

    constructor() {
        null;
    };

    randomString(length = 6, { uppercase = false, lowercase = false, numbers = false }) {
        // 参数验证
        if (typeof length !== 'number' || length < 0 || !Number.isInteger(length)) {
            throw new Error('Length must be a non-negative integer');
        }
        const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
        const NUMBER_CHARS = "0123456789";
        let charset = "";
        if (uppercase) charset += UPPERCASE_CHARS;
        if (lowercase) charset += LOWERCASE_CHARS;
        if (numbers) charset += NUMBER_CHARS;
        // 边界条件检查
        if (charset.length === 0) {
            charset = UPPERCASE_CHARS + LOWERCASE_CHARS + NUMBER_CHARS;
        }
        let result = "";
        const charsetLength = charset.length;
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charsetLength));
        }
        return result;
    }

    #_window_open = (t) => {
        const originalOpen = this.#originalOpen;
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

    #_window_open_X = () => {
        if (window.open !== this.#originalOpen) window.open = this.#originalOpen;
    };

    #_a_href = (t) => {
        const b = this.#originTarget;
        const c = this.#placeholder;
        // a 标签
        document.querySelectorAll('a[href]').forEach(a => {
            if (t) {
                if (!a[b]) a[b] = a.target || c;
                a.target = t;
            };
            a.rel = 'noopener noreferrer';
        });
    };

    #_a_href_X = () => {
        const b = this.#originTarget;
        const c = this.#placeholder;
        document.querySelectorAll('a[href]').forEach(a => {
            if (a[b]) {
                a.target = a[b] === c ? "" : a[b];
            };
        });
    };

    // 拦截跳转
    enable(t) {
        // 实现启用逻辑
        this.#_window_open(t);
        this.#_a_href(t);
    }

    // 取消拦截
    disable() {
        this.#_window_open_X();
        this.#_a_href_X();
    }

    toggle(able, target) {
        if (able) {
            this.enable(target);
        } else {
            this.disable(target);
        }
    }
}

const ij = new InterceptJump();

function getconfig() {
    // 监听来自 content_script 的消息
    window.addEventListener('message', getconfigEvent);
}

function getconfigEvent(e) {
    if (e.data.type === 'FROM_CONTENT_SCRIPT' && e.data.config) {
        console.log(`%cPAGE message: `, "color: darkgoldenrod", e.data);
        // 移除监听
        // window.removeEventListener("message", getconfigEvent);
        // 返回
        window.postMessage({
            type: 'FROM_PAGE',
            ok: true,
            time: Date.now()
        }, '*');
        config = e.data.config;
        run();
    }
}

function run() {
    ij.toggle(config.toggleIO && config.targetIO, targets[String(config.whereTO)]);
}

function main() {
    // 获取配置
    getconfig();
}

main();
