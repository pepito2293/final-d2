// Importation des émojis par défaut et des fonctions de stockage
const defaultEmojis = [
    "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
    "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
    "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
    "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
    "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
    "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour charger les émojis depuis localStorage
function loadEmojiList() {
    const storedEmojis = localStorage.getItem("emojiList");
    return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
}

// Fonction pour sauvegarder les émojis dans localStorage
function saveEmojiList(emojiList) {
    localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Fonction pour créer une ligne d'émoji dans le tableau
function createEmojiRow(emoji, index, tbody) {
    const row = document.createElement("tr");
    
    // Numéro
    const numCell = document.createElement("td");
    numCell.textContent = index + 1;
    row.appendChild(numCell);
    
    // Émoji actuel
    const currentEmojiCell = document.createElement("td");
    if (emoji.startsWith("data:image")) {
        const img = document.createElement("img");
        img.src = emoji;
        img.style.width = "50px";
        img.style.height = "50px";
        currentEmojiCell.appendChild(img);
    } else {
        currentEmojiCell.textContent = emoji;
        currentEmojiCell.style.fontSize = "30px";
    }
    row.appendChild(currentEmojiCell);
    
    // Input pour nouvelle image
    const newImageCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    
    const label = document.createElement("label");
    label.className = "bouton-style";
    label.textContent = "Choisir une image";
    label.appendChild(input);
    
    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const emojiList = loadEmojiList();
                emojiList[index] = e.target.result;
                saveEmojiList(emojiList);
                populateEmojiTable();
            };
            reader.readAsDataURL(file);
        }
    });
    
    newImageCell.appendChild(label);
    row.appendChild(newImageCell);
    
    // Bouton de réinitialisation
    const resetCell = document.createElement("td");
    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "↺";
    resetButton.onclick = () => {
        const emojiList = loadEmojiList();
        emojiList[index] = defaultEmojis[index];
        saveEmojiList(emojiList);
        populateEmojiTable();
    };
    resetCell.appendChild(resetButton);
    row.appendChild(resetCell);
    
    tbody.appendChild(row);
}

// Fonction pour remplir le tableau des émojis
function populateEmojiTable() {
    const emojiList = loadEmojiList();
    
    // Tableau de gauche (émojis 1-29)
    const leftTbody = document.querySelector("#leftEmojiTable tbody");
    leftTbody.innerHTML = "";
    
    // Tableau de droite (émojis 30-57)
    const rightTbody = document.querySelector("#rightEmojiTable tbody");
    rightTbody.innerHTML = "";
    
    // Remplir le tableau de gauche (1-29)
    for (let i = 0; i < 29; i++) {
        if (i < emojiList.length) {
            createEmojiRow(emojiList[i], i, leftTbody);
        }
    }
    
    // Remplir le tableau de droite (30-57)
    for (let i = 29; i < emojiList.length; i++) {
        createEmojiRow(emojiList[i], i, rightTbody);
    }
}

// Fonction pour gérer le dos de carte
function setupCardBackManager() {
    const cardBackUpload = document.getElementById("cardBackUpload");
    const cardBackPreview = document.getElementById("cardBackPreview");
    const cardBackImg = cardBackPreview?.querySelector("img");
    const removeCardBack = document.getElementById("removeCardBack");
    
    // Charger le dos de carte depuis localStorage s'il existe
    const savedCardBack = localStorage.getItem("cardBackImage");
    if (savedCardBack && cardBackImg && cardBackPreview) {
        cardBackImg.src = savedCardBack;
        cardBackPreview.style.display = "block";
    }
    
    // Gérer l'upload d'un nouveau dos de carte
    if (cardBackUpload && cardBackPreview && cardBackImg) {
        cardBackUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    cardBackImg.src = e.target.result;
                    cardBackPreview.style.display = "block";
                    localStorage.setItem("cardBackImage", e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Gérer la suppression du dos de carte
    if (removeCardBack && cardBackPreview) {
        removeCardBack.addEventListener("click", () => {
            localStorage.removeItem("cardBackImage");
            cardBackPreview.style.display = "none";
        });
    }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    // Remplir le tableau des émojis
    populateEmojiTable();

    // Gérer le bouton "Tout réinitialiser"
    document.getElementById("resetAll")?.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment réinitialiser tous les émojis ?")) {
            localStorage.setItem("emojiList", JSON.stringify(defaultEmojis));
            populateEmojiTable();
        }
    });
    
    // Configurer le gestionnaire de dos de carte
    setupCardBackManager();
});
