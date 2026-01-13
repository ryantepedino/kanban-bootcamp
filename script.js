// Estado global
let cards = [];
let editingCardId = null;

// Elementos do DOM
const modal = document.getElementById('modal');
const addCardBtn = document.getElementById('addCardBtn');
const closeBtn = document.querySelector('.close');
const cardForm = document.getElementById('cardForm');
const modalTitle = document.getElementById('modal-title');
const cardTitle = document.getElementById('cardTitle');
const cardDescription = document.getElementById('cardDescription');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderAllCards();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addCardBtn.addEventListener('click', openModalForNew);
    closeBtn.addEventListener('click', closeModal);
    cardForm.addEventListener('submit', handleFormSubmit);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// LocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('kanbanCards');
    cards = saved ? JSON.parse(saved) : [];
}

function saveToLocalStorage() {
    localStorage.setItem('kanbanCards', JSON.stringify(cards));
}

// Modal
function openModalForNew() {
    editingCardId = null;
    modalTitle.textContent = 'Novo Card';
    cardTitle.value = '';
    cardDescription.value = '';
    modal.style.display = 'block';
}

function openModalForEdit(id) {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    editingCardId = id;
    modalTitle.textContent = 'Editar Card';
    cardTitle.value = card.title;
    cardDescription.value = card.description;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

// CRUD
function handleFormSubmit(e) {
    e.preventDefault();

    const title = cardTitle.value.trim();
    const description = cardDescription.value.trim();

    if (!title) {
        alert('O título é obrigatório!');
        return;
    }

    if (editingCardId) {
        updateCard(editingCardId, title, description);
    } else {
        createCard(title, description);
    }

    closeModal();
}

function createCard(title, description) {
    const newCard = {
        id: Date.now(),
        title,
        description,
        status: 'todo'
    };

    cards.push(newCard);
    saveToLocalStorage();
    renderAllCards();
}

function updateCard(id, title, description) {
    const card = cards.find(c => c.id === id);
    if (card) {
        card.title = title;
        card.description = description;
        saveToLocalStorage();
        renderAllCards();
    }
}

function deleteCard(id) {
    if (confirm('Tem certeza que deseja excluir este card?')) {
        cards = cards.filter(c => c.id !== id);
        saveToLocalStorage();
        renderAllCards();
    }
}

function moveCard(id, newStatus) {
    const card = cards.find(c => c.id === id);
    if (card) {
        card.status = newStatus;
        saveToLocalStorage();
        renderAllCards();
    }
}

// Renderização
function renderAllCards() {
    // Limpar colunas
    document.getElementById('todo-cards').innerHTML = '';
    document.getElementById('doing-cards').innerHTML = '';
    document.getElementById('done-cards').innerHTML = '';

    // Renderizar cards
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        document.getElementById(`${card.status}-cards`).appendChild(cardElement);
    });
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <h3>${card.title}</h3>
        <p>${card.description || 'Sem descrição'}</p>
        <div class="card-actions">
            <button class="btn-small btn-edit" onclick="openModalForEdit(${card.id})">Editar</button>
            <button class="btn-small btn-delete" onclick="deleteCard(${card.id})">Excluir</button>
            ${getMoveButtons(card)}
        </div>
    `;
    return div;
}

function getMoveButtons(card) {
    let buttons = '';

    if (card.status !== 'todo') {
        buttons += `<button class="btn-small btn-move" onclick="moveCard(${card.id}, 'todo')">→ To Do</button>`;
    }
    if (card.status !== 'doing') {
        buttons += `<button class="btn-small btn-move" onclick="moveCard(${card.id}, 'doing')">→ Doing</button>`;
    }
    if (card.status !== 'done') {
        buttons += `<button class="btn-small btn-move" onclick="moveCard(${card.id}, 'done')">→ Done</button>`;
    }

    return buttons;
}
