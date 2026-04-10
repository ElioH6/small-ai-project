const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const resetChatBtnDesktop = document.getElementById("resetChatBtnDesktop");
const resetChatBtnMobile = document.getElementById("resetChatBtnMobile");

const BACKEND_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://small-ai-project.onrender.com";

const API_URL = `${BACKEND_BASE_URL}/api/chat`;
const RESET_URL = `${BACKEND_BASE_URL}/api/reset`;

let sessionId = localStorage.getItem("chatSessionId");

if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("chatSessionId", sessionId);
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

if (resetChatBtnDesktop) {
    resetChatBtnDesktop.addEventListener("click", resetChat);
}

if (resetChatBtnMobile) {
    resetChatBtnMobile.addEventListener("click", resetChat);
}

function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.innerText = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
}

function setLoadingState(isLoading) {
    input.disabled = isLoading;
    sendBtn.disabled = isLoading;
}

async function sendMessage() {
    const text = input
        .value
        .trim();

    if (text === "") 
        return;
    
    addMessage(text, "user");
    input.value = "";
    setLoadingState(true);

    const loadingMsg = addMessage("Thinking...", "ai");

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({message: text, sessionId})
        });

        const data = await res.json();

        if (!res.ok) {
            loadingMsg.innerText = data.error || "Something went wrong.";
            return;
        }

        loadingMsg.innerText = data.reply || "No response received.";
    } catch (error) {
        console.error("Fetch error:", error);
        loadingMsg.innerText = "Unable to connect to the server.";
    } finally {
        setLoadingState(false);
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
}

async function resetChat() {
    try {
        await fetch(RESET_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({sessionId})
        });
    } catch (error) {
        console.error("Reset error:", error);
    }

    messages.innerHTML = `<div class="message ai">Hello 👋 Ask me anything about your documents.</div>`;
    input.focus();
}
