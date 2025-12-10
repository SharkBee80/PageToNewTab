chrome.storage.local.get(async (r) => {
    if (!r.config) r.config = {};
    const targetUrl = r.config.url || '';
    const iframeIO = r.config.iframeIO || false;
    console.log(targetUrl);
    // 验证 URL 是否有效
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // 检查是否为网络 URL
    function isNetworkUrl(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    // 测试网络连通性
    async function testConnectivity(url, timeout = 1500) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'HEAD', // 使用 HEAD 请求减少数据传输
                signal: controller.signal,
                redirect: 'follow' // 跟随重定向
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.log('Error testing connectivity:', error);
            return false;
        }
    }

    let canuse = true;

    // 如果是有效的网络URL，则测试连通性
    if (isValidUrl(targetUrl) && isNetworkUrl(targetUrl)) {
        const isConnected = await testConnectivity(targetUrl);
        if (!isConnected) {
            canuse = false; // 网络不通则回退到静态页面
        }
    } else {
        canuse = false; // 不是有效网络URL则使用静态页面
    }

    // 执行跳转
    if (canuse) {
        if (iframeIO) {
            loadIframe(targetUrl);
        } else {
            chrome.tabs.update(null, { url: targetUrl });
            location.href = targetUrl;
        }
    } else {
        const html = await fetch("./404.html").then(r => r.text());
        document.documentElement.innerHTML = html;
    }
});

const loadIframe = (url) => {
    const style = document.createElement('style');
    style.textContent = `*{overflow:hidden;}html,body{margin:0;padding:0;}iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0;}`;
    document.head.appendChild(style);
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation";
    // iframe.id = "iframe";
    document.body.appendChild(iframe);
}
