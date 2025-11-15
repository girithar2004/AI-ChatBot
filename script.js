import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.9.0/dist/transformers.min.js";

let generator;
const chatHistory = [];
const messageQueue = [];

addMessage("Hello! I’m your AI assistant. You can start typing your questions.", "bot");
addMessage("Loading AI model... First time may take 10–20 sec", "bot");

loadModel();

async function loadModel() {
    try {
        generator = await pipeline("text-generation", "Xenova/gpt2");
        addMessage("AI model loaded! Ready to respond.", "bot");

        while (messageQueue.length > 0) {
            const queuedText = messageQueue.shift();
            respondToUser(queuedText);
        }

    } catch (err) {
        console.error(err);
        addMessage("Error loading model: " + err.message, "bot");
    }
}

function addMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const message = document.createElement("div");
    message.classList.add("message", sender);
    message.innerText = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    addMessage(text, "user");
    if (!generator) {
        addMessage("Queued: Waiting for AI model...", "bot");
        messageQueue.push(text);
    } else {
        respondToUser(text);
    }
}
async function respondToUser(text) {
    addMessage("Thinking...", "bot");

    const prompt = chatHistory.map(m => `${m.role}: ${m.text}`).join("\n") + `\nUser: ${text}\nBot:`;

    try {
        const output = await generator(prompt, { max_new_tokens: 60, temperature: 0.8 });
        const reply = output[0].generated_text.split("Bot:").pop().trim();
        const bots = document.querySelectorAll(".bot");
        if (bots.length) bots[bots.length - 1].remove();

        addMessage(reply, "bot");

        chatHistory.push({ role: "user", text });
        chatHistory.push({ role: "bot", text: reply });
    } catch (err) {
        console.error(err);
        const bots = document.querySelectorAll(".bot");
        if (bots.length) bots[bots.length - 1].remove();
        addMessage("Error: " + err.message, "bot");
    }
}
