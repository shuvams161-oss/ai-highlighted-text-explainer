// SAVE API KEY
document.getElementById("saveKey").addEventListener("click", () => {

  const key = document.getElementById("apiKeyInput").value.trim();

  if (!key) {
    alert("Please enter your Groq API key");
    return;
  }

  chrome.storage.local.set({ groqApiKey: key }, () => {
    alert("API Key Saved!");
  });

});


// LOAD SAVED KEY
chrome.storage.local.get(["groqApiKey"], (result) => {

  if (result.groqApiKey) {
    document.getElementById("apiKeyInput").value = result.groqApiKey;
  }

});


// TEST AI BUTTON
const button = document.getElementById("explain");

button.addEventListener("click", async () => {

  chrome.storage.local.get(["groqApiKey"], async (result) => {

    const key = result.groqApiKey;

    if (!key) {
      alert("Please save your Groq API key first");
      return;
    }

    try {

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "user", content: "Explain what artificial intelligence is in simple terms." }
            ]
          })
        }
      );

      const data = await response.json();

      alert(data.choices[0].message.content);

    } catch (error) {

      console.error(error);
      alert("Something went wrong");

    }

  });

});