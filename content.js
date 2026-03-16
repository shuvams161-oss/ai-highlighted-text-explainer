let button = null
let selectedText = ""
let conversation = []

document.addEventListener("mouseup", () => {

selectedText = window.getSelection().toString().trim()

if(selectedText.length === 0){

if(button){
button.remove()
button=null
}

return
}

if(button) button.remove()

const rect = window.getSelection().getRangeAt(0).getBoundingClientRect()

button = document.createElement("button")
button.innerText="Explain"

button.style.position="absolute"
button.style.top=(rect.top+window.scrollY)+"px"
button.style.left=(rect.right+window.scrollX)+"px"
button.style.zIndex="9999"
button.style.background="black"
button.style.color="white"
button.style.padding="6px 10px"
button.style.border="none"
button.style.borderRadius="6px"
button.style.cursor="pointer"
button.style.fontSize="12px"

document.body.appendChild(button)

button.addEventListener("mousedown",openBubble)

})

function openBubble(e){

e.preventDefault()

let old = document.getElementById("aiBubble")
if(old) old.remove()

const bubble = document.createElement("div")
bubble.id="aiBubble"

bubble.style.position="fixed"
bubble.style.top="200px"
bubble.style.left="200px"
bubble.style.width="340px"
bubble.style.background="white"
bubble.style.borderRadius="8px"
bubble.style.boxShadow="0 4px 20px rgba(0,0,0,0.2)"
bubble.style.zIndex="9999"
bubble.style.fontFamily="Arial"

document.body.appendChild(bubble)

const header = document.createElement("div")
header.innerText="AI Explainer 🤖"
header.style.background="#111"
header.style.color="white"
header.style.padding="8px"
header.style.cursor="move"
header.style.display="flex"
header.style.justifyContent="space-between"

const close = document.createElement("span")
close.innerText="✖"
close.style.cursor="pointer"
close.onclick=()=>bubble.remove()

header.appendChild(close)

const actions = document.createElement("div")
actions.style.display="flex"
actions.style.flexWrap="wrap"
actions.style.gap="4px"
actions.style.padding="6px"
actions.style.background="#eee"

const content = document.createElement("div")
content.style.padding="10px"
content.style.maxHeight="220px"
content.style.overflowY="auto"
content.style.fontSize="13px"
content.style.whiteSpace="pre-wrap"
content.innerText="🤖 Thinking..."

const chatBox = document.createElement("input")
chatBox.placeholder="Ask follow-up..."
chatBox.style.width="100%"
chatBox.style.padding="6px"
chatBox.style.border="none"
chatBox.style.borderTop="1px solid #ddd"
chatBox.style.outline="none"

bubble.appendChild(header)
bubble.appendChild(actions)
bubble.appendChild(content)
bubble.appendChild(chatBox)

makeDraggable(header,bubble)

function createBtn(label,prompt){

const b=document.createElement("button")

b.innerText=label
b.style.flex="1"
b.style.padding="4px"
b.style.fontSize="11px"
b.style.border="1px solid #ddd"
b.style.borderRadius="4px"
b.style.cursor="pointer"
b.style.background="white"
b.style.color="black"

b.onclick=()=>{
content.innerText="🤖 Thinking..."
conversation=[]
fetchAI(prompt+selectedText,content)
}

return b

}

actions.appendChild(createBtn("Explain","Explain this simply: "))
actions.appendChild(createBtn("Summarize","Summarize this: "))
actions.appendChild(createBtn("Simplify","Explain like I'm 10: "))
actions.appendChild(createBtn("Translate","Translate to English: "))
actions.appendChild(createBtn("Rewrite","Rewrite this clearly: "))
actions.appendChild(createBtn("Quiz","Generate 3 quiz questions from: "))

fetchAI("Explain this simply: "+selectedText,content)

chatBox.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

const q=chatBox.value.trim()
if(!q) return

chatBox.value=""

conversation.push({role:"user",content:q})

fetchAI(q,content)

}

})

}

async function fetchAI(prompt,content){

const key = await new Promise(resolve=>{
chrome.storage.local.get(["groqApiKey"],r=>resolve(r.groqApiKey))
})

if(!key){

content.innerText="Add API key in popup"
return

}

conversation.push({role:"user",content:prompt})

const response = await fetch(
"https://api.groq.com/openai/v1/chat/completions",
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+key
},
body:JSON.stringify({
model:"llama-3.1-8b-instant",
stream:true,
messages:conversation
})
}
)

content.innerText=""

const reader=response.body.getReader()
const decoder=new TextDecoder()

while(true){

const {done,value}=await reader.read()
if(done) break

const chunk=decoder.decode(value)
const lines=chunk.split("\n")

for(const line of lines){

if(line.startsWith("data: ")){

const data=line.replace("data: ","")

if(data==="[DONE]") return

try{

const json=JSON.parse(data)
const token=json.choices?.[0]?.delta?.content

if(token){
content.innerText+=token
}

}catch{}

}

}

}

}

function makeDraggable(header,bubble){

let drag=false
let offsetX=0
let offsetY=0

header.addEventListener("mousedown",(e)=>{

drag=true

const rect=bubble.getBoundingClientRect()

offsetX=e.clientX-rect.left
offsetY=e.clientY-rect.top

})

document.addEventListener("mousemove",(e)=>{

if(!drag) return

bubble.style.left=(e.clientX-offsetX)+"px"
bubble.style.top=(e.clientY-offsetY)+"px"

})

document.addEventListener("mouseup",()=>{
drag=false
})

}