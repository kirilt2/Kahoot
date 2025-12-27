// Kahoot Bot Flooder - Simple Version
// By Kiril Tichomirov

let socket;
let isRunning = false;
let currentQuestionType = null;

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

const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const answerControl = document.getElementById('answer-control');
const answerButtons = document.getElementById('answer-buttons');
const textAnswerInput = document.getElementById('text-answer-input');
const textAnswer = document.getElementById('text-answer');
const submitTextAnswer = document.getElementById('submit-text-answer');

// ==================== PASSWORD VERIFICATION ====================

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPassword();
});

passwordSubmit.addEventListener('click', verifyPassword);

async function verifyPassword() {
    const password = passwordInput.value;

    if (!password) {
        passwordError.textContent = 'Please enter password!';
        return;
    }

    passwordSubmit.disabled = true;
    passwordSubmit.textContent = 'Checking...';
    passwordError.textContent = '';

    try {
        const response = await fetch('/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
            passwordScreen.classList.remove('active');
            mainPanel.classList.add('active');
            initializeSocket();
        } else {
            passwordError.textContent = 'Incorrect password!';
        }
    } catch (error) {
        passwordError.textContent = 'Connection error!';
    } finally {
        passwordSubmit.disabled = false;
        passwordSubmit.textContent = 'UNLOCK';
    }
}

// ==================== SOCKET CONNECTION ====================

function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        addLog('success', 'Connected to server!');
    });

    socket.on('disconnect', () => {
        addLog('error', 'Disconnected from server!');
        if (isRunning) resetUI();
    });

    socket.on('log', (data) => {
        addLog(data.type, data.message);
    });

    socket.on('bots-ready', () => {
        addLog('success', 'All bots deployed successfully!');
        hideProgress();
    });

    socket.on('question-ready', (data) => {
        if (userControlledCheckbox.checked) {
            currentQuestionType = data.type;
            showAnswerControl(data);
        }
    });

    socket.on('bot-progress', (data) => {
        updateProgress(data.current, data.total);
    });
}

// ==================== BOT CONTROLS ====================

startBtn.addEventListener('click', startBots);
stopBtn.addEventListener('click', stopBots);

function startBots() {
    console.log('Start button clicked!');

    const pin = gamePinInput.value.trim();
    const bots = parseInt(numBotsInput.value, 10);
    const randomNames = randomNamesCheckbox.checked;
    const botName = botNameInput.value.trim();
    const useBypass = useBypassCheckbox.checked;
    const userControlled = userControlledCheckbox.checked;

    console.log('Config:', { pin, bots, randomNames, botName, useBypass, userControlled });

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

    console.log('Starting bots...');
    isRunning = true;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    gamePinInput.disabled = true;
    numBotsInput.disabled = true;

    showProgress();
    terminal.innerHTML = '';

    console.log('Emitting start-bots event...');
    socket.emit('start-bots', {
        pin,
        bots,
        randomNames,
        botName,
        useBypass,
        userControlled
    });
    console.log('Event emitted!');
}

function stopBots() {
    socket.emit('stop-bots');
    addLog('info', 'Stopping bots...');
    resetUI();
}

function resetUI() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    gamePinInput.disabled = false;
    numBotsInput.disabled = false;
    hideProgress();
    answerControl.style.display = 'none';
}

// ==================== TERMINAL ====================

function addLog(type, message) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${message}`;

    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

clearTerminalBtn.addEventListener('click', () => {
    terminal.innerHTML = '<div class="terminal-line info">Terminal cleared.</div>';
});

// ==================== PROGRESS ====================

function showProgress() {
    progressContainer.style.display = 'block';
}

function hideProgress() {
    progressContainer.style.display = 'none';
}

function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${current}/${total}`;
}

// ==================== ANSWER CONTROL ====================

function showAnswerControl(data) {
    answerControl.style.display = 'block';
    answerButtons.innerHTML = '';
    textAnswerInput.style.display = 'none';

    if (data.type === 'quiz' || data.type === 'true_false') {
        data.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = `answer-btn answer-${index}`;
            btn.textContent = answer || `Answer ${index + 1}`;
            btn.onclick = () => submitAnswer(index);
            answerButtons.appendChild(btn);
        });
    } else if (data.type === 'word_cloud' || data.type === 'open_ended') {
        textAnswerInput.style.display = 'block';
    }
}

function submitAnswer(answerIndex) {
    socket.emit('submit-answer', { answer: answerIndex });
    addLog('info', `Submitted answer: ${answerIndex}`);
    answerControl.style.display = 'none';
}

submitTextAnswer.addEventListener('click', () => {
    const answer = textAnswer.value.trim();
    if (answer) {
        socket.emit('submit-answer', { answer });
        addLog('info', `Submitted answer: ${answer}`);
        textAnswer.value = '';
        answerControl.style.display = 'none';
    }
});

// ==================== UI TOGGLES ====================

randomNamesCheckbox.addEventListener('change', () => {
    botNameGroup.style.display = randomNamesCheckbox.checked ? 'none' : 'block';
});

userControlledCheckbox.addEventListener('change', () => {
    if (!userControlledCheckbox.checked) {
        answerControl.style.display = 'none';
    }
});