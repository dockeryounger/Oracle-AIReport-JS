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
        const API_KEY    = chatTag.getAttribute("API_KEY") || "";

        // 按钮（核心修复1：强化悬浮提示配置，确保不被遮挡）
        const chatIcon = document.createElement("div");
        chatIcon.className = "aireport-chat-icon";
        chatIcon.innerHTML = "💬";
        // 1. 原生title属性（基础保障，明确设置）
        chatIcon.title = "AIReport-Chat";
        // 2. 新增aria-label属性（辅助兼容，确保屏幕阅读器也能识别）
        chatIcon.setAttribute("aria-label", "AIReport-Chat");
        document.body.appendChild(chatIcon);

        // 容器（原有逻辑不变）
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

        // Token缺失提示（原有逻辑不变）
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

        // 只有当token有效时设置iframe的src（原有逻辑不变）
        if (hasValidToken) {
            const iframeUrl = `${Agent_URL}?P24_AGENT_NAME=${encodeURIComponent(Agent_Title)}&P24_PROFILE=${encodeURIComponent(Profile_ID)}&P24_PROFILE_NAME=${encodeURIComponent(Profile_Name)}&P24_CHAT_TOKEN=${encodeURIComponent(API_KEY)}`;
            iframe.src = iframeUrl;
        }

        // 样式（核心修复2：强制启用自定义悬浮提示，解决原生title被遮挡问题）
        const style = document.createElement("style");
        style.innerHTML = `
/* 按钮基础样式 + 悬浮提示保障 */
.aireport-chat-icon {
  position: fixed; bottom: 30px; right: 30px;
  width: 60px; height: 60px; border-radius: 50%;
  background: #3b82f6; color: white; font-size: 28px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; z-index: 10000; /* 确保按钮层级足够高 */
  overflow: visible; /* 关键：允许悬浮提示超出按钮范围显示，不被裁剪 */
  pointer-events: auto; /* 确保鼠标事件能正常触发 */
  transition: background 0.3s ease; /* 新增hover背景变化，提示用户可交互 */
}
/* 按钮hover效果（增强交互感知） */
.aireport-chat-icon:hover {
  background: #2563eb; /* hover时加深背景色，明确反馈 */
}

/* 核心：强制启用自定义悬浮提示（不依赖浏览器原生title，100%显示） */
.aireport-chat-icon::after {
  content: "AIReport-Chat"; /* 提示文本 */
  position: absolute; 
  right: 70px; /* 提示框在按钮左侧显示，避免被边缘遮挡 */
  bottom: 20px; /* 垂直居中对齐 */
  background: #1f2937; /* 深色背景，清晰可见 */
  color: white; /* 白色文字，高对比度 */
  padding: 5px 10px; /* 内边距，避免文字拥挤 */
  border-radius: 4px; /* 圆角，更美观 */
  font-size: 13px; /* 合适字号，易读 */
  font-weight: 500;
  white-space: nowrap; /* 防止文本换行 */
  z-index: 10001; /* 层级高于按钮，不被遮挡 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.3); /* 阴影，增强层次感 */
  opacity: 0; /* 默认隐藏 */
  visibility: hidden; /* 默认隐藏（避免占用空间） */
  transition: opacity 0.2s ease, visibility 0.2s ease; /* 平滑显示/隐藏 */
}
/* 悬浮提示小箭头（指向按钮） */
.aireport-chat-icon::before {
  content: "";
  position: absolute;
  right: 64px; /* 与提示框对齐 */
  bottom: 26px;
  border-width: 6px 0 6px 6px; /* 箭头朝向按钮 */
  border-style: solid;
  border-color: transparent transparent transparent #1f2937; /* 与提示框背景同色 */
  z-index: 10001;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
/* 鼠标hover时显示提示 */
.aireport-chat-icon:hover::after,
.aireport-chat-icon:hover::before {
  opacity: 1;
  visibility: visible;
}

/* 对话框容器样式（原有不变） */
.aireport-chat-container {
  position: fixed; bottom: 100px; right: 30px;
  width: ${Chat_Width}px;
  background: white; border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  display: none; flex-direction: column;
  z-index: 9999; overflow: hidden;
  opacity: 0; transition: opacity 0.4s ease, height 0.4s ease;
}
.aireport-chat-container.show {
  opacity: 1;
}

/* 对话框头部样式（原有不变） */
.aireport-chat-header {
  background: tomato; color: white; padding: 10px;
  display:flex; justify-content:space-between; align-items:center;
  font-size:16px; font-weight:bold;
}
.aireport-chat-header button {
  background:transparent; border:none; color:white;
  font-size:20px; cursor:pointer;
}

/* iframe样式（原有不变） */
.aireport-chat-container iframe {
  width: 100%; border: none; display:block;
  height: ${Chat_Height}px;
  max-height: calc(80vh - 40px);
  transition: height 0.3s ease;
}

/* 加载区域样式（原有不变） */
.aireport-chat-loading {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; padding:30px 20px;
  color:#374151;
  font-size:14px;
  min-height: 200px;
  background-color: #f9fafb;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin-bottom: 15px;
}
.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #1e40af;
  margin-bottom: 12px;
  font-style: normal;
}
.loading-bar-container {
  width: 85%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}
.loading-bar {
  width: 0%;
  height: 100%;
  background-color: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.loading-hint {
  font-size: 12px;
  color: #6b7280;
}

/* 错误提示样式（原有不变） */
.aireport-chat-error {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; padding:20px;
  color:#dc2626;
  font-size:14px;
  min-height: 200px;
  text-align: center;
}
.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}
.error-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.error-details {
  color: #4b5563;
  line-height: 1.5;
}

/* 旋转动画（原有不变） */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
        `;
        document.head.appendChild(style);

        // 线性递进式加载进度（原有逻辑不变）
        function startLoadingProgress() {
            if (!loadingText || !loadingBar || !hasValidToken) return;

            const progressTexts = [
                "初始化连接...",
                "加载配置信息...",
                "验证Token有效性...",
                "准备页面资源...",
                "即将完成加载..."
            ];
            let currentStep = 0;
            let currentProgress = 0;
            const totalSteps = progressTexts.length;
            const stepProgress = 90 / totalSteps;

            progressInterval = setInterval(() => {
                if (currentStep < totalSteps) {
                    loadingText.textContent = progressTexts[currentStep];
                    currentStep++;
                }

                if (currentProgress < 90) {
                    currentProgress = Math.min(currentProgress + stepProgress, 90);
                    loadingBar.style.width = `${Math.floor(currentProgress)}%`;
                }

                if (currentProgress >= 90 && currentStep >= totalSteps) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
            }, 800);
        }

        // 停止进度更新（原有逻辑不变）
        function stopLoadingProgress() {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            if (loadingBar) loadingBar.style.width = "100%";
        }

        // 开关逻辑（原有逻辑不变）
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

        // 关闭按钮逻辑（原有逻辑不变）
        chatContainer.querySelector(".aireport-chat-close").onclick = () => {
            chatContainer.classList.remove("show");
            setTimeout(() => chatContainer.style.display = "none", 400);
            isOpen = false;
            stopLoadingProgress();
            if (loadingBar) loadingBar.style.width = "0%";
            if (loadingText) loadingText.textContent = "加载中...";
        };

        // 自适应高度逻辑（原有逻辑不变）
        function requestIframeHeight() {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                adjustIframeHeight(doc.body.scrollHeight);
            } catch (e) {
                console.warn("跨域模式，等待子页面 postMessage 发送高度...");
            }
        }

        function adjustIframeHeight(height) {
            const maxHeight = window.innerHeight * 0.8;
            iframe.style.height = Math.min(height, maxHeight) + "px";
        }

        // iframe加载逻辑（原有逻辑不变）
        if (hasValidToken) {
            iframe.onload = () => {
                if (loadingDiv) {
                    stopLoadingProgress();
                    setTimeout(() => loadingDiv.style.display = "none", 300);
                }
                iframe.style.display = "block";
                if (Auto_Height) requestIframeHeight();
            };
        }

        // 监听子页面消息（原有逻辑不变）
        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "iframeHeight") {
                adjustIframeHeight(event.data.height);
            }
        });
    }

    // 初始化时机（原有逻辑不变）
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAIReportChat);
    } else {
        initAIReportChat();
    }
})();