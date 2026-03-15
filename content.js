let button = null;
let selectedText = "";

document.addEventListener("mouseup", function () {
    selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        if (button) button.remove();

        let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

        button = document.createElement("button");
        button.innerText = "Explain";

        // Button style
        button.style.position = "absolute";
        button.style.top = (rect.top + window.scrollY) + "px";
        button.style.left = (rect.right + window.scrollX) + "px";
        button.style.zIndex = "9999";
        button.style.background = "black";
        button.style.color = "white";
        button.style.padding = "6px 10px";
        button.style.border = "none";
        button.style.borderRadius = "6px";
        button.style.cursor = "pointer";
        button.style.fontSize = "12px";
        button.style.pointerEvents = "auto"; // make sure button can be clicked

        button.addEventListener("mousedown", function (e) {
    e.stopPropagation();
    e.preventDefault();

    // Remove old bubble if exists
let oldBubble = document.getElementById("aiBubble");
if (oldBubble) oldBubble.remove();

// Create floating bubble
let bubble = document.createElement("div");
bubble.id = "aiBubble";


// Add a header with AI label & close button
let header = document.createElement("div");
header.style.display = "flex";
header.style.justifyContent = "space-between";
header.style.alignItems = "center";
header.style.padding = "5px 10px";
header.style.background = "#1a1a1a";
header.style.color = "white";
header.style.borderTopLeftRadius = "6px";
header.style.borderTopRightRadius = "6px";
header.style.fontWeight = "bold";
header.innerText = "AI Explainer 🤖";
let actionBar = document.createElement("div");
actionBar.style.display = "flex";
actionBar.style.gap = "5px";
actionBar.style.padding = "5px";
actionBar.style.background = "#f0f0f0";
actionBar.style.borderBottom = "1px solid #ddd";

// Close button
let closeBtn = document.createElement("span");
closeBtn.innerText = "✖";
closeBtn.style.cursor = "pointer";
closeBtn.style.marginLeft = "10px";
closeBtn.onclick = () => bubble.remove();
header.appendChild(closeBtn);

// Content area
let content = document.createElement("div");
content.id = "aiBubbleContent";
content.innerText = "AI is thinking...";
content.style.padding = "10px";
content.style.maxHeight = "200px";       // scrollable
content.style.overflowY = "auto";
content.style.background = "#f9f9f9";
content.style.color = "#000";
content.style.fontSize = "13px";
content.style.borderBottomLeftRadius = "6px";
content.style.borderBottomRightRadius = "6px";
content.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
content.style.whiteSpace = "pre-wrap";   // preserves newlines



// Style bubble itself
bubble.style.position = "absolute";
bubble.style.top = (rect.bottom + window.scrollY + 10) + "px"; // below button
bubble.style.left = (rect.left + window.scrollX) + "px";
bubble.style.zIndex = "9999";
bubble.style.width = "300px";
bubble.style.borderRadius = "6px";
bubble.style.fontFamily = "Arial, sans-serif";
bubble.style.transition = "opacity 0.3s ease";
bubble.style.opacity = "0";  // start hidden
bubble.style.transition = "opacity 0.25s ease, transform 0.25s ease";
bubble.style.opacity = "0";
bubble.style.transform = "translateY(10px)";
document.body.appendChild(bubble);

setTimeout(() => {
  bubble.style.opacity = "1";
  bubble.style.transform = "translateY(0px)";
}, 10);

setTimeout(() => {
  document.addEventListener("mousedown", function closePopup(e) {

    if (!bubble.contains(e.target) && e.target !== button) {
      bubble.remove();
      document.removeEventListener("mousedown", closePopup);
    }
    document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    let bubble = document.getElementById("aiBubble");
    if (bubble) bubble.remove();
  }
});

  });
}, 0);

// Fade-in animation
setTimeout(() => { bubble.style.opacity = "1"; }, 10);

   function fetchAI(prompt) {

fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt }
    ]
  })
})
.then(res => res.json())
.then(data => {
  if (data.choices && data.choices.length > 0) {
      content.innerText = data.choices[0].message.content;
  } else {
      content.innerText = "API Error";
  }
})
.catch(err => {
  content.innerText = "Error: " + err.message;
});

}
function createActionButton(label, prompt) {

  let btn = document.createElement("button");
  btn.innerText = label;

  btn.style.flex = "1";
  btn.style.padding = "4px";
  btn.style.border = "none";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";
  btn.style.background = "#ffffff";
  btn.style.fontSize = "12px";

  btn.addEventListener("click", () => {
      content.innerText = "🤖 Thinking...";
      fetchAI(prompt + selectedText);
  });

  return btn;
}
actionBar.appendChild(createActionButton("Explain", "Explain this simply: "));
actionBar.appendChild(createActionButton("Summarize", "Summarize this in 2 sentences: "));
actionBar.appendChild(createActionButton("Simplify", "Explain this like I'm 10: "));
actionBar.appendChild(createActionButton("Translate", "Translate this to English: "));

bubble.appendChild(header);
bubble.appendChild(actionBar);
bubble.appendChild(content);
content.innerText = "🤖 Thinking...";
fetchAI("Explain this simply: " + selectedText);
window.addEventListener("scroll", () => {
    if (bubble) bubble.remove();
});



});
        document.body.appendChild(button);

    } else {
        if (button) {
            button.remove();
            button = null;
        }
    }
});