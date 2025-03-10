// Variables globales
let selectedSymbol = null;
let editMode = false;
let cardsGenerated = false;
let isDragging = false;
let minSizeValue = 50;  // Taille minimale par défaut
let maxSizeValue = 100;  // Taille maximale par défaut

// Liste des émojis par défaut
const defaultEmojis = [
    "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
    "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
    "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
    "🌞", "🍉", "📚", "🧸", "🎯", "🎮", "🎪", "🧠", "👾", "🌍",
    "🦖", "🍄", "🎭", "🦉", "🌊", "🦋", "🍀", "🎓", "🧲", "🔍",
    "🧩", "🛸", "🎨", "🍭", "🦁", "🌺", "🌮", "🎪", "🧁", "💎",
    "🎡", "🎬", "🥐", "🌋", "🦜", "🍰", "🌠", "🎤", "🔔", "🚂",
    "🌯", "🥇", "🍋", "🦢", "🍍", "🥁", "🧿", "🕹️", "🏆", "🧯",
    "🧶", "🦚", "🧬", "🏝️", "🌴", "🎖️", "🎠", "🏰", "🛒", "🗿",
    "🧵", "🧙", "🫦", "👁️", "🪐", "📮", "🦊", "🎲", "🪅", "🎢",
    "🦩", "🦭", "🫐", "🪄", "🍯", "🐘", "🦒", "🧊", "🧆", "🎰"
];

// Fonction pour charger les émojis personnalisés depuis localStorage
function loadEmojiList() {
    const storedEmojis = localStorage.getItem("emojiList");
    return storedEmojis ? JSON.parse(storedEmojis) : defaultEmojis;
}

// Fonction pour sauvegarder les émojis dans localStorage
function saveEmojiList(emojiList) {
    localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
    const cards = [];
    const symbols = loadEmojiList();
    
    // Générer exactement 54 cartes
    for (let i = 0; i < 54; i++) {
        const card = [];
        // Ajouter 8 symboles différents sur chaque carte
        while (card.length < 8) {
            const randomIndex = Math.floor(Math.random() * symbols.length);
            // Éviter les doublons sur une même carte
            if (!card.includes(randomIndex)) {
                card.push(randomIndex);
            }
        }
        cards.push(card);
    }
    
    return cards;
}

// Fonction pour générer les cartes dans le DOM
function generateCards() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    cardContainer.innerHTML = "";
    const cards = generateDobbleCards();
    const emojis = loadEmojiList();
    
    for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.dataset.cardIndex = index;
        
        // Utiliser la fonction de positionnement qui existe déjà
        const cardEmojis = card.map(index => emojis[index % emojis.length]);
        positionSymbols(cardDiv, cardEmojis);
        
        // Activer le glisser-déposer si en mode édition
        if (editMode) {
            cardDiv.querySelectorAll('.symbol').forEach(symbol => {
                enableDrag(symbol);
            });
        }
        
        cardContainer.appendChild(cardDiv);
    }
    
    cardsGenerated = true;
    saveCardsState();
}

