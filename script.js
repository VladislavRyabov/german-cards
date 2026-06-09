document.addEventListener('DOMContentLoaded', () => {
  updateCounters();
});

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

// Генерация чистого HTML для сохранения
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
    <button onclick="saveProject()" style="background-color: #28a745; width: auto; padding: 12px 24px; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">
      💾 СКАЧАТЬ ОБНОВЛЕННЫЙ ФАЙЛ INDEX.HTML
    </button>
  </div>
  <div class="cards-grid" id="cardsGrid">
    ${cardsHTML}
  </div>
  <script src="${window.location.pathname.includes('app.js') ? 'app.js' : 'script.js'}"></script>
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

// Удаление карточки
function deleteCard(button) {
  if (confirm('Вы уверены, что хотите удалить эту фразу?')) {
    const card = button.closest('.card');
    card.remove();
    updateCounters();
  }
}

// Локальное сохранение файла на ПК/Телефон
function saveProject() {
  if (document.querySelectorAll('.edit-input').length > 0) {
    alert('Пожалуйста, сохраните все редактируемые карточки перед скачиванием файла!');
    return;
  }

  const cardsHTML = document.getElementById('cardsGrid').innerHTML;
  const newHTMLContent = generateFullHTML(cardsHTML);

  const blob = new Blob([newHTMLContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'index.html'; 
  link.click();
  URL.revokeObjectURL(link.href);
}
