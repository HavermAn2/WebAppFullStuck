// Обработчик формы регистрации
document.getElementById('register').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  // Отправка данных на сервер
  const response = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  document.getElementById('message').innerText = result.message;
});

// Обработчик формы логина
document.getElementById('login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  // Отправка данных на сервер
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if(response.ok){
    window.location.href = 'main.html';
  }
  else{
  document.getElementById('message').innerText = result.message || result.error || 'Error';
  }
  document.getElementById('message').innerText = result.message || result.error || '';
});