// Fonction pour positionner les symboles sur la carte
function positionSymbols(cardDiv, card) {
    const cardSize = 300; // Taille de la carte
    const margin = 20; // Marge par rapport au bord
    
    // Utiliser directement les valeurs des curseurs sans ajustement
    const minSize = minSizeValue; // Taille minimale des émojis
    const maxSize = maxSizeValue; // Taille maximale des émojis
    
    // Déterminer les limites de placement
    const minPos = margin;
    const maxPos = cardSize - margin;
    const usableArea = maxPos - minPos;
    
    // Préparer un tableau pour les positions déjà utilisées
    const placedSymbols = [];
    
    // Créer un tableau d'indices mélangés pour accéder aux symboles dans un ordre aléatoire
    const shuffledIndices = Array.from({ length: card.length }, (_, i) => i);
    shuffleArray(shuffledIndices);
    
    // Diviser la carte en une grille adaptée au nombre de symboles
    const gridSize = Math.max(2, Math.ceil(Math.sqrt(card.length)));
    const gridPositions = [];
    const cellSize = usableArea / gridSize;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            gridPositions.push({
                x: minPos + col * cellSize,
                y: minPos + row * cellSize,
                width: cellSize,
                height: cellSize
            });
        }
    }
    
    // Mélanger les positions de la grille
    shuffleArray(gridPositions);
    
    // Distribuer les symboles sur la grille
    for (let i = 0; i < shuffledIndices.length; i++) {
        // Récupérer le symbole original dans l'ordre mélangé
        const symbolIndex = shuffledIndices[i];
        const symbol = card[symbolIndex];
        
        // Choisir une position de base dans la grille
        const basePos = gridPositions[i % gridPositions.length];
        
        // Déterminer une taille pour ce symbole - utiliser directement les valeurs des curseurs
        let size;
        
        // Calculer la taille maximale possible dans cette cellule pour éviter les débordements
        const maxCellSize = Math.min(basePos.width, basePos.height) * 0.95;
        
        // Limiter la taille maximale à la taille de la cellule
        const effectiveMaxSize = Math.min(maxSize, maxCellSize);
        
        // Assurer que la taille minimale n'est pas supérieure à la taille maximale effective
        const effectiveMinSize = Math.min(minSize, effectiveMaxSize);
        
        // Déterminer la taille avec une distribution variée
        const sizeRange = effectiveMaxSize - effectiveMinSize;
        
        if (i < shuffledIndices.length * 0.3) { // 30% des symboles plus grands
            // 90-100% de la taille maximale
            size = effectiveMaxSize - (sizeRange * 0.1 * Math.random());
        } else if (i < shuffledIndices.length * 0.7) { // 40% de taille moyenne
            // 70-90% de la taille maximale
            size = effectiveMaxSize - (sizeRange * (0.1 + 0.2 * Math.random()));
        } else { // 30% plus petits
            // 50-70% de la taille maximale
            size = effectiveMaxSize - (sizeRange * (0.3 + 0.2 * Math.random()));
        }
        
        // S'assurer que la taille est dans les limites acceptables
        size = Math.max(Math.min(size, effectiveMaxSize), effectiveMinSize);
        
        // Calculer la position exacte - centrée dans la cellule avec un léger décalage aléatoire
        const maxOffset = (basePos.width - size) / 2 * 0.8;
        const xOffset = maxOffset > 0 ? (Math.random() - 0.5) * maxOffset * 2 : 0;
        const yOffset = maxOffset > 0 ? (Math.random() - 0.5) * maxOffset * 2 : 0;
        
        // Position centrée dans la cellule + décalage aléatoire
        const x = basePos.x + (basePos.width - size) / 2 + xOffset;
        const y = basePos.y + (basePos.height - size) / 2 + yOffset;
        
        // Rotation aléatoire
        const rotation = Math.floor(Math.random() * 360);
        
        // Vérifier et ajuster la position pour s'assurer qu'elle reste dans les limites de la carte
        let finalX = Math.max(minPos, Math.min(maxPos - size, x));
        let finalY = Math.max(minPos, Math.min(maxPos - size, y));
        
        // Créer la position finale
        const position = {
            x: finalX,
            y: finalY,
            size: size,
            rotation: rotation
        };
        
        // Vérification des superpositions avec les symboles déjà placés
        let attempts = 0;
        const maxAttempts = 3;
        let hasOverlap = true;
        
        while (hasOverlap && attempts < maxAttempts) {
            hasOverlap = false;
            
            for (const placed of placedSymbols) {
                // Calculer les centres
                const centerX1 = position.x + position.size / 2;
                const centerY1 = position.y + position.size / 2;
                const centerX2 = placed.x + placed.size / 2;
                const centerY2 = placed.y + placed.size / 2;
                
                // Calcul de la distance
                const distance = Math.sqrt(
                    Math.pow(centerX1 - centerX2, 2) + 
                    Math.pow(centerY1 - centerY2, 2)
                );
                
                // Distance minimale pour éviter les superpositions
                const minDistance = (position.size + placed.size) / 2 * 0.85;
                
                if (distance < minDistance) {
                    hasOverlap = true;
                    
                    // Réduire la taille moins agressivement
                    position.size = Math.max(effectiveMinSize, position.size * 0.95);
                    
                    // Recalculer la position pour rester centré
                    position.x = basePos.x + (basePos.width - position.size) / 2 + xOffset * 0.8;
                    position.y = basePos.y + (basePos.height - position.size) / 2 + yOffset * 0.8;
                    
                    // S'assurer que la position reste dans les limites
                    position.x = Math.max(minPos, Math.min(maxPos - position.size, position.x));
                    position.y = Math.max(minPos, Math.min(maxPos - position.size, position.y));
                    
                    break;
                }
            }
            
            attempts++;
        }
        
        // Ajouter le symbole à la liste des positions utilisées
        placedSymbols.push(position);
        
        // Créer et positionner l'élément du symbole
        const symbolDiv = createSymbolElement(symbol, position.size, position.x, position.y, position.rotation);
        cardDiv.appendChild(symbolDiv);
    }
}

