const express = require("express");
const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const fs = require('fs');
const db = require('./db');

app.use(express.json());


app.use(express.static(path.join(__dirname, 'frontend')));

app.use(cors())

const users = []; // временное хранилище пользователей
const tasks = []; // массив задач
let taskId = 1; // уникальный ID
const JWT_SECRET = 'mysecret'; // Вынеси наверх и сохрани в .env в будущем




app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 🔐 Проверка входных данных
  if (!username || !password) {
    return res.status(400).json({ error: "Введите логин и пароль" });
  }

  try {
    // 🔐 Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Пытаемся вставить пользователя в БД
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        if (err) {
          // 📛 Если логин уже занят (UNIQUE constraint)
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "Логин уже занят" });
          }

          // 🧱 Прочая ошибка БД
          console.error("❌ Ошибка базы данных:", err.message);
          return res.status(500).json({ error: "Ошибка базы данных" });
        }

        // ✅ Успешная регистрация
        return res.status(201).json({ message: "Регистрация успешна" });
      }
    );

  } catch (error) {
    // 🚨 Ошибка сервера (например, bcrypt)
    console.error("❌ Ошибка сервера:", error);
    return res.status(500).json({ error: "Ошибка на сервере" });
  }
});




// Вход
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user)
      return res.status(400).json({ error: "Неверный логин" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Неверный пароль" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Вход успешен",
      token,
      userId: user.id
    });
  });
});


//ChatAI
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral", 
        prompt: message,
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ reply: data.response.trim() });

  } catch (err) {
    console.error("Ошибка при обращении к Ollama:", err);
    res.status(500).json({ error: "Ollama не отвечает" });
  }
});





app.post('/save', (req, res) => {
  const data = req.body;

  fs.writeFileSync(path.join(__dirname, 'savedData.json'), JSON.stringify(data, null, 2));

  res.sendStatus(200);
});






// Получение списка пользователей
app.get("/users", (req, res) => {
  res.json(users); // Отправляем весь массив пользователей в ответе
});
// Получить все задачи
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Создать новую задачу
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  const newTask = { id: taskId++, title, status: "TODO" };
  tasks.push(newTask);
  res.status(201).json({ message: "Задача добавлена", task: newTask });
});

// Обновить статус задачи
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find(t => t.id ==  Number(id));
  if (!task) return res.status(404).json({ message: "Задача не найдена" });

  task.status = status;
  res.json({ message: "Статус обновлен", task });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Получен запрос на удаление задачи с id: ${id}`);
  const index = tasks.findIndex(t => t.id ==  Number(id));
  if (index === -1) return res.status(404).json({ message: "Задача не найдена" });

  tasks.splice(index, 1);
  res.json({ message: "Задача удалена" });
});




app.post("/tasks/:taskId/save", (req, res) => {
  const { blocks, connections } = req.body;
  const taskId = req.params.taskId;

  db.serialize(() => {
    // Удаляем старые блоки и связи
    db.run("DELETE FROM blocks WHERE taskId = ?", [taskId]);
    db.run(`
      DELETE FROM connections
      WHERE fromBlockId IN (SELECT id FROM blocks WHERE taskId = ?)
         OR toBlockId IN (SELECT id FROM blocks WHERE taskId = ?)
    `, [taskId, taskId]);

    const blockIdMap = new Map();
    const stmt = db.prepare("INSERT INTO blocks (taskId, type, text, left, top) VALUES (?, ?, ?, ?, ?)");

    // Сохраняем блоки
    blocks.forEach((block, index) => {
      stmt.run(taskId, block.type, block.text, block.left, block.top, function () {
        blockIdMap.set(index, this.lastID); // сохраняем новый ID блоков
      });
    });

    stmt.finalize(() => {
      const connStmt = db.prepare("INSERT INTO connections (fromBlockId, toBlockId) VALUES (?, ?)");

      connections.forEach(conn => {
        const fromId = blockIdMap.get(conn.from);
        const toId = blockIdMap.get(conn.to);

        if (fromId && toId) {
          connStmt.run(fromId, toId);
        }
      });

      connStmt.finalize(() => {
        res.status(200).json({ message: "Задача сохранена успешно" });
      });
    });
  });
});




app.get("/tasks/:taskId/load", (req, res) => {
  const taskId = req.params.taskId;

  db.all("SELECT * FROM blocks WHERE taskId = ?", [taskId], (err, blocks) => {
    if (err) return res.status(500).json({ error: "Ошибка при загрузке блоков" });

    db.all(`
      SELECT c.id, c.fromBlockId, c.toBlockId
      FROM connections c
      JOIN blocks b1 ON c.fromBlockId = b1.id
      JOIN blocks b2 ON c.toBlockId = b2.id
      WHERE b1.taskId = ? AND b2.taskId = ?
    `, [taskId, taskId], (err, connections) => {
      if (err) return res.status(500).json({ error: "Ошибка при загрузке соединений" });

      res.json({ blocks, connections });
    });
  });
});







app.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"))