const express = require("express");
const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors())

const users = []; // временное хранилище пользователей
const JWT_SECRET = "super_secret_key"; // секрет для токена
const tasks = []; // массив задач
let taskId = 1; // уникальный ID

// Регистрация
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Пользователь уже существует" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "Регистрация успешна" });

});

// Логин
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "Неверные данные" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Неверные данные" });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1d" });

  res.json({ message: "Вход успешен", token });
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




app.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"))