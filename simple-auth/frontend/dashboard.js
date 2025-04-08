const columns = {
    "TODO": document.getElementById("Planing"),
    "In Progress": document.getElementById("In Progress"),
    "Done": document.getElementById("Done"),
  };
  
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
  
  async function loadTasks() {
    const res = await fetch("http://localhost:3000/tasks");
    const tasks = await res.json();
  
    // Очищаем колонки
    Object.values(columns).forEach(col => {
      col.innerHTML = `<h2>${col.id}</h2>`;
    });
  
    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task";
        div.textContent = task.title;
        div.draggable = true;
        div.dataset.id = task.id;
      
        // Обработчик перетаскивания задачи
        div.addEventListener("dragstart", e => {
          e.dataTransfer.setData("text/plain", task.id);
          e.dataTransfer.effectAllowed = "move";
        });
      
        // Статус селектор

      
    
      
        // Кнопка удаления задачи
        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "🗑️";
        delBtn.title = "Удалить задачу";
      
        // Передаем task в обработчик через замыкание
        delBtn.onclick = async () => {
          await fetch(`http://localhost:3000/tasks/${task.id}`, {
            method: "DELETE"
          });
          loadTasks();
        };
      
        div.appendChild(delBtn);
        columns[task.status].appendChild(div); 
      });
  }
  
  Object.entries(columns).forEach(([status, column]) => {
    column.addEventListener("dragover", e => {
      e.preventDefault(); // нужно разрешить drop
      e.dataTransfer.dropEffect = "move";
      column.style.backgroundColor = "#ddd";
    });
  
    column.addEventListener("dragleave", () => {
      column.style.backgroundColor = "";
    });
  
    column.addEventListener("drop", async e => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      column.style.backgroundColor = "";
  
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
  
      loadTasks();
    });
  });
  
  loadTasks();
  