// Fonction pour créer un élément de symbole
function createSymbolElement(symbol, size, x, y, rotation) {
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";
    
    if (symbol.startsWith && symbol.startsWith("data:image")) {
        const img = document.createElement("img");
        img.src = symbol;
        symbolDiv.appendChild(img);
    } else {
        symbolDiv.textContent = symbol;
    }
    
    Object.assign(symbolDiv.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size}px`,
        lineHeight: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rotation}deg)`,
        cursor: "pointer"
    });
    
    enableDrag(symbolDiv);
    return symbolDiv;
}

// Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fonction pour activer le glisser-déposer sur un élément
function enableDrag(element) {
    let isDragging = false;
    let startX, startY, originalX, originalY;
    const speedFactor = 1; // Facteur de vitesse pour le déplacement
    
    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag);
    element.addEventListener("click", selectSymbol);
    
    function startDrag(e) {
        if (!editMode) return;
        
        isDragging = true;
        
        if (e.type === "touchstart") {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        // Stocker la position originale
        const style = window.getComputedStyle(element);
        originalX = parseInt(style.left);
        originalY = parseInt(style.top);
        
        // Sélectionner l'élément
        if (selectedSymbol) {
            selectedSymbol.classList.remove("selected");
        }
        selectedSymbol = element;
        selectedSymbol.classList.add("selected");
        
        // Afficher le contrôle de taille
        document.getElementById("sizeControl").style.display = "block";
        updateSliderValues();
        
        // Ajouter les écouteurs d'événements pour le déplacement
        document.addEventListener("mousemove", drag);
        document.addEventListener("touchmove", drag);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchend", stopDrag);
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging || !editMode) return;
        
        let clientX, clientY;
        if (e.type === "touchmove") {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const deltaX = (clientX - startX) * speedFactor;
        const deltaY = (clientY - startY) * speedFactor;
        
        // Calculer la nouvelle position
        let newX = originalX + deltaX;
        let newY = originalY + deltaY;
        
        // Obtenir les dimensions de la carte et du symbole
        const card = element.closest(".card");
        const cardRect = card.getBoundingClientRect();
        const symbolRect = element.getBoundingClientRect();
        const symbolWidth = symbolRect.width;
        const symbolHeight = symbolRect.height;
        
        // Convertir les coordonnées globales en coordonnées relatives à la carte
        const cardStyle = window.getComputedStyle(card);
        const cardBorderWidth = parseInt(cardStyle.borderWidth) || 0;
        
        // Limites pour que le symbole reste dans la carte
        const minX = cardBorderWidth;
        const minY = cardBorderWidth;
        const maxX = cardRect.width - symbolWidth - cardBorderWidth;
        const maxY = cardRect.height - symbolHeight - cardBorderWidth;
        
        // Appliquer les limites
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        
        // Appliquer la nouvelle position
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        
        e.preventDefault();
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchend", stopDrag);
        
        // Sauvegarder l'état des cartes après le déplacement
        saveCardsState();
    }
    
    function selectSymbol(e) {
        if (!editMode) return;
        e.stopPropagation();
        
        // Désélectionner le symbole précédent
        if (selectedSymbol) {
            selectedSymbol.classList.remove("selected");
        }
        
        // Sélectionner le nouveau symbole
        selectedSymbol = element;
        selectedSymbol.classList.add("selected");
        
        // Afficher le contrôle de taille
        document.getElementById("sizeControl").style.display = "block";
        updateSliderValues();
    }
}

