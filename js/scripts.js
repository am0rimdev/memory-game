document.addEventListener('DOMContentLoaded', () => {
    // Array de objetos representando os personagens do jogo, cada um com um nome e uma imagem.
    let characters = [
        { name: 'ben 10',        img: 'images/ben-10.png' },
        { name: 'bob esponja',   img: 'images/bob-esponja.png' },
        { name: 'homer simpson', img: 'images/homer-simpson.png' },
        { name: 'pica-pau',      img: 'images/pica-pau.png' },
        { name: 'popeye',        img: 'images/popeye.png' },
        { name: 'scooby-doo',    img: 'images/scooby-doo.png' },
        { name: 'kick',          img: 'images/kick.png' },
        { name: 'pikachu',       img: 'images/pikachu.png' }
    ];

    // Variáveis globais do jogo
    let cards = [];
    let flippedCards = [];
    let isHardMode = false;     // Controla se o jogo está no modo difícil
    let score = 0;              // Armazena a pontuação do jogador
    let matchedCards = 0;       // Conta quantas cartas foram combinadas
    let timerInterval;          // Armazena a referência do intervalo do temporizador
    let playerName = '';        // Nome do jogador
    let consecutiveMatches = 0; // Contador de acertos consecutivos
    let timeRemaining;          // Tempo restante no temporizador

    // Eventos de clique para os botões do jogo
    document.getElementById('play-game-button').addEventListener('click', playGame);
    document.getElementById('game-difficulty-option-button').addEventListener('click', toggleDifficulty);
    document.getElementById('ranking-button').addEventListener('click', showRanking);
    document.getElementById('back-to-menu-from-game-button').addEventListener('click', backToMenu);
    document.getElementById('back-to-menu-from-ranking-button').addEventListener('click', backToMenu);
    document.getElementById('restart-button').addEventListener('click', playGame);

    // Função para iniciar o jogo
    function playGame() {
        playerName = document.getElementById('player-name-input').value; // Captura o nome do jogador
        if (!playerName) {
            alert('Por favor, insira seu nome antes de começar o jogo!'); // Verifica se o nome foi inserido
            return;
        }
        const gameMenu = document.getElementById('game-menu');
        gameMenu.classList.add('hidden');

        const game = document.getElementById('game');
        game.classList.remove('hidden');

        resetGame();
        displayCards();
        startTimer();
    }

    // Função para mudar a dificuldade do jogo
    function toggleDifficulty() {
        isHardMode = !isHardMode; // Alterna entre modo fácil e difícil
        
        let gameDifficultyOptionButton = document.getElementById('game-difficulty-option-button');
        gameDifficultyOptionButton.textContent = `Difficulty: ${isHardMode ? 'Hard' : 'Easy'}`;
    }

    // Função para mostrar o ranking
    function showRanking() {
        const ranking = JSON.parse(localStorage.getItem('ranking')) || []; // Recupera o ranking do Local Storage

        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';
        
        // Cria e exibe cada entrada do ranking na lista
        ranking.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerText = `Game ${index + 1}. ${entry.name}: ${entry.score}`;
            rankingList.appendChild(li);
        });

         // Calcula a soma total dos scores
        const totalScore = ranking.reduce((total, entry) => total + entry.score, 0);

        // Cria e exibe o score total
        const totalLi = document.createElement('li');
        totalLi.innerText = `Total: ${totalScore}`;
        rankingList.appendChild(totalLi);

        // Oculta o menu do jogo e exibe a tela de ranking
        document.getElementById('game-menu').classList.add('hidden');
        document.getElementById('ranking').classList.remove('hidden');
    }

    // Função para embaralhar as cartas
    function shuffleCards(array) {
        return array.sort(() => Math.random() - 0.5); // Embaralha o array de cartas
    }

    // Função para mostrar a lista de cartas de acordo com a dificuldade do jogo
    function displayCards() {
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = '';
        
        // Define o conjunto de cartas baseado na dificuldade
        let cardSet = isHardMode ? characters.concat(characters.concat(characters)) 
                                 : characters.concat(characters); 
        
        // Embaralha e limita o número de cartas a serem mostradas
        cardSet = shuffleCards(cardSet.slice(0, isHardMode ? 24 : 16));
        totalCards = cardSet.length;

        // Cria e exibe cada carta na tela
        cardSet.forEach((cardData) => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            const cardFront = document.createElement('div');
            cardFront.classList.add('front');

            const cardBack = document.createElement('div');
            cardBack.classList.add('back');

            const cardImg = document.createElement('img');
            cardImg.setAttribute('src', cardData.img);
            cardImg.classList.add('card-image');

            card.setAttribute('data-name', cardData.name); // Atribui o nome da carta como um atributo

            // Adicionando a imagem ao lado "frontal" do cartão
            cardFront.appendChild(cardImg);

            // Adicionando os lados "frontal" e "traseiro" ao cartão
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', flipCard);
            
            cardsContainer.appendChild(card);
            cards.push(card);
        });
        
        // Altera a classe do jogo com base na dificuldade
        document.getElementById('game').classList.toggle('hard', isHardMode);
        document.getElementById('game').classList.toggle('easy', !isHardMode);
    }

    // Função para iniciar o temporizador
    function startTimer() {
        timeRemaining = isHardMode ? 80 : 60; // Define o tempo restante baseado na dificuldade

        let timer = document.getElementById('timer');
        timer.textContent = `Time Remaining: ${timeRemaining}`; // Atualiza o display do temporizador

        // Inicia o intervalo do temporizador
        timerInterval = setInterval(() => {
            timeRemaining--; // Decrementa o tempo restante
            timer.textContent = `Time Remaining: ${timeRemaining}`; // Atualiza o display do temporizador

            // Finaliza o jogo se o tempo acabar
            if (timeRemaining === 0) {
                endGame(true);
            }
        }, 1000);
    }

    // Função para verificar se as cartas viradas formam um par
    function checkMatch() {
        const names = flippedCards.map(card => card.getAttribute('data-name')); // Obtém os nomes das cartas viradas
        
        // Verifica se todas as cartas viradas têm o mesmo nome
        if (new Set(names).size === 1) {
            flippedCards.forEach(card => {
                card.classList.add('matched'); // Marca as cartas como combinadas
            });

            consecutiveMatches++; // Incrementa a sequência de acertos
            const extraPoints = isHardMode ? 10 : 5; // Define pontos extras com base na dificuldade
            score += 10 + (consecutiveMatches > 1 ? extraPoints : 0); // Atualiza a pontuação

            matchedCards += flippedCards.length; // Incrementa o contador de cartas combinadas
            document.getElementById('score').innerText = `Score: ${score}`; // Atualiza a pontuação na tela
            
            timeRemaining += 5; // Adiciona 5 segundos ao tempo restante
            document.getElementById('timer').textContent = `Time Remaining: ${timeRemaining}`; // Atualiza o temporizador
            
            flippedCards = []; // Reseta as cartas viradas
        
            // Finaliza o jogo se todas as cartas foram combinadas
            if (matchedCards === totalCards)
                endGame(false);
        
        } else {
            consecutiveMatches = 0; // Reseta a sequência de acertos
            setTimeout(() => {
                flippedCards.forEach(card => card.classList.remove('flipped')); // Remove a classe de virado das cartas
                flippedCards = []; // Reseta as cartas viradas
            }, 1000); // Espera 1 segundo antes de virar as cartas de volta
        }
    }

    // Função para virar a carta ao ser clicada
    function flipCard(event) {
        const clickedCard = event.currentTarget; // Obtém a carta clicada
        
        // Verifica se a carta já está virada ou se o limite de cartas viradas foi atingido
        if (clickedCard.classList.contains('flipped') || flippedCards.length >= (isHardMode ? 3 : 2)) return;
        
        clickedCard.classList.add('flipped'); // Adiciona a classe de virado à carta
        
        flippedCards.push(clickedCard); // Adiciona a carta ao array de cartas viradas
    
        // Verifica se o número máximo de cartas viradas foi atingido
        if (flippedCards.length === (isHardMode ? 3 : 2))
            checkMatch(); // Verifica se as cartas viradas formam um par
    }

    // Função para finalizar o jogo
    function endGame(isTimeUp = false) {
        clearInterval(timerInterval); // Para o temporizador

        const titleElement = document.getElementById('game-result-title');
    
        // Define o título do resultado do jogo baseado em se o tempo acabou ou não
        if (isTimeUp) {
            titleElement.textContent = 'Game Over';
        } else {
            titleElement.textContent = 'End Game';
        }
        saveScore(score); // Salva a pontuação no ranking
        displayEndGameScreen(); // Exibe a tela de fim de jogo
    }

    // Função para exibir a tela de fim de jogo
    function displayEndGameScreen() {
        const endGameScreen = document.getElementById('end-game-screen');
        const finalScoreDisplay = document.getElementById('final-score');
        const playerNameDisplay = document.getElementById('player-name-display');
        const playerName = document.getElementById('player-name-input').value || 'Player'; // Obtém o nome do jogador

        finalScoreDisplay.innerText = `Final Score: ${score}`; // Exibe a pontuação final
        playerNameDisplay.innerText = `Player Name: ${playerName}`; // Exibe o nome do jogador
    
        document.getElementById('game').classList.add('hidden'); // Oculta a tela do jogo
        endGameScreen.classList.remove('hidden'); // Exibe a tela de fim de jogo
    }

    // Evento para jogar novamente
    document.getElementById('play-again-button').addEventListener('click', () => {
        const endGameScreen = document.getElementById('end-game-screen');
        endGameScreen.classList.add('hidden'); // Oculta a tela de fim de jogo
        playGame(); // Reinicia o jogo
    });

    // Evento para voltar ao menu principal a partir da tela de pontuação
    document.getElementById('back-to-menu-from-score-button').addEventListener('click', () => {
        const endGameScreen = document.getElementById('end-game-screen');
        endGameScreen.classList.add('hidden'); // Oculta a tela de fim de jogo
        document.getElementById('game-menu').classList.remove('hidden'); // Exibe o menu principal
    });

    // Função para voltar ao menu principal
    function backToMenu() {
        const game = document.getElementById('game');
        const ranking = document.getElementById('ranking');
        const gameMenu = document.getElementById('game-menu');

        if (!game.classList.contains('hidden'))
            game.classList.add('hidden');

        if (!ranking.classList.contains('hidden'))
            ranking.classList.add('hidden');

        gameMenu.classList.remove('hidden');
    }

    // Função para salvar a pontuação no ranking
    function saveScore(score) {
        const playerName = document.getElementById('player-name-input').value.trim(); // Obtém o nome do jogador
        let ranking = JSON.parse(localStorage.getItem('ranking')) || []; // Recupera o ranking do Local Storage

        // Adiciona a pontuação ao ranking se o nome do jogador e a pontuação forem válidos
        if (playerName && score !== undefined) {
            ranking.push({ name: playerName, score: score });
            localStorage.setItem('ranking', JSON.stringify(ranking));
        }
    }

    // Função para reiniciar o estado do jogo
    function resetGame() {
        cards = [];
        flippedCards = [];
        score = 0;
        matchedCards = 0;
        consecutiveMatches = 0;
        clearInterval(timerInterval);
        timeRemaining = isHardMode ? 80 : 60;
        document.getElementById('score').innerText = `Score: ${score}`;
        document.getElementById('timer').textContent = `Time Remaining: ${timeRemaining}`;
    }
});
