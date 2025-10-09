(function () {
    if (window.AIReportChatLoaded) return;
    window.AIReportChatLoaded = true;

    function initAIReportChat() {
        const chatTag = document.querySelector("aireport-chat");
        if (!chatTag) return;

        const Agent_Title   = chatTag.getAttribute("agent_title") || "AIReport Chat";
        const Agent_URL     = chatTag.getAttribute("agent_url") || "about:blank";
        const Profile_ID    = chatTag.getAttribute("profile_id") || "";
        const Profile_Name  = chatTag.getAttribute("profile_name") || "";
        const Chat_Width    = chatTag.getAttribute("chat_width") || "400";
        const Chat_Height   = chatTag.getAttribute("chat_height") || "600";
        const Auto_Height   = chatTag.getAttribute("chat_auto_height") === "true";
        const API_KEY       = chatTag.getAttribute("api_key") || "";

        // 按钮
        const chatIcon = document.createElement("div");
        chatIcon.className = "aireport-chat-icon";
        chatIcon.innerHTML = "💬";
        chatIcon.title = "AIReport-Chat";
        chatIcon.setAttribute("aria-label", "AIReport-Chat");
        document.body.appendChild(chatIcon);

        // 容器
        const chatContainer = document.createElement("div");
        chatContainer.className = "aireport-chat-container";

        let containerContent = `
            <div class="aireport-chat-header">
                <span>${Agent_Title}</span>
                <button class="aireport-chat-close">&times;</button>
            </div>
            <div class="aireport-chat-loading">
                <div class="spinner"></div>
                <div class="loading-text" id="dynamic-loading-text">加载中...</div>
                <div class="loading-bar-container">
                    <div class="loading-bar" id="dynamic-loading-bar"></div>
                </div>
                <div class="loading-hint">若长时间无响应，请检查网络</div>
            </div>
            <iframe src="" frameborder="0" style="display:none;"></iframe>
        `;

        let hasValidToken = !!API_KEY.trim();
        if (!hasValidToken) {
            containerContent = `
                <div class="aireport-chat-header">
                    <span>${Agent_Title}</span>
                    <button class="aireport-chat-close">&times;</button>
                </div>
                <div class="aireport-chat-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">
                        <div class="error-title">缺少必要参数</div>
                        <div class="error-details">未提供Chat Token参数，请检查嵌入代码配置</div>
                    </div>
                </div>
                <iframe src="" frameborder="0" style="display:none;"></iframe>
            `;
        }

        chatContainer.innerHTML = containerContent;
        document.body.appendChild(chatContainer);

        const iframe = chatContainer.querySelector("iframe");
        const loadingDiv = chatContainer.querySelector(".aireport-chat-loading");
        const loadingText = document.getElementById("dynamic-loading-text");
        const loadingBar = document.getElementById("dynamic-loading-bar");
        let progressInterval = null;

        // <<修改>> iframe URL 构造
        if (hasValidToken) {
            const iframeUrl = `${Agent_URL}?SSOTOKEN=${encodeURIComponent(API_KEY)}&p_target_page=24` +
                `&P24_AGENT_NAME=${encodeURIComponent(Agent_Title)}` +
                `&P24_PROFILE=${encodeURIComponent(Profile_ID)}` +
                `&P24_PROFILE_NAME=${encodeURIComponent(Profile_Name)}`;
            console.log("✅ 拼接完成的 iframeUrl:", iframeUrl); // <<=== 新增打印
            iframe.src = iframeUrl;
        }

        // 样式
        const style = document.createElement("style");
        style.innerHTML = `
.aireport-chat-icon {
  position: fixed; bottom: 30px; right: 30px;
  width: 60px; height: 60px; border-radius: 50%;
  background: #3b82f6; color: white; font-size: 28px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; z-index: 10000; overflow: visible; pointer-events: auto;
  transition: background 0.3s ease;
}
.aireport-chat-icon:hover { background: #2563eb; }
.aireport-chat-icon::after {
  content: "AIReport-Chat";
  position: absolute; right: 70px; bottom: 20px;
  background: #1f2937; color: white;
  padding: 5px 10px; border-radius: 4px; font-size: 13px; font-weight: 500;
  white-space: nowrap; z-index: 10001; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  opacity: 0; visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
.aireport-chat-icon::before {
  content: "";
  position: absolute; right: 64px; bottom: 26px;
  border-width: 6px 0 6px 6px; border-style: solid;
  border-color: transparent transparent transparent #1f2937;
  z-index: 10001; opacity: 0; visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
.aireport-chat-icon:hover::after,
.aireport-chat-icon:hover::before { opacity: 1; visibility: visible; }

.aireport-chat-container {
  position: fixed; bottom: 100px; right: 30px;
  width: ${Chat_Width}px; background: white; border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2); display: none; flex-direction: column;
  z-index: 9999; overflow: hidden; opacity: 0; transition: opacity 0.4s ease, height 0.4s ease;
}
.aireport-chat-container.show { opacity: 1; }
.aireport-chat-header {
  background: tomato; color: white; padding: 10px;
  display:flex; justify-content:space-between; align-items:center;
  font-size:16px; font-weight:bold;
}
.aireport-chat-header button {
  background:transparent; border:none; color:white; font-size:20px; cursor:pointer;
}
.aireport-chat-container iframe { width: 100%; border:none; display:block; height:${Chat_Height}px; max-height:calc(80vh - 40px); transition: height 0.3s ease; }
.aireport-chat-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px 20px; color:#374151; font-size:14px; min-height:200px; background-color:#f9fafb; }
.spinner { width:40px; height:40px; border:4px solid #e5e7eb; border-top-color:#3b82f6; border-radius:50%; animation:spin 1.2s linear infinite; margin-bottom:15px; }
.loading-text { font-size:16px; font-weight:500; color:#1e40af; margin-bottom:12px; font-style: normal; }
.loading-bar-container { width:85%; height:6px; background-color:#e5e7eb; border-radius:3px; overflow:hidden; margin-bottom:10px; }
.loading-bar { width:0%; height:100%; background-color:#3b82f6; border-radius:3px; transition: width 0.3s ease; }
.loading-hint { font-size:12px; color:#6b7280; }
.aireport-chat-error { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; color:#dc2626; font-size:14px; min-height:200px; text-align:center; }
.error-icon { font-size:48px; margin-bottom:15px; }
.error-title { font-size:18px; font-weight:bold; margin-bottom:10px; }
.error-details { color:#4b5563; line-height:1.5; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        // 加载进度逻辑
        function startLoadingProgress() {
            if (!loadingText || !loadingBar || !hasValidToken) return;
            const progressTexts = ["初始化连接...", "加载配置信息...", "验证Token有效性...", "准备页面资源...", "即将完成加载..."];
            let currentStep = 0;
            let currentProgress = 0;
            const totalSteps = progressTexts.length;
            const stepProgress = 90 / totalSteps;

            progressInterval = setInterval(() => {
                if (currentStep < totalSteps) { loadingText.textContent = progressTexts[currentStep]; currentStep++; }
                if (currentProgress < 90) { currentProgress = Math.min(currentProgress + stepProgress, 90); loadingBar.style.width = `${Math.floor(currentProgress)}%`; }
                if (currentProgress >= 90 && currentStep >= totalSteps) { clearInterval(progressInterval); progressInterval = null; }
            }, 800);
        }

        function stopLoadingProgress() {
            if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
            if (loadingBar) loadingBar.style.width = "100%";
        }

        // 按钮点击逻辑
        let isOpen = false;
        chatIcon.onclick = () => {
            isOpen = !isOpen;
            chatContainer.style.display = isOpen ? "flex" : "none";
            if (isOpen) {
                setTimeout(() => chatContainer.classList.add("show"), 10);
                if (Auto_Height && hasValidToken) requestIframeHeight();
                startLoadingProgress();
            } else {
                chatContainer.classList.remove("show");
                stopLoadingProgress();
                if (loadingBar) loadingBar.style.width = "0%";
                if (loadingText) loadingText.textContent = "加载中...";
            }
        };

        chatContainer.querySelector(".aireport-chat-close").onclick = () => {
            chatContainer.classList.remove("show");
            setTimeout(() => chatContainer.style.display = "none", 400);
            isOpen = false;
            stopLoadingProgress();
            if (loadingBar) loadingBar.style.width = "0%";
            if (loadingText) loadingText.textContent = "加载中...";
        };

        function requestIframeHeight() {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                adjustIframeHeight(doc.body.scrollHeight);
            } catch (e) { console.warn("跨域模式，等待子页面 postMessage 发送高度..."); }
        }

        function adjustIframeHeight(height) {
            const maxHeight = window.innerHeight * 0.8;
            iframe.style.height = Math.min(height, maxHeight) + "px";
        }

        if (hasValidToken) {
            iframe.onload = () => {
                if (loadingDiv) { stopLoadingProgress(); setTimeout(() => loadingDiv.style.display = "none", 300); }
                iframe.style.display = "block";
                if (Auto_Height) requestIframeHeight();
            };
        }

        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "iframeHeight") adjustIframeHeight(event.data.height);
        });
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initAIReportChat); }
    else { initAIReportChat(); }

})();
