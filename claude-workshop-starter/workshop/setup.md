# Claude Code Workshop - Pre-Setup Instructions

Hey @everyone! 

We have an **in-person Claude Code workshop today!** To make sure we can jump right into building amazing apps, please complete these setup steps **BEFORE** arriving:

## Required Pre-Workshop Setup

### GitHub Account
- **Create an account** at [github.com](https://github.com) if you don't have one
- **Learn the basics** of cloning a repository: [GitHub Getting Started Guide](https://docs.github.com/en/get-started/start-your-journey)
- **Quick test**: Try cloning any public repo to make sure it works

### Install Node.js
- **Download** from: https://nodejs.org/en/download
- Choose the **LTS version** (recommended for most users)
- **Run the installer** and restart your terminal/command prompt
- **Verify installation** by typing this in your terminal:
  ```bash
  node --version
  ```
  You should see something like `v20.11.0`

### Install Claude Code
Open your terminal and run:
```bash
npm install -g @anthropic/claude-code
```

**Verify it worked:**
```bash
claude --version
```

### Set Up Your Anthropic Account
1. **Go to** [console.anthropic.com](https://console.anthropic.com)
2. **Sign up using your school email** (@northeastern.edu)
3. **Verify your email** (check your inbox)
4. **Navigate to** API Keys section
5. **Create a new API key** - it will look like `sk-ant-...`
6. **Save this key** somewhere safe (you'll need it during workshop!)

### Sign up for free API credits:
- Make sure to do this at least **1 hour**  before the workshop
- **Complete Security Check ** https://docs.google.com/forms/d/e/1FAIpQLScP9LuFwiHEx806tv9zczjCIEzqO1Zjb-FjB4XWoa6BS1NNKQ/viewform
**Set Up Your Account** If you haven't already:
- Create a Claude Pro account using your Northeastern student email at https://claude.ai/
- Sign in to the developer console at https://console.anthropic.com/ with the same Northeastern email
- Navigate to Settings → Organization and copy your Organization ID
- Fill out this form with your Organization ID: https://docs.google.com/forms/d/e/1FAIpQLSd9F4EGmPVe2a-q_EDmcDik-w6A5cDtcz9JxHyqk2UIU4EOzQ/viewform
**Important**: When filling out the form, make sure to put September 17th as the date (our kickoff meeting).

### Link Claude Code to Your Account
In your terminal, run:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```
*(Replace `sk-ant-your-key-here` with your actual API key)*

**Windows users:** Use `set` instead of `export`:
```bash
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Test everything works:**
```bash
claude "Say hello and tell me you're ready for the workshop"
``` 

## :round_pushpin: Workshop Details

**When:** Today! 7 - 9 pm
**Where:** Ryder 147
**What to bring:** Laptop with charger, excitement to build!

## What We'll Build

In just 90 minutes, you'll create and deploy a real web application - no coding experience needed!

**Can't wait to see what you create! See you there! **

---

*Questions?  DM me!*