


  const contextMenu = document.getElementById("contextMenu");
  
  const modal = document.getElementById("modalCanvas");
  const closeModalBtn = document.getElementById("closeModal");
  const textarea = document.getElementById("taskNote");
  const redactBtn = document.getElementById('redactTask');
  const deleteBtn = document.getElementById('deleteTask');
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
  
    taskColumn.innerHTML = "<h2>Tasks</h2>";
  
    tasks.forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      div.textContent = task.title;
      div.dataset.id = task.id; 
  
  
      // // Кнопка удаления
      // const deleteBtn = document.createElement("button");
      // deleteBtn.className = "delete-btn";
      // deleteBtn.textContent = "🗑️";
      // deleteBtn.title = "Удалить задачу";
  
  
  
  
  
  
      redactBtn.onclick = () => {
        openModal(task);
      };
      
      
      taskColumn.appendChild(div);
    });
  
  
  
  }
  
  document.addEventListener('contextmenu', (e) => {
    const taskEl = e.target.closest('.task');
    if (!taskEl) return;
  
    e.preventDefault();
  
    currentTaskId = taskEl.dataset.id; 
  
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.display = 'block';
  });
  
  // Скрываем при клике вне меню
  document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
  });
  
  // Клик по "Удалить"
  deleteBtn.addEventListener('click', async () => {
    if (!currentTaskId) return;
     
    await fetch(`http://localhost:3000/tasks/${currentTaskId}`, {
      method: "DELETE"
    });
  
    contextMenu.style.display = 'none';
    currentTaskId = null;
    loadTasks();
  });
  


  function openModal(task) {
    currentTaskId = task.id;
    document.getElementById("modal").style.display = "flex";
  
    // Очистка канваса перед загрузкой
    const canvas = document.getElementById("modalCanvas");
    canvas.innerHTML = "";
    blocks = [];
    connections = [];
  }
  
  
  
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
  












