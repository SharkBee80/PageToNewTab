chrome.storage.local.get(async (r) => {
    const targetUrl = r.config.url || '';
    const iframe = r.config.iframe || false;
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

        if (iframe) {
            const iframe = document.querySelector('iframe');
            iframe.src = targetUrl;
        } else {
            location.href = targetUrl;
            chrome.tabs.update(null, { url: targetUrl });
        }
    } else {
        const html = await fetch("./404.html").then(r => r.text());
        document.documentElement.innerHTML = html;
    }
});