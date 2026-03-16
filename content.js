let button = null;
let selectedText = "";

document.addEventListener("mouseup", function () {

selectedText = window.getSelection().toString().trim();

if(selectedText.length === 0){
if(button){
button.remove();
button=null;
}
return;
}

if(button) button.remove();

let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

button = document.createElement("button");
button.innerText="Explain";

button.style.position="absolute";
button.style.top=(rect.top+window.scrollY)+"px";
button.style.left=(rect.right+window.scrollX)+"px";
button.style.zIndex="9999";
button.style.background="black";
button.style.color="white";
button.style.padding="6px 10px";
button.style.border="none";
button.style.borderRadius="6px";
button.style.cursor="pointer";
button.style.fontSize="12px";

document.body.appendChild(button);

button.addEventListener("mousedown",openBubble);

});

function openBubble(e){

e.preventDefault();
e.stopPropagation();

let oldBubble=document.getElementById("aiBubble");
if(oldBubble) oldBubble.remove();

let bubble=document.createElement("div");
bubble.id="aiBubble";

bubble.style.position="fixed";
bubble.style.top="200px";
bubble.style.left="200px";
bubble.style.width="320px";
bubble.style.background="white";
bubble.style.borderRadius="8px";
bubble.style.boxShadow="0 4px 20px rgba(0,0,0,0.2)";
bubble.style.zIndex="9999";
bubble.style.fontFamily="Arial";

document.body.appendChild(bubble);

let header=document.createElement("div");
header.innerText="AI Explainer 🤖";
header.style.background="#111";
header.style.color="white";
header.style.padding="8px";
header.style.cursor="move";
header.style.display="flex";
header.style.justifyContent="space-between";
header.style.alignItems="center";

let close=document.createElement("span");
close.innerText="✖";
close.style.cursor="pointer";
close.onclick=()=>bubble.remove();

header.appendChild(close);

let actionBar=document.createElement("div");
actionBar.style.display="flex";
actionBar.style.gap="5px";
actionBar.style.padding="5px";
actionBar.style.background="#eee";

let content=document.createElement("div");
content.style.padding="10px";
content.style.fontSize="13px";
content.style.maxHeight="200px";
content.style.overflowY="auto";
content.innerText="🤖 Thinking...";

bubble.appendChild(header);
bubble.appendChild(actionBar);
bubble.appendChild(content);

function createActionButton(label,prompt){

let btn=document.createElement("button");

btn.innerText=label;

btn.style.flex="1";
btn.style.padding="4px";
btn.style.background="#fff";
btn.style.color="black";
btn.style.border="1px solid #ddd";
btn.style.borderRadius="4px";
btn.style.cursor="pointer";
btn.style.fontSize="12px";

btn.onclick=()=>{
content.innerText="🤖 Thinking...";
fetchAI(prompt+selectedText,content);
}

return btn;

}

actionBar.appendChild(createActionButton("Explain","Explain this simply: "));
actionBar.appendChild(createActionButton("Summarize","Summarize this: "));
actionBar.appendChild(createActionButton("Simplify","Explain like I'm 10: "));
actionBar.appendChild(createActionButton("Translate","Translate to English: "));

fetchAI("Explain this simply: "+selectedText,content);

makeDraggable(header,bubble);

}

async function fetchAI(prompt,content){

const key = await new Promise(resolve=>{
chrome.storage.local.get(["groqApiKey"],r=>resolve(r.groqApiKey))
})

if(!key){
content.innerText="Add API key in popup";
return;
}

content.innerText="";

const response=await fetch(
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
messages:[
{role:"user",content:prompt}
]
})
}
)

const reader=response.body.getReader();
const decoder=new TextDecoder();

while(true){

const {done,value}=await reader.read();
if(done) break;

const chunk=decoder.decode(value);
const lines=chunk.split("\n");

for(let line of lines){

if(line.startsWith("data: ")){

let data=line.replace("data: ","");

if(data==="[DONE]") return;

try{

let json=JSON.parse(data);
let token=json.choices?.[0]?.delta?.content;

if(token) content.innerText+=token;

}catch(e){}

}

}

}

}

function makeDraggable(header,bubble){

let isDragging=false;
let offsetX=0;
let offsetY=0;

header.addEventListener("mousedown",(e)=>{

isDragging=true;

const rect=bubble.getBoundingClientRect();

offsetX=e.clientX-rect.left;
offsetY=e.clientY-rect.top;

});

document.addEventListener("mousemove",(e)=>{

if(!isDragging) return;

bubble.style.left=(e.clientX-offsetX)+"px";
bubble.style.top=(e.clientY-offsetY)+"px";

});

document.addEventListener("mouseup",()=>{
isDragging=false;
});

}