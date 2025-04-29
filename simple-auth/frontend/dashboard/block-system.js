let blocks = [];
let connections = [];
let selectedBlocks = [];
let scale = 1;

const canvas = document.getElementById("modalCanvas");
const addBlockBtn = document.getElementById("addBlock");
const addNoteBtn = document.getElementById("addNote");
const saveBtn = document.getElementById("saveNote");



addBlockBtn.addEventListener("click", () => {
const block = document.createElement("div");
block.className = "block";
block.contentEditable = true;
block.textContent = "Write something";
block.style.position = "absolute";
block.style.left = Math.random() * 200 + "px";
block.style.top = Math.random() * 200 + "px";

canvas.appendChild(block);
makeDraggable(block);
attachClickHandler(block);
});

addNoteBtn.addEventListener("click", () => {
const note = document.createElement("div");
note.className = "note";
note.contentEditable = true;
note.textContent = "Write something...";
note.style.position = "absolute";
note.style.left = Math.random() * 400 + "px";
note.style.top = Math.random() * 400 + "px";

canvas.appendChild(note);
makeDraggable(note);
attachClickHandler(note);
});

function attachClickHandler(element) {
element.addEventListener("click", (e) => {
if (e.ctrlKey) {
element.classList.toggle("selected");
toggleSelectBlock(element);

if (selectedBlocks.length === 2) {
  connectBlocks(selectedBlocks[0], selectedBlocks[1]);
  selectedBlocks.forEach(el => el.classList.remove("selected"));
  selectedBlocks = [];
}
}
});
}





function toggleSelectBlock(block) {
if (selectedBlocks.includes(block)) {
selectedBlocks = selectedBlocks.filter(b => b !== block);
} else {
selectedBlocks.push(block);
}
}

function connectBlocks(b1, b2) {
const line = new LeaderLine(b1, b2, {
color: '#00f9ff',
size: 3,
startPlug: 'disc',
endPlug: 'arrow3',
});

// Установка z-index с задержкой (вчера обсуждали)
setTimeout(() => {
if (line.line) {
line.line.style.zIndex = 3000;
line.line.style.pointerEvents = "none";
}
}, 100);

connections.push({ b1, b2, line });
}

function makeDraggable(element) {
let isDragging = false;
let offsetX, offsetY;

element.addEventListener("mousedown", (e) => {
const rect = element.getBoundingClientRect();
const edgeSize = 16;

if (
e.clientX > rect.right - edgeSize &&
e.clientY > rect.bottom - edgeSize
) return;

isDragging = true;
offsetX = e.clientX - element.offsetLeft;
offsetY = e.clientY - element.offsetTop;
element.style.zIndex = 1000;
});

document.addEventListener("mousemove", (e) => {
if (isDragging) {
const parent = element.parentElement;

let newLeft = e.clientX - offsetX;
let newTop = e.clientY - offsetY;

// Ограничиваем строго внутри canvas
// newLeft = Math.max(0, Math.min(newLeft, parent.clientWidth - element.offsetWidth));
// newTop = Math.max(0, Math.min(newTop, parent.clientHeight - element.offsetHeight));

element.style.left = newLeft + "px";
element.style.top = newTop + "px";

updateConnections();
}
});

document.addEventListener("mouseup", () => {
isDragging = false;
element.style.zIndex = "";
});
}



function updateConnections() {
connections.forEach(conn => {
conn.line.position();
});
}


saveBtn.onclick = async () => {
  const blocksData = [];

  const allBlocks = canvas.querySelectorAll(".block, .note");
  allBlocks.forEach(block => {
    blocksData.push({
      type: block.classList.contains('note') ? 'note' : 'block',
      text: block.textContent,
      left: block.style.left,
      top: block.style.top
    });
  });

  try {
    await fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ blocks: blocksData })
    });

    console.log("Данные успешно отправлены на сервер");
    canvas.style.display = "default";
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
  }

  
};





const modalContent = document.querySelector(".modal-content");
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;
let spacePressed = false;

modalContent.addEventListener("contextmenu", e => e.preventDefault());
window.addEventListener("mousedown", (e) => {
  if (e.button ===2) {
    spacePressed = true;
    modalContent.style.cursor = "grab";
  }
});
window.addEventListener("mouseup", (e) => {
  if (e.button ===2) {
    spacePressed = false;
    modalContent.style.cursor = "default";
  }
});

document.addEventListener("mousedown", (e) => {
  if (!spacePressed || e.button !== 0) return;

  isPanning = true;
  startX = e.pageX;
  startY = e.pageY;
  scrollLeft = modalContent.scrollLeft;
  scrollTop = modalContent.scrollTop;
  modalContent.style.cursor = "grabbing";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  const dx = e.pageX - startX;
  const dy = e.pageY - startY;
  modalContent.scrollLeft = scrollLeft - dx;
  modalContent.scrollTop = scrollTop - dy;
});

document.addEventListener("mouseup", () => {
  isPanning = false;
  modalContent.style.cursor = spacePressed ? "grab" : "default";
});

document.addEventListener("mouseleave", () => {
  isPanning = false;
  modalContent.style.cursor = spacePressed ? "grab" : "default";
});
