let button = null;
let selectedText = "";

document.addEventListener("mouseup", function () {
    selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {

        if (button) button.remove();

        let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

        button = document.createElement("button");
        button.innerText = "Explain";

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

        button.addEventListener("mousedown", function (e) {

            e.stopPropagation();
            e.preventDefault();

            let oldBubble = document.getElementById("aiBubble");
            if (oldBubble) oldBubble.remove();

            let bubble = document.createElement("div");
            bubble.id = "aiBubble";

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
            header.style.cursor = "move";

            let closeBtn = document.createElement("span");
            closeBtn.innerText = "✖";
            closeBtn.style.cursor = "pointer";
            closeBtn.onclick = () => bubble.remove();
            header.appendChild(closeBtn);

            let actionBar = document.createElement("div");
            actionBar.style.display = "flex";
            actionBar.style.gap = "5px";
            actionBar.style.padding = "5px";
            actionBar.style.background = "#f0f0f0";
            actionBar.style.borderBottom = "1px solid #ddd";

            let content = document.createElement("div");
            content.id = "aiBubbleContent";
            content.innerText = "AI is thinking...";
            content.style.padding = "10px";
            content.style.maxHeight = "200px";
            content.style.overflowY = "auto";
            content.style.background = "#f9f9f9";
            content.style.color = "#000";
            content.style.fontSize = "13px";
            content.style.borderBottomLeftRadius = "6px";
            content.style.borderBottomRightRadius = "6px";
            content.style.whiteSpace = "pre-wrap";

            bubble.style.position = "fixed";
            bubble.style.top = (rect.bottom + window.scrollY + 10) + "px";
            bubble.style.left = (rect.left + window.scrollX) + "px";
            bubble.style.zIndex = "9999";
            bubble.style.width = "300px";
            bubble.style.borderRadius = "6px";
            bubble.style.fontFamily = "Arial, sans-serif";
            bubble.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            bubble.style.opacity = "0";
            bubble.style.transform = "translateY(10px)";
            bubble.style.transition = "opacity 0.25s ease, transform 0.25s ease";

            document.body.appendChild(bubble);

            setTimeout(() => {
                bubble.style.opacity = "1";
                bubble.style.transform = "translateY(0px)";
            }, 10);

            document.addEventListener("mousedown", function closePopup(e) {
                if (!bubble.contains(e.target) && e.target !== button) {
                    bubble.remove();
                    document.removeEventListener("mousedown", closePopup);
                }
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    let bubble = document.getElementById("aiBubble");
                    if (bubble) bubble.remove();
                }
            });

            function fetchAI(prompt) {

                chrome.storage.local.get(["groqApiKey"], (result) => {

                    const key = result.groqApiKey;

                    if (!key) {
                        content.innerText = "⚠️ Add your Groq API key in extension popup.";
                        return;
                    }

                    fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + key
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

            let isDragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener("mousedown", (e) => {
    isDragging = true;

    const rect = bubble.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {

    if (!isDragging) return;

    bubble.style.left = (e.clientX - offsetX) + "px";
    bubble.style.top = (e.clientY - offsetY) + "px";

});

document.addEventListener("mouseup", () => {
    isDragging = false;
});
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