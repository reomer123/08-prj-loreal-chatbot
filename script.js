/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

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
addChatMessage("👋 Hello! How can I help you today?", "assistant");

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
        message: message,
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
