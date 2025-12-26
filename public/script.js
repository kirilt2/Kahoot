let socket;

// DOM Elements
const passwordScreen = document.getElementById('password-screen');
const mainPanel = document.getElementById('main-panel');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordError = document.getElementById('password-error');

const gamePinInput = document.getElementById('game-pin');
const numBotsInput = document.getElementById('num-bots');
const randomNamesCheckbox = document.getElementById('random-names');
const botNameInput = document.getElementById('bot-name');
const botNameGroup = document.getElementById('bot-name-group');
const useBypassCheckbox = document.getElementById('use-bypass');
const userControlledCheckbox = document.getElementById('user-controlled');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const terminal = document.getElementById('terminal');
const clearTerminalBtn = document.getElementById('clear-terminal');

const answerControl = document.getElementById('answer-control');
const answerButtons = document.getElementById('answer-buttons');
const textAnswerInput = document.getElementById('text-answer-input');
const textAnswer = document.getElementById('text-answer');
const submitTextAnswer = document.getElementById('submit-text-answer');

let isRunning = false;
let currentQuestionType = null;

// Password Authentication
passwordSubmit.addEventListener('click', verifyPassword);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPassword();
});

async function verifyPassword() {
    const password = passwordInput.value.trim();

    if (!password) {
        passwordError.textContent = 'Please enter a password!';
        return;
    }

    passwordError.textContent = '';
    passwordSubmit.disabled = true;
    passwordSubmit.textContent = 'CHECKING...';

    try {
        const response = await fetch('/verify-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: password })
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();

        if (data.success) {
            console.log('Password correct! Switching to main panel...');

            // Immediately switch screens
            passwordScreen.classList.remove('active');
            passwordScreen.style.display = 'none';

            mainPanel.style.display = 'flex';
            mainPanel.classList.add('active');

            passwordError.textContent = '';

            // Initialize socket connection after successful login
            initializeSocket();

            console.log('Main panel is now visible');
        } else {
            passwordError.textContent = 'Invalid password! Try: 2010';
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        console.error('Password verification error:', error);
        passwordError.textContent = 'Connection error! Is the server running?';
    } finally {
        passwordSubmit.disabled = false;
        passwordSubmit.textContent = 'UNLOCK';
    }
}

function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        addLog('success', '✓ Connected to server!');
    });

    socket.on('disconnect', () => {
        addLog('error', '✗ Disconnected from server!');
        if (isRunning) {
            resetUI();
        }
    });

    socket.on('log', (data) => {
        addLog(data.type, data.message);
    });

    socket.on('bots-ready', () => {
        addLog('success', '✓ All bots are ready and connected!');
    });

    socket.on('question-ready', (data) => {
        if (userControlledCheckbox.checked) {
            currentQuestionType = data.type;
            showAnswerControl(data);
        }
    });
}

// Toggle bot name input based on random names checkbox
randomNamesCheckbox.addEventListener('change', () => {
    if (randomNamesCheckbox.checked) {
        botNameGroup.style.display = 'none';
    } else {
        botNameGroup.style.display = 'block';
    }
});

// Clear terminal
clearTerminalBtn.addEventListener('click', () => {
    terminal.innerHTML = '<div class="terminal-line info">Terminal cleared.</div>';
});

// Start Bots
startBtn.addEventListener('click', () => {
    const pin = gamePinInput.value.trim();
    const bots = parseInt(numBotsInput.value, 10);
    const randomNames = randomNamesCheckbox.checked;
    const botName = botNameInput.value.trim();
    const useBypass = useBypassCheckbox.checked;
    const userControlled = userControlledCheckbox.checked;

    if (!pin) {
        addLog('error', 'Please enter a game PIN!');
        return;
    }

    if (isNaN(bots) || bots <= 0) {
        addLog('error', 'Please enter a valid number of bots!');
        return;
    }

    if (!randomNames && !botName) {
        addLog('error', 'Please enter a bot name or enable random names!');
        return;
    }

    if (!socket || !socket.connected) {
        addLog('error', 'Not connected to server! Please refresh the page.');
        return;
    }

    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    gamePinInput.disabled = true;
    numBotsInput.disabled = true;
    randomNamesCheckbox.disabled = true;
    botNameInput.disabled = true;
    useBypassCheckbox.disabled = true;
    userControlledCheckbox.disabled = true;

    terminal.innerHTML = '';

    socket.emit('start-bots', {
        pin,
        bots,
        randomNames,
        botName,
        useBypass,
        userControlled
    });
});

// Stop Bots
stopBtn.addEventListener('click', () => {
    if (socket && socket.connected) {
        socket.emit('stop-bots');
    }
    resetUI();
});

function resetUI() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    gamePinInput.disabled = false;
    numBotsInput.disabled = false;
    randomNamesCheckbox.disabled = false;
    botNameInput.disabled = false;
    useBypassCheckbox.disabled = false;
    userControlledCheckbox.disabled = false;
    answerControl.style.display = 'none';
}

function addLog(type, message) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = message;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function showAnswerControl(data) {
    answerControl.style.display = 'block';

    if (data.type === 'quiz' || data.type === 'survey') {
        textAnswerInput.style.display = 'none';
        answerButtons.style.display = 'grid';
        answerButtons.innerHTML = '';

        const answers = [
            { text: '🔺 Triangle (Red)', class: 'triangle', value: 0 },
            { text: '🔷 Diamond (Blue)', class: 'diamond', value: 1 },
            { text: '⭕ Circle (Yellow)', class: 'circle', value: 2 },
            { text: '🟩 Square (Green)', class: 'square', value: 3 }
        ];

        const count = Math.min(data.answerCount, 4);

        for (let i = 0; i < count; i++) {
            const btn = document.createElement('button');
            btn.className = `answer-btn ${answers[i].class}`;
            btn.textContent = answers[i].text;
            btn.onclick = () => submitAnswer(answers[i].value);
            answerButtons.appendChild(btn);
        }

        addLog('info', `Question ready! Select an answer (${count} options)`);
    } else if (data.type === 'word_cloud' || data.type === 'open_ended') {
        answerButtons.style.display = 'none';
        textAnswerInput.style.display = 'block';
        textAnswer.value = '';
        textAnswer.focus();

        addLog('info', 'Question ready! Type your answer.');
    }
}

function submitAnswer(answerValue) {
    if (socket && socket.connected) {
        socket.emit('submit-answer', answerValue);
        addLog('success', `Submitted answer: ${answerValue + 1}`);
        answerControl.style.display = 'none';
    }
}

submitTextAnswer.addEventListener('click', () => {
    const answer = textAnswer.value.trim();
    if (answer && socket && socket.connected) {
        socket.emit('submit-text-answer', answer);
        addLog('success', `Submitted answer: ${answer}`);
        answerControl.style.display = 'none';
    }
});

textAnswer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitTextAnswer.click();
    }
});

// Auto-focus password input on load
window.addEventListener('load', () => {
    passwordInput.focus();
});