// Fonction pour mettre à jour les valeurs des sliders quand un symbole est sélectionné
function updateSliderValues() {
    if (!selectedSymbol) return;
    
    const sizeSlider = document.getElementById('emojiSize');
    const rotationSlider = document.getElementById('emojiRotation');
    const sizeValueSpan = document.getElementById('emojiSizeValue');
    const rotationValueSpan = document.getElementById('emojiRotationValue');
    
    if (sizeSlider && rotationSlider) {
        // Récupérer la taille actuelle
        const computedStyle = window.getComputedStyle(selectedSymbol);
        const size = parseInt(computedStyle.width);
        
        // Récupérer la rotation actuelle
        const transform = computedStyle.transform;
        let rotation = 0;
        
        if (transform && transform !== 'none') {
            const matrix = transform.match(/matrix.*\((.+)\)/);
            if (matrix) {
                // Extraire les valeurs de la matrice de transformation
                const values = matrix[1].split(', ');
                rotation = Math.round(Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180/Math.PI));
            }
        }
        
        // Normaliser la rotation à une valeur entre 0 et 360
        rotation = (rotation + 360) % 360;
        
        // Mettre à jour les sliders
        sizeSlider.value = size;
        rotationSlider.value = rotation;
        
        // Mettre à jour les affichages de valeur
        if (sizeValueSpan) sizeValueSpan.textContent = size;
        if (rotationValueSpan) rotationValueSpan.textContent = rotation;
    }
}

// Fonction pour ajuster la taille
function updateSize(e) {
    if (!selectedSymbol || !editMode) return;
    
    const size = parseInt(e.target.value);
    const sizeValueSpan = document.getElementById('emojiSizeValue');
    
    // Mettre à jour la taille du symbole
    selectedSymbol.style.width = `${size}px`;
    selectedSymbol.style.height = `${size}px`;
    selectedSymbol.style.fontSize = `${size}px`;
    selectedSymbol.style.lineHeight = `${size}px`;
    
    // Mettre à jour l'affichage de la valeur
    if (sizeValueSpan) sizeValueSpan.textContent = size;
    
    // Sauvegarder l'état
    saveCardsState();
}

// Fonction pour ajuster la rotation
function updateRotation(e) {
    if (!selectedSymbol || !editMode) return;
    
    const rotation = parseInt(e.target.value);
    const rotationValueSpan = document.getElementById('emojiRotationValue');
    
    // Mettre à jour la rotation du symbole
    selectedSymbol.style.transform = `rotate(${rotation}deg)`;
    
    // Mettre à jour l'affichage de la valeur
    if (rotationValueSpan) rotationValueSpan.textContent = rotation;
    
    // Sauvegarder l'état
    saveCardsState();
}

// Fonction pour sauvegarder l'état des cartes
function saveCardsState() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    localStorage.setItem("cardsGenerated", "true");
    localStorage.setItem("cardsHTML", cardContainer.innerHTML);
    
    const symbols = cardContainer.querySelectorAll(".symbol");
    const symbolsState = Array.from(symbols).map(symbol => ({
        width: symbol.style.width,
        height: symbol.style.height,
        fontSize: symbol.style.fontSize,
        lineHeight: symbol.style.lineHeight,
        transform: symbol.style.transform,
        left: symbol.style.left,
        top: symbol.style.top
    }));
    
    localStorage.setItem("symbolsState", JSON.stringify(symbolsState));
}

// Fonction pour restaurer l'état des cartes
function restoreCardsState() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    const isGenerated = localStorage.getItem("cardsGenerated") === "true";
    
    if (isGenerated) {
        const savedHTML = localStorage.getItem("cardsHTML");
        const symbolsState = JSON.parse(localStorage.getItem("symbolsState") || "[]");
        
        if (savedHTML) {
            cardContainer.innerHTML = savedHTML;
            cardsGenerated = true;
            
            const symbols = cardContainer.querySelectorAll(".symbol");
            symbols.forEach((symbol, index) => {
                if (symbolsState[index]) {
                    symbol.style.width = symbolsState[index].width;
                    symbol.style.height = symbolsState[index].height;
                    symbol.style.fontSize = symbolsState[index].fontSize;
                    symbol.style.lineHeight = symbolsState[index].lineHeight;
                    symbol.style.transform = symbolsState[index].transform;
                    symbol.style.left = symbolsState[index].left;
                    symbol.style.top = symbolsState[index].top;
                }
                enableDrag(symbol);
            });
            
            return true;
        }
    }
    return false;
}

// Fonction pour afficher les contrôles de taille
function showSizeControl() {
    // Afficher le panneau de contrôle de taille/rotation 
    const sizeControl = document.getElementById('sizeControl');
    if (sizeControl) {
        sizeControl.style.display = 'block';
    }
    
    // Afficher également les contrôles de taille globale (min/max)
    const cardCustomization = document.querySelector('.card-customization');
    if (cardCustomization) {
        cardCustomization.style.display = 'block';
    }
}

