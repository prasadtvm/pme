// frontend/src/services/chatAPI.js
export async function sendChatMessage(messages) {
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b",
        messages
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Chat API error:", err);
    throw err;
  }
}
