const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const text = input.value;

    if (text.trim() === "") 
        return;
    
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerText = text;
    messages.appendChild(userMsg);

    input.value = "";

    setTimeout(() => {
        const aiMsg = document.createElement("div");
        aiMsg.className = "message ai";
        aiMsg.innerText = "This is a fake AI response.";
        messages.appendChild(aiMsg);

        messages.scrollTop = messages.scrollHeight;
    }, 500);
}