const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Kahoot = require("kahoot.js-updated");
const words = require('an-array-of-english-words');
const random = require('random-name');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3500;
const PASSWORD = process.env.PASSWORD || "3557925832";

// Suppress Kahoot library errors
process.on('uncaughtException', (error) => {
    // Ignore Kahoot library internal errors
    if (error.message && error.message.includes('quizQuestionAnswers')) {
        return; // Silently ignore
    }
    console.error('Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    // Ignore Kahoot library internal errors
    if (reason && reason.toString().includes('quizQuestionAnswers')) {
        return; // Silently ignore
    }
});

app.use(express.static('public'));
app.use(express.json());

// Password verification endpoint
app.post('/verify-password', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Store active bot sessions
const activeSessions = new Map();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getName() {
    const ran = getRandomInt(1, 5);
    if (ran === 5) return random.first() + random.last();
    if (ran === 4) {
        const randomIndex = getRandomInt(0, words.length - 1);
        return words[randomIndex];
    }
    if (ran === 3) return random.first();
    if (ran === 2) return random.first() + random.middle() + random.last();
    if (ran === 1) return random.first() + random.last();
    return random.first() + random.last();
}

function shuffle(array) {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
}

function applyNameBypass(name) {
    const replacements = {
        'a': 'ᗩ',
        'b': 'ᗷ',
        'c': 'ᑕ',
        'd': 'ᗪ',
        'e': 'E',
        'f': 'ᖴ',
        'g': 'G',
        'h': 'ᕼ',
        'i': 'I',
        'j': 'ᒍ',
        'k': 'K',
        'l': 'ᒪ',
        'm': 'ᗰ',
        'n': 'ᑎ',
        'o': 'O',
        'p': 'ᑭ',
        'q': 'ᑫ',
        'r': 'ᖇ',
        's': 'ᔕ',
        't': 'T',
        'u': 'ᑌ',
        'v': 'ᐯ',
        'w': 'ᗯ',
        'x': '᙭',
        'y': 'Y',
        'z': 'ᘔ',
        '1': 'ᗺ',
    };
    let result = name;
    for (const [letter, replacement] of Object.entries(replacements)) {
        result = result.replace(new RegExp(letter, 'gi'), replacement);
    }
    return result;
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('start-bots', (config) => {
        console.log('Received start-bots event:', config);
        const { pin, bots, randomNames, botName, useBypass, userControlled } = config;

        socket.emit('log', { type: 'info', message: '════════════════════════════════════════' });
        socket.emit('log', { type: 'info', message: '  INITIALIZING BOTS...' });
        socket.emit('log', { type: 'info', message: '════════════════════════════════════════' });
        socket.emit('log', { type: 'info', message: `Game PIN: ${pin}` });
        socket.emit('log', { type: 'info', message: `Number of bots: ${bots}` });
        socket.emit('log', { type: 'info', message: `Auto-leave: 5 minutes` });
        socket.emit('log', { type: 'info', message: 'Connecting...' });
        console.log('Logs emitted, creating session...');

        const sessionData = {
            clients: [],
            sharedAnswer: null,
            repeattimes: 0,
            userControlled: userControlled,
            isStopped: false,
            timeouts: []
        };

        activeSessions.set(socket.id, sessionData);

        function sendjoin(name, id) {
            // Check if stopped before joining
            if (sessionData.isStopped) return;

            if (randomNames) {
                join(getName(), id);
            } else {
                join(name, id);
            }
        }

        function spam() {
            // Check if stopped
            if (sessionData.isStopped) return;

            if (sessionData.repeattimes >= bots) {
                socket.emit('log', { type: 'success', message: 'All bots initialized successfully!' });
                socket.emit('log', { type: 'info', message: 'Auto-leave timer: 5 minutes' });
                socket.emit('bots-ready');
                return;
            }

            sessionData.repeattimes++;

            // Emit progress
            socket.emit('bot-progress', { current: sessionData.repeattimes, total: bots });

            const delay = randomNames ? getRandomInt(90, 200) : 15;

            const timeout1 = setTimeout(() => {
                if (!sessionData.isStopped) spam();
            }, delay);
            sessionData.timeouts.push(timeout1);

            const timeout2 = setTimeout(() => {
                if (!sessionData.isStopped) {
                    if (randomNames) {
                        sendjoin("Random Name", bots - sessionData.repeattimes);
                    } else {
                        sendjoin(botName + (bots - sessionData.repeattimes), bots - sessionData.repeattimes);
                    }
                }
            }, delay);
            sessionData.timeouts.push(timeout2);
        }

        function join(name, idee) {
            while (!name || name === undefined) {
                name = getName();
            }

            const client = new Kahoot();
            client.setMaxListeners(Number.POSITIVE_INFINITY);
            sessionData.clients.push(client);

            const twoFactorList = [0, 1, 2, 3];
            let localTwoFactorSolution = null;

            const finalName = useBypass ? applyNameBypass(name) : name;
            const nickname = [random.first(), random.last()];

            client.join(pin, finalName, nickname).catch(err => {
                if (err && err.description === "Duplicate name") {
                    join(getName(), idee);
                } else {
                    const errorMsg = err && err.description ? err.description : "Unknown error";
                    socket.emit('log', { type: 'error', message: `[FAILED] Client ${idee} (${name}): ${errorMsg}` });

                    if (errorMsg.includes("full") || errorMsg.includes("capacity") || errorMsg.includes("locked") || errorMsg.includes("not found")) {
                        socket.emit('log', { type: 'error', message: 'Game may be full or unavailable!' });
                    }

                    try {
                        client.leave();
                    } catch (e) {}
                }
            });

            client.on("Joined", info => {
                socket.emit('log', { type: 'success', message: `[JOINED] ${name}` });

                if (info && info.twoFactorAuth) {
                    const twoFactorInterval = setInterval(() => {
                        if (localTwoFactorSolution !== null) {
                            try {
                                client.answerTwoFactorAuth(localTwoFactorSolution);
                            } catch (e) {}
                        }
                        const shuffled = shuffle([...twoFactorList]);
                        try {
                            client.answerTwoFactorAuth(shuffled);
                        } catch (e) {}
                    }, 1000);

                    client.once("Disconnect", () => {
                        clearInterval(twoFactorInterval);
                    });
                }
            });

            client.on("Error", error => {
                socket.emit('log', { type: 'error', message: `[ERROR] ${name} - ${error.message || error}` });
            });

            client.on("TwoFactorCorrect", () => {
                socket.emit('log', { type: 'info', message: `[2FA] ${name} passed 2-factor authentication` });
                localTwoFactorSolution = [...twoFactorList];
            });

            client.on("QuestionReady", question => {
                try {
                    if (!question || !question.type) {
                        return;
                    }

                    if (idee === 1) {
                        socket.emit('question-ready', {
                            type: question.type,
                            questionIndex: question.questionIndex,
                            answerCount: question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                                question.quizQuestionAnswers[question.questionIndex] : 4
                        });
                    }

                    if (question.type === "quiz") {
                        const answerCount = question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                            question.quizQuestionAnswers[question.questionIndex] : 4;

                        if (userControlled) {
                            // Wait for user to submit answer via socket
                            socket.once('submit-answer', (answer) => {
                                sessionData.sharedAnswer = answer;
                                setTimeout(() => {
                                    try {
                                        client.answer(answer);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000));
                            });
                        } else {
                            setTimeout(() => {
                                const toanswer = getRandomInt(0, answerCount - 1);
                                try {
                                    client.answer(toanswer);
                                } catch (e) {}
                            }, getRandomInt(1, 180000));
                        }
                    }

                    if (question.type === "word_cloud" || question.type === "open_ended") {
                        if (userControlled) {
                            socket.once('submit-text-answer', (answer) => {
                                sessionData.sharedAnswer = answer;
                                setTimeout(() => {
                                    try {
                                        client.answer(answer);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000));
                            });
                        } else {
                            setTimeout(() => {
                                try {
                                    client.answer("kahootflood.weebly.com");
                                } catch (e) {}
                            }, getRandomInt(1, 180000));
                        }
                    }

                    if (question.type === "jumble") {
                        const maxAnswers = question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                            question.quizQuestionAnswers[question.questionIndex] - 1 : 3;
                        setTimeout(() => {
                            try {
                                client.answer(getRandomInt(0, maxAnswers));
                            } catch (e) {}
                        }, getRandomInt(1, 20000));
                    }

                    if (question.type === "survey") {
                        const answerCount = question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                            question.quizQuestionAnswers[question.questionIndex] : 4;
                        if (userControlled) {
                            socket.once('submit-answer', (answer) => {
                                sessionData.sharedAnswer = answer;
                                setTimeout(() => {
                                    try {
                                        client.answer(answer);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000));
                            });
                        } else {
                            setTimeout(() => {
                                const toanswer = getRandomInt(0, answerCount - 1);
                                try {
                                    client.answer(toanswer);
                                } catch (e) {}
                            }, getRandomInt(1, 180000));
                        }
                    }
                } catch (error) {}
            });

            client.on("Disconnect", reason => {
                if (reason === "Quiz Locked") {
                    socket.emit('log', { type: 'error', message: `[KICKED] ${name} - Game is locked` });
                } else if (reason === "Game Full") {
                    socket.emit('log', { type: 'error', message: `[ERROR] ${name} - Game is full, cannot rejoin` });
                } else if (reason && reason !== "normal" && reason !== "Quiz Locked") {
                    socket.emit('log', { type: 'warning', message: `[DISCONNECTED] ${name} - Reason: ${reason}` });
                    if (reason !== "Game ended" && reason !== "Quiz ended") {
                        sendjoin(name, idee);
                    }
                }
            });

            client.on("QuestionEnd", data => {
                if (data && data.isCorrect) {
                    socket.emit('log', { type: 'success', message: `[CORRECT] ${name} got it correct` });
                } else {
                    socket.emit('log', { type: 'warning', message: `[WRONG] ${name} got it wrong` });
                }
            });

            client.on("QuizEnd", data => {
                if (data && data.rank) {
                    socket.emit('log', { type: 'info', message: `[FINISHED] ${name} finished with rank #${data.rank}` });
                }
                socket.emit('log', { type: 'info', message: `[STAYING] ${name} staying in game until auto-leave timer...` });
            });
        }

        spam();
        console.log('spam() function called!');

        // Auto-leave after 5 minutes
        setTimeout(() => {
            socket.emit('log', { type: 'info', message: '5 minutes elapsed. Leaving all bots...' });
            let leftCount = 0;
            sessionData.clients.forEach(client => {
                try {
                    client.leave();
                    leftCount++;
                } catch (e) {}
            });
            socket.emit('log', { type: 'success', message: `${leftCount} bot(s) disconnected.` });
            activeSessions.delete(socket.id);
        }, 300000);
    });

    socket.on('stop-bots', () => {
        const sessionData = activeSessions.get(socket.id);
        if (sessionData) {
            socket.emit('log', { type: 'info', message: 'Stopping all bots...' });

            // Mark session as stopped to prevent new bots from joining
            sessionData.isStopped = true;

            // Clear all pending timeouts to stop bots from joining
            if (sessionData.timeouts) {
                sessionData.timeouts.forEach(timeout => clearTimeout(timeout));
                sessionData.timeouts = [];
            }

            let leftCount = 0;
            sessionData.clients.forEach(client => {
                try {
                    client.leave();
                    leftCount++;
                } catch (e) {}
            });
            socket.emit('log', { type: 'success', message: `Stopped! ${leftCount} bot(s) disconnected.` });
            activeSessions.delete(socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const sessionData = activeSessions.get(socket.id);
        if (sessionData) {
            sessionData.clients.forEach(client => {
                try {
                    client.leave();
                } catch (e) {}
            });
            activeSessions.delete(socket.id);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Kahoot Bot Panel running on http://localhost:${PORT}`);
    console.log(`Password: ${PASSWORD}`);
});