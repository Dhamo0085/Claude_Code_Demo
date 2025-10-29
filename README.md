# Claude Code Demo Workshop

**Build impressive MVPs in 90 minutes with AI-powered coding.**

This workshop demonstrates how entrepreneurs and product builders can use Claude Code to rapidly prototype and ship working web applications. No coding experience required - just bring your ideas and we'll build them together.

## 🎯 What You'll Learn

- **AI-Assisted Development**: How to collaborate with Claude Code to build apps faster
- **MVP-First Mindset**: Focus on core features that matter for demos and user testing
- **Rapid Prototyping**: Ship working prototypes in under 2 hours
- **Professional UI**: Make demo-ready apps that impress investors and users

## 🚀 Workshop Structure

### 90-Minute Session Flow:
1. **Setup (15 min)**: Get Claude Code running on your machine
2. **Foundation (15 min)**: Learn the core patterns and philosophy
3. **Build (45 min)**: Create your own app from scratch
4. **Demo (15 min)**: Present your creation and get feedback

## 📋 Prerequisites

### Required Software:
- **GitHub Account**: [github.com](https://github.com)
- **Node.js**: Download from [nodejs.org](https://nodejs.org) (LTS version)
- **Claude Code**: `npm install -g @anthropic/claude-code`

### API Access:
- **Anthropic Account**: [console.anthropic.com](https://console.anthropic.com)
- **API Key**: Create one in your Anthropic console
- **Free Credits**: Apply for Claude Code workshop credits

### Quick Setup Test:
```bash
# Verify installations
node --version          # Should show v20.x.x
claude --version        # Should show version info

# Set your API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Test Claude Code
claude "Hello! Are you ready to build an app?"
```

## 💡 What You'll Build

### Simple Apps (< 150 lines):
- **Habit Tracker**: Daily habit tracking with streak counters
- **Idea Board**: Capture and organize business/product ideas
- **Waitlist Collector**: Email collection for product launches

### Advanced Apps (Full-Stack):
- **Pilot Program Manager**: Enterprise B2B analytics dashboard
- **Analytics Dashboard**: Real-time metrics with predictive insights
- **Discord Bot**: Automated community management

## 🏗️ Architecture Patterns

### Single-File Apps (`template.html`):
- Basic CRUD operations
- In-memory data storage
- Simple UI components
- Perfect for quick MVPs

### Multi-File Apps:
- Express.js backend with REST APIs
- SQLite databases
- React frontend components
- Professional dashboards

## 🎨 Design System

All examples follow a consistent dark theme:
- **Background**: Pure black (#0a0a0a)
- **Cards**: Dark gray (#141414) with subtle borders
- **Accents**: Professional blue (#3b82f6)
- **Typography**: Clean, readable fonts
- **Interactions**: Smooth 250ms transitions

## 📁 Project Structure

```
Claude_Code_Demo/
├── claude-workshop-starter/     # Main workshop materials
│   ├── claude.md               # Development guidelines
│   ├── template.html           # Single-file app starter
│   ├── prompts.txt             # Example project ideas
│   ├── examples/               # Demo applications
│   │   ├── habit-tracker.html  # Simple habit app
│   │   ├── idea-board.html     # Idea management
│   │   ├── advanced-example-2/ # Full-stack dashboard
│   │   └── discord/            # Bot integration
│   ├── workshop/               # Setup & troubleshooting
│   └── resources/              # Advanced guides
└── DIRECTORY_STRUCTURE.md      # Complete file guide
```

## 🚀 Getting Started

### Step 1: Clone & Setup
```bash
git clone <repository-url>
cd Claude_Code_Demo
cd claude-workshop-starter
```

### Step 2: Choose Your Starting Point

**For Beginners:**
```bash
# Start with a simple template
cp template.html my-app.html
# Then edit my-app.html with Claude Code
```

**For Experienced Builders:**
```bash
# Explore advanced examples
cd examples/advanced-example-2
# Run the full-stack app
```

### Step 3: Build with Claude Code
```bash
# Start Claude Code in your project
claude

# Tell Claude what you want to build
"I want to build a task management app for my startup"
```

## 💡 Key Principles

### MVP Essentials:
- ✅ Core feature only (what users actually need)
- ✅ Professional, demo-ready UI
- ✅ Sample data for immediate testing
- ✅ Success feedback and validation
- ✅ Mobile-responsive design

### Skip Complex Stuff:
- ❌ Complex authentication systems
- ❌ Multi-tenant architectures
- ❌ Advanced security features
- ❌ Scalability optimizations

### Development Philosophy:
- **Start Simple**: Single-file apps for quick wins
- **Iterate Fast**: Use in-memory data for prototyping
- **Scale Smart**: Add databases/files when complexity grows
- **Demo First**: Make it look impressive from day one

## 🔧 Example Commands

```bash
# Start a new project
claude "Create a customer feedback collection app"

# Add features to existing app
claude "Add user authentication to my app"

# Fix issues
claude "My app isn't saving data properly"

# Improve UI
claude "Make the design more modern and professional"
```

## 📚 Resources

- **`claude.md`**: Complete development guidelines
- **`workshop/setup.md`**: Detailed setup instructions
- **`workshop/troubleshooting.md`**: Common issues & solutions
- **`resources/advanced.md`**: Advanced Claude Code features
- **`examples/`**: Working code examples at all levels

## 🎯 Success Metrics

By the end of the workshop, you'll have:
- ✅ A working web application
- ✅ Professional UI ready for demos
- ✅ Code you can show to investors
- ✅ Confidence to build more apps
- ✅ Portfolio piece for your startup

## 🤝 Workshop Format

- **Individual Work**: Build your own unique app
- **Peer Learning**: Share ideas and get feedback
- **Expert Guidance**: Direct access to Claude Code experts
- **Real Results**: Deployable code you can use immediately

---

**Ready to build something amazing?** Follow the setup instructions above, then dive into the examples. Remember: the goal isn't perfection - it's shipping something impressive that works.

*Built for entrepreneurs who want to move fast and ship often.*