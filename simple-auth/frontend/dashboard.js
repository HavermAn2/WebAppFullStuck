
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const textarea = document.getElementById("taskNote");
const saveBtn = document.getElementById("saveNote");

let currentTaskId = null;

const taskColumn = document.getElementById("Tasks");

// Добавление задачи
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value;

  await fetch("http://localhost:3000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  document.getElementById("taskTitle").value = "";
  loadTasks();
});

// Загрузка задач
async function loadTasks() {
  const res = await fetch("http://localhost:3000/tasks");
  const tasks = await res.json();

  taskColumn.innerHTML = "<h2>Tasks</h2>"; // очистить колонку

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.textContent = task.title;

    // Кнопка удаления
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑️";
    delBtn.title = "Удалить задачу";

    delBtn.onclick = async () => {
      await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: "DELETE"
      });
      loadTasks();
    };
    div.onclick = () => {
      openModal(task);
    };
    

    div.appendChild(delBtn);
    taskColumn.appendChild(div);
  });
}
function openModal(task) {
  currentTaskId = task.id;
  document.getElementById("modal").style.display = "flex";

  // Очистка канваса перед загрузкой
  const canvas = document.getElementById("modalCanvas");
  canvas.innerHTML = "";
  blocks = [];
  connections = [];

  // Здесь можно подгружать блоки из localStorage или сервера
  // Пример: loadTaskBlocks(task.id);
}


closeModalBtn.onclick = () => {
  modal.style.display = "none";
};




saveBtn.onclick = () => {
  console.log(`Сохраняем заметку для задачи #${currentTaskId}: ${textarea.value}`);
  // Здесь можешь реализовать отправку на сервер (PUT) или сохранить в localStorage
  //
  //
  //
  //
  //
  modal.style.display = "none";
};





document.getElementById("chat-form").addEventListener("submit", async e => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  addChatMessage("Вы", message);
  input.value = "";

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    const reply = data.reply;
    addChatMessage("Бот", reply);

    // // 🔍 Авто-добавление задач
    // if (reply.toLowerCase().includes("добавлена")) {
    //   const match = reply.match(/"(.+?)"/);
    //   if (match) {
    //     const taskTitle = match[1];
    //     await fetch("http://localhost:3000/tasks", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ title: taskTitle })
    //     });
    //     loadTasks(); // перезагрузка задач
    //   }
    // }

  } catch (err) {
    addChatMessage("Бот", "❌ Ошибка соединения с сервером.");
    console.error(err);
  }
});

function addChatMessage(sender, text) {
  const log = document.getElementById("chat-log");
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${text}`;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}


loadTasks();
