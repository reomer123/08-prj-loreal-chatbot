/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful beauty and product advisor. Only answer questions related to L’Oréal products, routines, and recommendations. Polite decline to discuss unrelated matters. Use earlier messages to keep context, including details the user has shared such as their name and past questions. Do not invent personal details.",
  },
];

// Add a message to the chat and scroll to show the newest one.
function addChatMessage(message, role) {
  const messageElement = document.createElement("div");
  const messageClass = role === "user" ? "user" : "ai";

  messageElement.classList.add("msg", messageClass);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show the welcome message.
const welcomeMessage = "👋 Hello! How can I help you today?";
addChatMessage("👋 Hello! How can I help you today?", "assistant");
conversationHistory.push({ role: "assistant", content: welcomeMessage });

/* Send the user's message to the Cloudflare Worker and show its reply. */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();

  if (!message) return;

  addChatMessage(message, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  const workerUrl = "https://my-cool-worker.omerramy7.workers.dev/";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...conversationHistory, { role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || data.error || "Something went wrong.",
      );
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("The chatbot response did not contain a message.");
    }

    conversationHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: reply },
    );
    addChatMessage(reply, "assistant");
  } catch (error) {
    console.error(error);
    addChatMessage(
      "Sorry, something went wrong. Please try again.",
      "assistant",
    );
  } finally {
    sendBtn.disabled = false;
  }
});
