const readline = require('readline-sync');
const Kahoot = require("kahoot.js-updated");
const words = require('an-array-of-english-words');
const random = require('random-name');
const setTitle = require('console-title');
const beep = require('beepbeep');
const chalk = require('chalk');

setTitle('Kahoot Bot Flooder');

/*
 * BOT CONFIGURATION:
 * - Auto-leave timer: 5 MINUTES (300 seconds)
 * - Answer delay: 1-180 seconds (supports Kahoot questions up to 4 minutes)
 * - Bots stay connected even after quiz ends
 * 
 * KAHOOT CREATOR TIP:
 * Set question time limits to maximum (240 seconds/4 minutes) 
 * for best bot performance and longer game sessions
 */

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

process.setMaxListeners(Number.POSITIVE_INFINITY);

console.clear();
console.log('\n');
console.log(chalk.cyan('════════════════════════════════════════════════════'));
console.log(chalk.cyan('                                                    '));
console.log(chalk.bold.cyan('        KAHOOT BOT FLOODER'));
console.log(chalk.cyan('                                                    '));
console.log(chalk.cyan('════════════════════════════════════════════════════'));
console.log('\n');

// Bot flooding mode only
let antibotmode = readline.question(chalk.cyan('Use antibot mode? (y/n): '));
if (antibotmode === "y") {
    console.log(chalk.yellow("Note: 2-factor brute forcing doesn't work with antibot mode.\n"));
}

const pin = readline.question(chalk.cyan('Enter game PIN: '));
const bots = parseInt(readline.question(chalk.cyan('Enter number of bots: ')), 10);

if (isNaN(bots) || bots <= 0) {
    console.error(chalk.red("ERROR: Invalid number of bots. Exiting."));
    process.exit(1);
}

let ranname;
let botname = "";
let er;

if (antibotmode === "y") {
    ranname = true;
    er = "n";
} else {
    const rannameInput = readline.question(chalk.cyan('Use random names? (y/n): '));
    ranname = (rannameInput === "y");
    if (!ranname) {
        botname = readline.question(chalk.cyan('Enter bot name: '));
    }
    er = readline.question(chalk.cyan('Use name bypass? (y/n): '));
}

const usercontrolledInput = readline.question(chalk.cyan('Control the bots? (y/n): '));
const usercontrolled = (usercontrolledInput === "y");
let beepis = "n";

if (usercontrolled) {
    beepis = readline.question(chalk.cyan('Beep when bots need controlling? (y/n): '));
}

let repeattimes = 0;
let sharedAnswer = null;
let allClients = [];

function sendjoin(name, id) {
    if (ranname) {
        join(getName(), id);
    } else {
        join(name, id);
    }
}

function spam() {
    if (repeattimes >= bots) {
        console.log(chalk.green("\n[SUCCESS] All bots initialized successfully!"));
        console.log(chalk.yellow("[INFO] Auto-leave timer: 5 minutes\n"));
        return;
    }

    repeattimes++;
    const delay = ranname ? getRandomInt(90, 200) : 15;

    setTimeout(() => {
        spam();
    }, delay);

    setTimeout(() => {
        if (ranname) {
            sendjoin("This will become a random name!", bots - repeattimes);
        } else {
            sendjoin(botname + (bots - repeattimes), bots - repeattimes);
        }
    }, delay);
}

