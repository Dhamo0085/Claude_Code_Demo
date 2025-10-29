# Claude Code Workshop - Troubleshooting Guide 🛠️

Quick fixes for common issues during the workshop.

## 🚨 Most Common Issues

### 1. "npm: command not found"
**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Download the LTS version
- Restart your terminal after installation
- Try `npm --version` to verify

### 2. "Invalid API Key" or Claude not responding
**Solution:**
```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# Should show: sk-ant-xxxxx
# If empty or wrong, reset it:
export ANTHROPIC_API_KEY=sk-ant-your-actual-key
```

**Common mistakes:**
- Extra quotes: `"sk-ant-xxx"` → `sk-ant-xxx`
- Extra spaces: ` sk-ant-xxx` → `sk-ant-xxx`
- Wrong prefix: Must start with `sk-ant-`

### 3. "Permission denied" when installing Claude Code
**Solution:**
```bash
# Mac/Linux: Use sudo
sudo npm install -g @anthropic/claude-code

# Windows: Run terminal as Administrator
# Right-click Terminal → Run as Administrator
```

### 4. Claude creates files but nothing appears
**Solution:**
- Check you're in the right directory: `pwd` (Mac/Linux) or `cd` (Windows)
- Look for new `.html` files: `ls` (Mac/Linux) or `dir` (Windows)
- Open the HTML file directly in browser (don't need a server)

## 💻 Platform-Specific Issues

### Windows Issues

**"'claude' is not recognized"**
```bash
# Add npm global path to system PATH
npm config get prefix
# Add this path + \bin to your system PATH
# Restart terminal
```

**Line ending issues**
- If files look weird, it's CRLF vs LF
- Just continue - won't affect functionality

### Mac Issues

**"xcrun: error"**
- Install Xcode Command Line Tools:
```bash
xcode-select --install
```

**zsh: command not found**
```bash
# Add to ~/.zshrc
export PATH=$PATH:$(npm config get prefix)/bin
source ~/.zshrc
```

### Linux Issues

**Node version too old**
```bash
# Update Node via package manager
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔧 Claude Code Specific Issues

### Claude creates wrong file type
**Tell Claude explicitly:**
```bash
claude "Create an HTML file called index.html with..."
```

### Claude won't modify template.html
**Be specific:**
```bash
claude "Open and modify the existing template.html file to..."
```

### Code appears but doesn't work
**Common fixes:**
1. Make sure JavaScript is inside `<script>` tags
2. Check browser console for errors (F12)
3. Ask Claude: "Fix the errors showing in browser console"

## 🌐 Deployment Issues

### Vercel deployment fails
**Quick fixes:**
1. Make sure you have an `index.html` (not `template.html`)
2. Remove any server-side code
3. Check for syntax errors in JavaScript

**Rename file:**
```bash
# If your main file isn't index.html
mv template.html index.html
```

### GitHub Pages not showing site
1. Settings → Pages → Source: Deploy from branch
2. Select `main` branch, `/ (root)`
3. Wait 5 minutes
4. Check: `https://[username].github.io/[repo-name]`

## 🎯 Quick Wins

### Nothing's working? Start fresh:
```bash
# Create new directory
mkdir workshop-demo
cd workshop-demo

# Create simple HTML file
claude "Create a simple index.html with a button that shows an alert"
```

### Lost? Get back on track:
```bash
# See where you are
pwd

# See what files exist
ls -la

# Start over with template
claude "Using the template.html file, create a simple todo app"
```

### Browser issues:
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- Try different browser
- Open Developer Tools → Console for errors

## 💬 Getting Help

### In the workshop:
1. **Raise your hand** - We'll come help
3. **Buddy system** - Ask your neighbor
4. **Don't wait** - Ask immediately when stuck

### Error messages to share:
When asking for help, share:
1. The command you ran
2. The exact error message
3. What you expected to happen

### Still stuck?
**Workshop escape hatch:**
```bash
# Just get something working
claude "Create a simple HTML page with one button that counts clicks. Make it work immediately."
```

## 🎉 Remember

- **It's okay to struggle** - Everyone does at first
- **Simple is fine** - One button that works > complex app that doesn't
- **Ask for help** - That's why we're here
- **Have fun** - You're building something real!

---

**Pro tip:** Most issues are simple typos or missed steps. Take a breath, read the error carefully, and try again! 🚀