# 🤖 Kahoot Bot Flooder

A powerful Kahoot bot flooder with both desktop and **mobile support**!

---

## 📱 Mobile Version (iPhone/Android)

Perfect for running on **iSH (iPhone)** or **Termux (Android)**!

### Quick Start (Mobile)

```bash
# Clone the repository
git clone https://github.com/kirilt2/KahootThing.git
cd KahootThing

# Install dependencies
npm install

# Run the mobile version
node kahoot-mobile.js <PIN> <BOTS> [options]
```

### Examples

```bash
# Basic usage: 50 bots with default names
node kahoot-mobile.js 123456 50

# With random names (recommended)
node kahoot-mobile.js 123456 100 --random

# With random names AND name bypass
node kahoot-mobile.js 123456 75 --random --bypass

# Custom bot name
node kahoot-mobile.js 123456 50 --name=MyBot
```

### Options

- `--random` - Use random names (recommended)
- `--bypass` - Use name bypass (special characters to avoid filters)
- `--name=<name>` - Use custom bot name (default: Bot)

---

## 💻 Desktop Version

For full interactive control on PC/Mac/Linux:

```bash
# Install dependencies
npm install

# Run the interactive version
node kahoot.js
```

This version includes:
- ✅ Interactive prompts
- ✅ Bot control mode
- ✅ 2-factor authentication brute force
- ✅ Custom answer control

---

## ⚙️ Features

### Mobile & Desktop:
- 🤖 **Auto-leave timer**: 5 minutes
- ⏱️ **Answer delay**: 1-180 seconds (supports 4-minute Kahoot questions)
- 🔄 **Smart duplicate name handling**
- 🎯 **Supports all question types**: Quiz, Survey, Word Cloud, Open Ended
- 📊 **Clear error messages** for full/locked games
- 🛡️ **Stays connected** even after quiz ends

---

## 📱 iPhone Setup (iSH)

### 1. Install iSH
Download from [App Store](https://apps.apple.com/app/ish-shell/id1436902243)

### 2. Install Node.js
```bash
apk update
apk add nodejs npm git
```

### 3. Clone & Run
```bash
git clone https://github.com/kirilt2/KahootThing.git
cd KahootThing
npm install
node kahoot-mobile.js 123456 50 --random
```

---

## 🤖 Android Setup (Termux)

### 1. Install Termux
Download from [F-Droid](https://f-droid.org/packages/com.termux/)

### 2. Install Node.js
```bash
pkg update
pkg upgrade
pkg install nodejs git
```

### 3. Clone & Run
```bash
git clone https://github.com/kirilt2/KahootThing.git
cd KahootThing
npm install
node kahoot-mobile.js 123456 50 --random
```

---

## 📊 Usage Tips

### For Best Results:
1. **Use random names** (`--random`) to avoid detection
2. **Start with fewer bots** (50-100) on mobile devices
3. **Good WiFi** is essential for stability
4. **Keep app open** - Don't minimize iSH/Termux while running
5. **Set Kahoot question times to maximum** (240 seconds) for best performance

### Kahoot Creator Settings:
- Set question time limits to **4 minutes (240 seconds)**
- Increase participant limit in game settings
- Use compatible question types: Quiz, True/False, Survey, Slider

---

## 🆘 Troubleshooting

### "Cannot find module 'readline-sync'"
✅ **Solution**: Use `kahoot-mobile.js` instead of `kahoot.js` on mobile devices

### Bots not joining?
- Check the game PIN is correct
- Make sure the game isn't locked
- Verify participant limit isn't reached
- Check your internet connection

### "npm install" fails on mobile?
- Run `apk add python3 make g++` (iSH)
- Or `pkg install python make clang` (Termux)
- Then try `npm install` again

### iSH crashes or freezes?
- Try reducing bot count (use 25-50 instead of 100+)
- Close other apps to free up memory
- Restart iSH and try again

---

## 📝 Command Reference

### Mobile Version (kahoot-mobile.js)
```bash
node kahoot-mobile.js <PIN> <BOTS> [options]

Options:
  --random         Use random names
  --bypass         Use name bypass
  --name=<name>    Custom bot name
  --help, -h       Show help
```

### Desktop Version (kahoot.js)
```bash
node kahoot.js
# Follow interactive prompts
```

---

## ⚠️ Educational Use Only

This tool is for **educational purposes only**. Use responsibly:
- ✅ Use for testing your own Kahoot games
- ✅ Use with permission in educational settings
- ❌ Don't disrupt actual classes or exams
- ❌ Don't use maliciously

---

## 📦 Dependencies

- `kahoot.js-updated` - Kahoot API wrapper
- `an-array-of-english-words` - Random word generation
- `random-name` - Random name generation
- `chalk` - Terminal colors
- `readline-sync` - Interactive prompts (desktop only)
- `console-title` - Set terminal title (desktop only)
- `beepbeep` - Audio alerts (desktop only)

---

## 🔄 Updating

Pull the latest changes:

```bash
cd KahootThing
git pull origin main
npm install
```

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 🌟 Support

Having issues? Make sure you're using the correct version:
- 📱 **Mobile (iPhone/Android)**: Use `kahoot-mobile.js`
- 💻 **Desktop (PC/Mac/Linux)**: Use `kahoot.js`

---

**Made with ❤️ for educational purposes**

**Repository**: [https://github.com/kirilt2/KahootThing](https://github.com/kirilt2/KahootThing)
