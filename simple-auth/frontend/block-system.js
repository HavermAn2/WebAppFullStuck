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





function closeModal() {
  document.getElementById("modal").style.display = "none";
}
function attachClickHandler(element) {
  element.addEventListener("click", (e) => {
    if (!e.ctrlKey) return;

    element.classList.toggle("selected");
    toggleSelectBlock(element);

    if (selectedBlocks.length === 2) {
      connectBlocks(selectedBlocks[0], selectedBlocks[1]);

      // Очистка выделения
      selectedBlocks.forEach(el => el.classList.remove("selected"));
      selectedBlocks = [];
    }
  });
}


function toggleSelectBlock(block) {
  const index = selectedBlocks.indexOf(block);
  if (index > -1) {
    selectedBlocks.splice(index, 1);
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
    path: 'fluid'
  });

  // Настройки после отрисовки
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
  const blockElements = canvas.querySelectorAll(".block, .note");
  const blockIdMap = new Map();

  // Собираем блоки и сохраняем их индекс
  blockElements.forEach((block, index) => {
    blockIdMap.set(block, index);
    blocksData.push({
      type: block.classList.contains('note') ? 'note' : 'block',
      text: block.textContent,
      left: block.style.left,
      top: block.style.top
    });
  });

  // Собираем соединения (по индексам блоков)
  const connectionsData = connections.map(conn => {
    return {
      from: blockIdMap.get(conn.b1),
      to: blockIdMap.get(conn.b2)
    };
  });

  try {
    const taskId = 1; // здесь можно заменить на активный taskId
    const response = await fetch(`/tasks/${taskId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: blocksData,
        connections: connectionsData
      })
    });

    if (!response.ok) throw new Error("Ошибка при сохранении");

    console.log("✅ Блоки и соединения сохранены");
    alert("✅ Данные успешно сохранены");
    closeModal();

  } catch (error) {
    console.error("❌ Ошибка при сохранении:", error);
    alert("❌ Не удалось сохранить данные");
  }
};





const modalContent = document.querySelector(".modal-content");

let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

// Отключаем контекстное меню по правому клику
modalContent.addEventListener("contextmenu", e => e.preventDefault());

modalContent.addEventListener("mousedown", (e) => {
  if (e.button === 2) { // Правая кнопка мыши
    isPanning = true;
    startX = e.pageX;
    startY = e.pageY;
    scrollLeft = modalContent.scrollLeft;
    scrollTop = modalContent.scrollTop;
    modalContent.style.cursor = "grabbing";
  }
});

document.addEventListener("mousemove", (e) => {
  if (!isPanning) return;

  const dx = e.pageX - startX;
  const dy = e.pageY - startY;
  modalContent.scrollLeft = scrollLeft - dx;
  modalContent.scrollTop = scrollTop - dy;
  updateConnections()
});

document.addEventListener("mouseup", (e) => {
  if (e.button === 2) {
    isPanning = false;
    modalContent.style.cursor = "default";
  }
});


let scalle = 1; // текущий масштаб

modalContent.addEventListener("wheel", (e) => {
  // Только при зажатом Ctrl (или убери это условие, если хочешь всегда)
  if (!e.ctrlKey) return;

  e.preventDefault(); // отключаем scroll
  const zoomIntensity = 0.1;
  const delta = -e.deltaY;

  if (delta > 0) {
    scalle *= 1 + zoomIntensity; // zoom in
    updateConnections()
  } else {
    scalle *= 1 - zoomIntensity; // zoom out
    updateConnections()
  }

  // Ограничим масштаб
  scalle = Math.max(0.2, Math.min(scalle, 4));

  canvas.style.transform = `scalle(${scalle})`;





});

modalContent.addEventListener("scroll", () => {
  updateConnections(); // Функция, которая обновляет все линии
});

function updateConnections() {
  connections.forEach(conn => {
    conn.line.position();
  });
}

