#!/usr/bin/env node
const Kahoot = require("kahoot.js-updated");
const words = require('an-array-of-english-words');
const random = require('random-name');
const chalk = require('chalk');

/*
 * MOBILE-FRIENDLY KAHOOT BOT FLOODER
 * 
 * Usage: node kahoot-mobile.js <PIN> <BOTS> [options]
 * 
 * Examples:
 *   node kahoot-mobile.js 123456 50
 *   node kahoot-mobile.js 123456 100 --random
 *   node kahoot-mobile.js 123456 75 --random --bypass
 * 
 * Options:
 *   --random     Use random names (recommended)
 *   --bypass     Use name bypass (special characters)
 *   --name=Bob   Use custom name (default: Bot)
 * 
 * BOT CONFIGURATION:
 * - Auto-leave timer: 5 MINUTES (300 seconds)
 * - Answer delay: 1-180 seconds (supports Kahoot questions up to 4 minutes)
 * - Bots stay connected even after quiz ends
 */

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(chalk.cyan('\n════════════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('        KAHOOT BOT FLOODER - MOBILE VERSION'));
    console.log(chalk.cyan('════════════════════════════════════════════════════\n'));
    console.log(chalk.yellow('Usage:'));
    console.log('  node kahoot-mobile.js <PIN> <BOTS> [options]\n');
    console.log(chalk.yellow('Examples:'));
    console.log('  node kahoot-mobile.js 123456 50');
    console.log('  node kahoot-mobile.js 123456 100 --random');
    console.log('  node kahoot-mobile.js 123456 75 --random --bypass\n');
    console.log(chalk.yellow('Options:'));
    console.log('  --random         Use random names (recommended)');
    console.log('  --bypass         Use name bypass (special characters)');
    console.log('  --name=<name>    Use custom name (default: Bot)\n');
    console.log(chalk.cyan('════════════════════════════════════════════════════\n'));
    process.exit(0);
}

const pin = args[0];
const bots = parseInt(args[1], 10);

if (isNaN(bots) || bots <= 0) {
    console.error(chalk.red("ERROR: Invalid number of bots. Must be a positive number."));
    process.exit(1);
}

// Parse options
const useRandomNames = args.includes('--random');
const useNameBypass = args.includes('--bypass');
let botname = 'Bot';

// Check for custom name
const nameArg = args.find(arg => arg.startsWith('--name='));
if (nameArg) {
    botname = nameArg.split('=')[1];
}

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

function applyNameBypass(name) {
    const replacements = {
        'a': 'ᗩ', 'b': 'ᗷ', 'c': 'ᑕ', 'd': 'ᗪ', 'e': 'E',
        'f': 'ᖴ', 'g': 'G', 'h': 'ᕼ', 'i': 'I', 'j': 'ᒍ',
        'k': 'K', 'l': 'ᒪ', 'm': 'ᗰ', 'n': 'ᑎ', 'o': 'O',
        'p': 'ᑭ', 'q': 'ᑫ', 'r': 'ᖇ', 's': 'ᔕ', 't': 'T',
        'u': 'ᑌ', 'v': 'ᐯ', 'w': 'ᗯ', 'x': '᙭', 'y': 'Y', 'z': 'ᘔ',
    };
    let result = name;
    for (const [letter, replacement] of Object.entries(replacements)) {
        result = result.replace(new RegExp(letter, 'gi'), replacement);
    }
    return result;
}

process.setMaxListeners(Number.POSITIVE_INFINITY);

let repeattimes = 0;
let allClients = [];

console.clear();
console.log(chalk.cyan('\n════════════════════════════════════════'));
console.log(chalk.bold.cyan('  INITIALIZING BOTS...'));
console.log(chalk.cyan('════════════════════════════════════════\n'));
console.log(chalk.cyan(`Game PIN: ${pin}`));
console.log(chalk.cyan(`Number of bots: ${bots}`));
console.log(chalk.cyan(`Random names: ${useRandomNames ? 'Yes' : 'No'}`));
console.log(chalk.cyan(`Name bypass: ${useNameBypass ? 'Yes' : 'No'}`));
if (!useRandomNames) {
    console.log(chalk.cyan(`Bot name: ${botname}`));
}
console.log(chalk.yellow(`Auto-leave: 5 minutes\n`));
console.log(chalk.gray('Connecting...\n'));

function spam() {
    if (repeattimes >= bots) {
        console.log(chalk.green("\n[SUCCESS] All bots initialized successfully!"));
        console.log(chalk.yellow("[INFO] Auto-leave timer: 5 minutes\n"));
        return;
    }

    repeattimes++;
    const delay = useRandomNames ? getRandomInt(90, 200) : 15;

    setTimeout(() => {
        spam();
    }, delay);

    setTimeout(() => {
        if (useRandomNames) {
            sendjoin(getName(), bots - repeattimes);
        } else {
            sendjoin(botname + (bots - repeattimes), bots - repeattimes);
        }
    }, delay);
}

function sendjoin(name, id) {
    join(name, id);
}

function join(name, idee) {
    while (!name || name === undefined) {
        name = getName();
    }

    const client = new Kahoot();
    client.setMaxListeners(Number.POSITIVE_INFINITY);
    allClients.push(client);

    const finalName = useNameBypass ? applyNameBypass(name) : name;
    const nickname = [random.first(), random.last()];

    client.join(pin, finalName, nickname).catch(err => {
        if (err && err.description === "Duplicate name") {
            join(getName(), idee);
        } else {
            const errorMsg = err && err.description ? err.description : "Unknown error";
            console.log(chalk.red(`[FAILED] Client ${idee} (${name}): ${errorMsg}`));

            if (errorMsg.toLowerCase().includes("participant limit") || errorMsg.toLowerCase().includes("limit reached")) {
                console.log(chalk.red('\n⚠️  PARTICIPANT LIMIT REACHED - GAME IS FULL! ⚠️\n'));
            } else if (errorMsg.toLowerCase().includes("full") || errorMsg.toLowerCase().includes("capacity")) {
                console.log(chalk.red('\n⚠️  GAME IS FULL! ⚠️\n'));
            } else if (errorMsg.toLowerCase().includes("locked")) {
                console.log(chalk.red('\n⚠️  GAME IS LOCKED! ⚠️\n'));
            } else if (errorMsg.toLowerCase().includes("not found") || errorMsg.toLowerCase().includes("invalid")) {
                console.log(chalk.red('\n⚠️  GAME NOT FOUND - CHECK PIN! ⚠️\n'));
            }

            try {
                client.leave();
            } catch (e) {}
        }
    });

    client.on("Joined", () => {
        console.log(chalk.green(`[JOINED] ${name}`));
    });

    client.on("Error", error => {
        console.log(chalk.red(`[ERROR] ${name} - ${error.message || error}`));
    });

    client.on("QuestionReady", question => {
        try {
            if (!question || !question.type) return;

            if (question.type === "quiz" || question.type === "survey") {
                const answerCount = question.quizQuestionAnswers && question.quizQuestionAnswers[question.questionIndex] ?
                    question.quizQuestionAnswers[question.questionIndex] : 4;

                setTimeout(() => {
                    const toanswer = getRandomInt(0, answerCount - 1);
                    try {
                        client.answer(toanswer);
                    } catch (e) {}
                }, getRandomInt(1, 180000));
            }

            if (question.type === "word_cloud" || question.type === "open_ended") {
                setTimeout(() => {
                    try {
                        client.answer("Kahoot Bot");
                    } catch (e) {}
                }, getRandomInt(1, 180000));
            }
        } catch (error) {}
    });

    client.on("Disconnect", reason => {
        if (reason === "Quiz Locked") {
            console.log(chalk.red(`[KICKED] ${name} - Game is locked`));
        } else if (reason === "Game Full") {
            console.log(chalk.red(`[ERROR] ${name} - Game is full, cannot rejoin`));
        }
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
    process.exit(0);
}

process.on("SIGINT", () => {
    console.log(chalk.red("\n\n[SHUTDOWN] Exiting..."));
    leaveAllBots();
});

process.on("uncaughtException", (error) => {
    console.error(chalk.red("Uncaught error:", error.message));
});

process.on("unhandledRejection", (reason, promise) => {
    console.error(chalk.red("Unhandled rejection:", reason));
});

spam();

setTimeout(() => {
    leaveAllBots();
}, 300000); // 5 minutes

