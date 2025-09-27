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
        const Chat_Height   = chatTag.getAttribute("chat_height") || "600"; // 默认高 600
        const Auto_Height   = chatTag.getAttribute("chat_auto_height") === "true"; // 自适应开关

        const iframeUrl = `${Agent_URL}?P24_AGENT_NAME=${encodeURIComponent(Agent_Title)}&P24_PROFILE=${encodeURIComponent(Profile_ID)}&P24_PROFILE_NAME=${encodeURIComponent(Profile_Name)}`;

        // 按钮
        const chatIcon = document.createElement("div");
        chatIcon.className = "aireport-chat-icon";
        chatIcon.innerHTML = "💬";
        document.body.appendChild(chatIcon);

        // 容器
        const chatContainer = document.createElement("div");
        chatContainer.className = "aireport-chat-container";
        chatContainer.innerHTML = `
            <div class="aireport-chat-header">
                <span>${Agent_Title}</span>
                <button class="aireport-chat-close">&times;</button>
            </div>
            <iframe src="${iframeUrl}" frameborder="0"></iframe>
        `;
        document.body.appendChild(chatContainer);

        const iframe = chatContainer.querySelector("iframe");

        // 样式
        const style = document.createElement("style");
        style.innerHTML = `
.aireport-chat-icon {
  position: fixed; bottom: 30px; right: 30px;
  width: 60px; height: 60px; border-radius: 50%;
  background: #3b82f6; color: white; font-size: 28px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; z-index:10000;
}
.aireport-chat-container {
  position: fixed; bottom: 100px; right: 30px;
  width: ${Chat_Width}px;
  background: white; border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  display: none; flex-direction: column;
  z-index: 9999; overflow: hidden;
}
.aireport-chat-header {
  background: tomato; color: white; padding: 10px;
  display:flex; justify-content:space-between; align-items:center;
  font-size:16px; font-weight:bold;
}
.aireport-chat-header button {
  background:transparent; border:none; color:white;
  font-size:20px; cursor:pointer;
}
.aireport-chat-container iframe {
  width: 100%; border: none; display:block;
  height: ${Chat_Height}px;
  max-height: calc(80vh - 40px);
}
        `;
        document.head.appendChild(style);

        // 开关逻辑
        let isOpen = false;
        chatIcon.onclick = () => {
            isOpen = !isOpen;
            chatContainer.style.display = isOpen ? "flex" : "none";
            if (isOpen && Auto_Height) requestIframeHeight();
        };
        chatContainer.querySelector(".aireport-chat-close").onclick = () => {
            chatContainer.style.display = "none";
            isOpen = false;
        };

        // === 自适应高度逻辑 ===
        function requestIframeHeight() {
            try {
                // 同域：直接取 scrollHeight
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                adjustIframeHeight(doc.body.scrollHeight);
            } catch (e) {
                // 跨域：需要子页面主动 postMessage 给父页面
                console.warn("跨域模式，等待子页面 postMessage 发送高度...");
            }
        }

        function adjustIframeHeight(height) {
            const maxHeight = window.innerHeight * 0.8;
            iframe.style.height = Math.min(height, maxHeight) + "px";
        }

        // 监听子页面消息
        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "iframeHeight") {
                adjustIframeHeight(event.data.height);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAIReportChat);
    } else {
        initAIReportChat();
    }
})();