// Fonction pour cacher les contrôles de taille
function hideSizeControl() {
    // Cacher le panneau de contrôle de taille/rotation
    const sizeControl = document.getElementById('sizeControl');
    if (sizeControl) {
        sizeControl.style.display = 'none';
    }
    
    // Cacher également les contrôles de taille globale (min/max)
    const cardCustomization = document.querySelector('.card-customization');
    if (cardCustomization) {
        cardCustomization.style.display = 'none';
    }
}

// Fonction pour initialiser les contrôles de taille globale
function initializeSizeControls() {
    const minSizeSlider = document.getElementById('minSize');
    const maxSizeSlider = document.getElementById('maxSize');
    const minSizeDisplay = document.getElementById('minSizeValue');
    const maxSizeDisplay = document.getElementById('maxSizeValue');
    
    if (minSizeSlider && minSizeDisplay) {
        minSizeSlider.value = minSizeValue;
        minSizeDisplay.textContent = minSizeValue;
        
        minSizeSlider.addEventListener('input', function(e) {
            minSizeValue = parseInt(e.target.value);
            minSizeDisplay.textContent = minSizeValue;
            
            // Ajuster maxSize si nécessaire
            if (minSizeValue > maxSizeValue) {
                maxSizeValue = minSizeValue;
                maxSizeSlider.value = maxSizeValue;
                maxSizeDisplay.textContent = maxSizeValue;
            }
            
            // Régénérer les cartes si elles existent déjà
            if (cardsGenerated) {
                generateCards();
            }
        });
    }
    
    if (maxSizeSlider && maxSizeDisplay) {
        maxSizeSlider.value = maxSizeValue;
        maxSizeDisplay.textContent = maxSizeValue;
        
        maxSizeSlider.addEventListener('input', function(e) {
            maxSizeValue = parseInt(e.target.value);
            maxSizeDisplay.textContent = maxSizeValue;
            
            // Ajuster minSize si nécessaire
            if (maxSizeValue < minSizeValue) {
                minSizeValue = maxSizeValue;
                minSizeSlider.value = minSizeValue;
                minSizeDisplay.textContent = minSizeValue;
            }
            
            // Régénérer les cartes si elles existent déjà
            if (cardsGenerated) {
                generateCards();
            }
        });
    }
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les contrôles
    const editButton = document.getElementById('editModeBtn');
    const downloadButton = document.getElementById('downloadPDF');
    const exportButton = document.getElementById('downloadZIP');
    const generateButton = document.getElementById('generateBtn');
    
    // Initialiser les contrôles de taille globale
    initializeSizeControls();
    
    // Gestionnaire pour le bouton d'édition
    if (editButton) {
        editButton.addEventListener('click', function() {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode');
            editButton.innerHTML = editMode ? '<i class="fas fa-check"></i> Terminer' : '<i class="fas fa-pencil-alt"></i> Mode édition';
            
            if (editMode) {
                // En mode édition, activer le glisser-déposer sur tous les symboles
                const symbols = document.querySelectorAll('.symbol');
                symbols.forEach(symbol => {
                    enableDrag(symbol);
                });
                
                // Afficher les contrôles de personnalisation
                showSizeControl();
            } else {
                // Quitter le mode édition : masquer les contrôles
                hideSizeControl();
                if (selectedSymbol) {
                    selectedSymbol.classList.remove('selected');
                    selectedSymbol = null;
                }
            }
        });
    }
    
    // Gestionnaire pour le bouton de génération
    if (generateButton) {
        generateButton.addEventListener('click', generateCards);
    }
    
    // Gestionnaire pour le bouton de téléchargement
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadCardsAsPDF);
    }
    
    // Gestionnaire pour le bouton d'export
    if (exportButton) {
        exportButton.addEventListener('click', exportCardsAsZip);
    }
    
    // Gestionnaires pour les curseurs de taille et rotation
    const emojiSize = document.getElementById('emojiSize');
    const emojiRotation = document.getElementById('emojiRotation');
    
    if (emojiSize) {
        emojiSize.addEventListener('input', updateSize);
    }
    
    if (emojiRotation) {
        emojiRotation.addEventListener('input', updateRotation);
    }
    
    // Essayer de restaurer l'état précédent ou générer de nouvelles cartes
    if (!restoreCardsState()) {
        generateCards();
    }
});