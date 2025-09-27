# Oracle-AIReport-JS
# 将AIReport Chat通过Ifram嵌入第三方页面，参考：

<!-- 引入你的 AIReport-Chat.js -->
<script src="./AIReport-Chat.js"></script>
<!-- 通过 aireport-chat 标签传递配置 -->
<aireport-chat
        agent_title="YouAgentName"
        agent_url="http://YouServerIP/ords/r/ws_dev/aireportpublicpublisher/ask-data"
        profile_id="261"   -- Your Porfile ID
        profile_name="YourProfileName"
        chat_width="400"
        chat_height="680"
>
</aireport-chat>
</body>
</html>
