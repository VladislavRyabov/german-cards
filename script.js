// НАСТРОЙКИ GITHUB — ОБЯЗАТЕЛЬНО ЗАПОЛНИТЕ СВОИМИ ДАННЫМИ
const GITHUB_USERNAME = 'vladislavryabov'; 
const GITHUB_REPO = 'german-cards'; 
const FILE_PATH = 'index.html'; 

const TOKEN_KEY = 'gh_token_cards';

document.addEventListener('DOMContentLoaded', () => {
  updateCounters();
  checkToken();
});

// Проверка токена
function checkToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = prompt('Пожалуйста, введите ваш GitHub Personal Access Token (repo):');
    if (token) {
      localStorage.setItem(TOKEN_KEY, token.trim());
    }
  }
}

// Подсчет статистики
function updateCounters() {
  const cards = document.querySelectorAll('.card');
  let totalWordsCount = 0;

  cards.forEach(card => {
    const wordElement = card.querySelector('.word');
    let phraseText = wordElement ? wordElement.innerText : card.querySelector('.edit-word').value;
    phraseText = phraseText.trim();
    if (phraseText.length > 0) {
      const wordsArray = phraseText.split(/\s+/);
      totalWordsCount += wordsArray.length;
    }
  });

  document.getElementById('totalPhrases').innerText = cards.length;
  document.getElementById('totalWords').innerText = totalWordsCount;
}

// Генерация чистого HTML для отправки в репозиторий
function generateFullHTML(cardsHTML) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Изучение немецкого языка</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Мои немецкие карточки</h1>
  <div class="stats-container">
    Выучено фраз: <span id="totalPhrases">0</span> | Всего немецких слов: <span id="totalWords">0</span>
  </div>
  <div class="form-container">
    <div class="form-group">
      <label for="germanWord">Немецкая фраза:</label>
      <input type="text" id="germanWord" placeholder="например, Ich liebe dich">
    </div>
    <div class="form-group">
      <label for="pronunciation">Произношение (русскими буквами):</label>
      <input type="text" id="pronunciation" placeholder="например, их либэ дихь">
    </div>
    <div class="form-group">
      <label for="translation">Перевод:</label>
      <input type="text" id="translation" placeholder="например, Я люблю тебя">
    </div>
    <button onclick="addCard()">Добавить карточку</button>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <button onclick="saveToGitHub()" style="background-color: #007bff; width: auto; padding: 10px 20px; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
      ☁️ Сохранить изменения на GitHub
    </button>
  </div>
  <div class="cards-grid" id="cardsGrid">
    ${cardsHTML}
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}

// Добавление карточки
function addCard() {
  const wordInput = document.getElementById('germanWord');
  const pronInput = document.getElementById('pronunciation');
  const transInput = document.getElementById('translation');

  const wordText = wordInput.value.trim();
  const pronText = pronInput.value.trim();
  const transText = transInput.value.trim();

  if (!wordText || !pronText || !transText) {
    alert('Пожалуйста, заполните все поля!');
    return;
  }

  const cardsGrid = document.getElementById('cardsGrid');
  const newCard = document.createElement('div');
  newCard.className = 'card';
  newCard.innerHTML = `
    <div class="card-content">
      <div class="word">${wordText}</div>
      <div class="pronunciation">[${pronText}]</div>
      <div class="translation">${transText}</div>
    </div>
    <div class="card-buttons">
      <button class="card-btn edit-btn" onclick="editCard(this)">Изменить</button>
      <button class="card-btn delete-btn" onclick="deleteCard(this)">Удалить</button>
    </div>
  `;

  cardsGrid.appendChild(newCard);
  wordInput.value = ''; pronInput.value = ''; transInput.value = '';
  updateCounters();
}

// Редактирование карточки
function editCard(button) {
  const card = button.closest('.card');
  const contentDiv = card.querySelector('.card-content');
  const currentWord = contentDiv.querySelector('.word').innerText;
  const currentPron = contentDiv.querySelector('.pronunciation').innerText.replace('[', '').replace(']', '');
  const currentTrans = contentDiv.querySelector('.translation').innerText;

  contentDiv.innerHTML = `
    <input type="text" class="edit-input edit-word" value="${currentWord}">
    <input type="text" class="edit-input edit-pron" value="${currentPron}">
    <input type="text" class="edit-input edit-trans" value="${currentTrans}">
  `;
  card.querySelector('.card-buttons').innerHTML = `<button class="card-btn save-btn" onclick="saveCard(this)">Сохранить</button>`;
}

function saveCard(button) {
  const card = button.closest('.card');
  const contentDiv = card.querySelector('.card-content');
  const newWord = card.querySelector('.edit-word').value.trim();
  const newPron = card.querySelector('.edit-pron').value.trim();
  const newTrans = card.querySelector('.edit-trans').value.trim();

  if (!newWord || !newPron || !newTrans) { alert('Поля не должны быть пустыми!'); return; }

  contentDiv.innerHTML = `<div class="word">${newWord}</div><div class="pronunciation">[${newPron}]</div><div class="translation">${newTrans}</div>`;
  card.querySelector('.card-buttons').innerHTML = `
    <button class="card-btn edit-btn" onclick="editCard(this)">Изменить</button>
    <button class="card-btn delete-btn" onclick="deleteCard(this)">Удалить</button>
  `;
  updateCounters();
}

// Функция удаления карточки с экрана
function deleteCard(button) {
  if (confirm('Вы уверены, что хотите удалить эту фразу?')) {
    const card = button.closest('.card');
    card.remove();
    updateCounters();
  }
}

// Сохранение изменений в репозиторий GitHub через API
async function saveToGitHub() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) { checkToken(); return; }

  if (document.querySelectorAll('.edit-input').length > 0) {
    alert('Пожалуйста, сохраните все карточки перед отправкой в облако!');
    return;
  }

  const cardsHTML = document.getElementById('cardsGrid').innerHTML;
  const newHTMLContent = generateFullHTML(cardsHTML);

  const url = `https://github.com{GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`;

  try {
    const responseGet = await fetch(url, {
      headers: { 'Authorization': `token ${token}` }
    });
    
    if (!responseGet.ok) throw new Error('Не удалось получить файл с GitHub. Проверьте логин, имя репозитория или токен.');
    
    const fileData = await responseGet.json();
    const sha = fileData.sha;

    // Безопасный перевод строки UTF-8 в Base64 (с поддержкой кириллицы и умлаутов)
    const b64Content = btoa(encodeURIComponent(newHTMLContent).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));


    const responsePut = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update vocabulary cards',
        content: b64Content,
        sha: sha
      })
    });

    if (responsePut.ok) {
      alert('🎉 Карточки успешно сохранены на GitHub навсегда!');
    } else {
      const errorData = await responsePut.json();
      alert('Ошибка при сохранении: ' + errorData.message);
    }
  } catch (error) {
    alert(error.message);
  }
}