function join(name, idee) {
    while (!name || name === undefined) {
        name = getName();
    }

    const client = new Kahoot();
    client.setMaxListeners(Number.POSITIVE_INFINITY);
    allClients.push(client);

    const twoFactorList = [0, 1, 2, 3];
    let localTwoFactorSolution = null;

    const finalName = (er === "y") ? applyNameBypass(name) : name;
    const nickname = [random.first(), random.last()];

    client.join(pin, finalName, nickname).catch(err => {
        if (err && err.description === "Duplicate name") {
            // Always use a new random name on duplicate, regardless of ranname setting
            join(getName(), idee);
        } else {
            const errorMsg = err && err.description ? err.description : "Unknown error";
            console.log(chalk.red(`[FAILED] Client ${idee} (${name}): ${errorMsg}`));

            // Check for specific errors that indicate the game is full or unavailable
            if (errorMsg.includes("full") || errorMsg.includes("capacity") || errorMsg.includes("locked") || errorMsg.includes("not found")) {
                console.log(chalk.red(`[ERROR] Game may be full or unavailable!`));
            }

            try {
                client.leave();
            } catch (e) {}
        }
    });

    client.on("Joined", info => {
        console.log(chalk.green(`[JOINED] ${name}`));

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
        console.log(chalk.red(`[ERROR] ${name} - ${error.message || error}`));
    });

    client.on("TwoFactorCorrect", () => {
        console.log(chalk.cyan(`[2FA] ${name} passed 2-factor authentication`));
        localTwoFactorSolution = [...twoFactorList];
    });

    client.on("QuestionReady", question => {
        try {
            if (!question || !question.type) {
                return;
            }

            if (idee === 1 && beepis === "y") {
                beep();
            }

            if (question.type === "quiz") {
                const answerCount = question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                    question.quizQuestionAnswers[question.questionIndex] : 4;

                if (usercontrolled) {
                    if (idee === 1) {
                        let answer;
                        if (answerCount === 2) {
                            answer = readline.question(chalk.yellow('t=triangle, d=diamond: '));
                            answer = answer.replace('t', '1').replace('d', '2');
                        } else if (answerCount === 3) {
                            answer = readline.question(chalk.yellow('t=triangle, d=diamond, c=circle: '));
                            answer = answer.replace('t', '1').replace('d', '2').replace('c', '3');
                        } else {
                            answer = readline.question(chalk.yellow('t=triangle, d=diamond, c=circle, s=square: '));
                            answer = answer.replace('t', '1').replace('d', '2').replace('c', '3').replace('s', '4');
                        }
                        sharedAnswer = parseInt(answer, 10);
                        setTimeout(() => {
                            try {
                                client.answer(sharedAnswer - 1);
                            } catch (e) {}
                        }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                    } else {
                        const waitInterval = setInterval(() => {
                            if (sharedAnswer !== null) {
                                clearInterval(waitInterval);
                                setTimeout(() => {
                                    try {
                                        client.answer(sharedAnswer - 1);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                            }
                        }, 100);
                    }
                } else {
                    setTimeout(() => {
                        const toanswer = getRandomInt(0, answerCount - 1);
                        try {
                            client.answer(toanswer);
                        } catch (e) {}
                    }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                }
            }

            if (question.type === "word_cloud") {
                if (usercontrolled) {
                    if (idee === 1) {
                        const answer = readline.question(chalk.yellow('Type your answer: '));
                        sharedAnswer = answer;
                        setTimeout(() => {
                            try {
                                client.answer(answer);
                            } catch (e) {}
                        }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                    } else {
                        const waitInterval = setInterval(() => {
                            if (sharedAnswer !== null) {
                                clearInterval(waitInterval);
                                setTimeout(() => {
                                    try {
                                        client.answer(sharedAnswer);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                            }
                        }, 100);
                    }
                } else {
                    setTimeout(() => {
                        try {
                            client.answer("kahootflood.weebly.com");
                        } catch (e) {}
                    }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
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
                if (usercontrolled) {
                    if (idee === 1) {
                        const answer = readline.question(chalk.yellow('t=triangle, d=diamond, c=circle, s=square: '));
                        const answerNum = answer.replace('t', '1').replace('d', '2').replace('c', '3').replace('s', '4');
                        sharedAnswer = parseInt(answerNum, 10);
                        setTimeout(() => {
                            try {
                                client.answer(sharedAnswer - 1);
                            } catch (e) {}
                        }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                    } else {
                        const waitInterval = setInterval(() => {
                            if (sharedAnswer !== null) {
                                clearInterval(waitInterval);
                                setTimeout(() => {
                                    try {
                                        client.answer(sharedAnswer - 1);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                            }
                        }, 100);
                    }
                } else {
                    setTimeout(() => {
                        const toanswer = getRandomInt(0, answerCount - 1);
                        try {
                            client.answer(toanswer);
                        } catch (e) {}
                    }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                }
            }

            if (question.type === "open_ended") {
                if (usercontrolled) {
                    if (idee === 1) {
                        const answer = readline.question(chalk.yellow('Type your answer: '));
                        sharedAnswer = answer;
                        setTimeout(() => {
                            try {
                                client.answer(answer);
                            } catch (e) {}
                        }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                    } else {
                        const waitInterval = setInterval(() => {
                            if (sharedAnswer !== null) {
                                clearInterval(waitInterval);
                                setTimeout(() => {
                                    try {
                                        client.answer(sharedAnswer);
                                    } catch (e) {}
                                }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                            }
                        }, 100);
                    }
                } else {
                    setTimeout(() => {
                        try {
                            client.answer("kahootflood.weebly.com");
                        } catch (e) {}
                    }, getRandomInt(1, 180000)); // Up to 3 minutes for long Kahoot questions
                }
            }
        } catch (error) {}
    });

    client.on("Disconnect", reason => {
        if (reason === "Quiz Locked") {
            console.log(chalk.red(`[KICKED] ${name} - Game is locked`));
        } else if (reason === "Game Full") {
            console.log(chalk.red(`[ERROR] ${name} - Game is full, cannot rejoin`));
        } else if (reason && reason !== "normal" && reason !== "Quiz Locked") {
            console.log(chalk.red(`[DISCONNECTED] ${name} - Reason: ${reason}`));
            // Only rejoin if it's an unexpected disconnection, not a normal end
            if (reason !== "Game ended" && reason !== "Quiz ended") {
                sendjoin(name, idee);
            }
        }
        // Don't rejoin on normal disconnections - let bots stay until auto-leave timer
    });

    client.on("QuestionEnd", data => {
        if (data && data.isCorrect) {
            console.log(chalk.green(`[CORRECT] ${name} got it correct`));
        } else {
            console.log(chalk.yellow(`[WRONG] ${name} got it wrong`));
        }
    });

    client.on("QuizEnd", data => {
        if (data && data.rank) {
            console.log(chalk.cyan(`[FINISHED] ${name} finished with rank #${data.rank}`));
        }
        console.log(chalk.gray(`[STAYING] ${name} staying in game until auto-leave timer...`));
        // Don't leave - wait for auto-leave timer (5 minutes)
    });
}

function leaveAllBots() {
    console.log(chalk.yellow('\n[INFO] 5 minutes elapsed. Leaving all bots...\n'));
    let leftCount = 0;
    allClients.forEach(client => {
        try {
            client.leave();
            leftCount++;
        } catch (e) {}
    });
    console.log(chalk.green(`[SUCCESS] ${leftCount} bot(s) disconnected.\n`));
}

process.on("SIGINT", () => {
    console.log(chalk.red("\n\n[SHUTDOWN] Exiting..."));
    leaveAllBots();
    process.exit();
});

process.on("uncaughtException", (error) => {});
process.on("unhandledRejection", (reason, promise) => {});

console.clear();
console.log(chalk.cyan('\n════════════════════════════════════════'));
console.log(chalk.bold.cyan('  INITIALIZING BOTS...'));
console.log(chalk.cyan('════════════════════════════════════════\n'));
console.log(chalk.cyan(`Game PIN: ${pin}`));
console.log(chalk.cyan(`Number of bots: ${bots}`));
console.log(chalk.yellow(`Auto-leave: 5 minutes\n`));
console.log(chalk.gray('Connecting...\n'));

spam();

setTimeout(() => {
    leaveAllBots();
}, 300000); // 5 minutes = 300000 milliseconds