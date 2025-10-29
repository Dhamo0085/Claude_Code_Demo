# Claude Code Workshop - Directory Structure Guide

This guide provides a comprehensive overview of the directory structure for the Claude Code workshop repository.

## Root Directory

```
Claude_Code_Demo/
├── README.md                          # Main project README
├── DIRECTORY_STRUCTURE.md             # This file - explains the repository layout
├── .git/                              # Git version control
├── .gitignore                         # Git ignore rules
└── claude-workshop-starter/           # Main workshop directory
```

## Workshop Structure

The `claude-workshop-starter/` directory contains all workshop materials and examples:

```
claude-workshop-starter/
├── claude.md                          # Workshop system prompt and guidelines
├── template.html                      # HTML template for simple apps
├── prompts.txt                        # Example prompts for workshop
├── .claude/                           # Claude Code configuration
│   └── settings.local.json           # Local Claude settings
├── workshop/                          # Workshop setup and documentation
├── resources/                         # Additional resources and guides
└── examples/                          # Example projects and applications
```

## Core Files

### claude.md
The workshop system prompt that defines:
- Role as a technical co-founder
- Hard rules (file modification guidelines)
- File decision criteria (when to edit vs create new files)
- In-memory database pattern
- Dark theme design system
- MVP essentials and response style

### template.html
A starting template for building simple single-page applications. Use this for:
- Basic CRUD apps
- Single entity applications (todos, notes, habits)
- Simple UI without complex components
- Projects under 150 lines

### prompts.txt
Collection of example prompts and ideas for building applications during the workshop.

## Workshop Materials (/workshop)

```
workshop/
├── setup.md                           # Pre-workshop setup instructions
│                                      # - GitHub account setup
│                                      # - Node.js installation
│                                      # - Claude Code installation
│                                      # - API key configuration
└── troubleshooting.md                 # Common issues and solutions
```

## Resources (/resources)

```
resources/
└── advanced.md                        # Advanced Claude Code features guide
                                      # - Agents and task management
                                      # - Advanced workflows
                                      # - Best practices
```

## Examples Directory (/examples)

The examples directory contains various project demonstrations showcasing different complexity levels:

```
examples/
├── habit-tracker.html                 # Simple habit tracking app (single file)
├── idea-board.html                    # Idea management board (single file)
├── waitlist.html                      # Email waitlist collector (single file)
├── advanced-example/                  # Complex multi-file application
├── advanced-example-2/                # Dashboard application with backend
├── dashboard/                         # Analytics & reporting system
└── discord/                           # Discord bot integration example
```

### Simple Examples (Single File Apps)

These demonstrate the single-file approach for simple applications:

**habit-tracker.html**
- Track daily habits with visual indicators
- In-memory data storage
- Dark theme UI
- Under 150 lines

**idea-board.html**
- Capture and organize ideas
- Simple CRUD operations
- Card-based layout
- Under 150 lines

**waitlist.html**
- Email collection for product launches
- Form validation
- Success feedback
- Under 150 lines

### Advanced Example

```
advanced-example/
├── README.md                          # Project documentation
├── app.js                             # Application logic
├── styles.css                         # Custom styling
└── index.html                         # Main HTML file
```

Multi-file structure for applications that need:
- Complex state management
- Reusable components
- Separation of concerns
- Over 200 lines of code

### Dashboard Example

```
dashboard/
├── frontend/                          # React-based dashboard UI
│   ├── README.md                     # Frontend setup guide
│   ├── QUICKSTART.md                 # Quick start instructions
│   ├── package.json                  # NPM dependencies
│   └── src/                          # Source files
└── backend/                          # Node.js/Express API
    ├── README.md                     # Backend documentation
    ├── DELIVERABLES.md               # Project deliverables
    ├── ANALYTICS_README.md           # Analytics documentation
    ├── ANALYTICS_SUMMARY.md          # Analytics summary
    ├── EXAMPLE_PREDICTION.md         # Prediction examples
    ├── package.json                  # NPM dependencies
    ├── server.js                     # Express server setup
    ├── database.js                   # SQLite database layer
    ├── schema.sql                    # Database schema
    ├── seed.js                       # Sample data generator
    ├── routes/                       # API route handlers
    │   ├── pilots.js                # Pilot management endpoints
    │   └── metrics.js               # Metrics endpoints
    ├── analytics/                    # Analytics modules
    └── reports/                      # Reporting functionality
```

A full-stack B2B pilot program manager featuring:
- RESTful API with Express
- SQLite database
- Success metrics tracking
- Health score calculations
- Risk assessment algorithms
- Conversion probability forecasting

### Discord Example

```
discord/
├── README.md                          # Bot setup and usage
├── bot.js                             # Discord bot implementation
└── package.json                       # Dependencies
```

Discord bot integration demonstrating external API usage and event handling.

## File Organization Principles

### When to Use Single Files (template.html)
- Basic CRUD operations
- Single entity type (todos, notes, habits)
- Simple UI without components
- Under 150 lines total
- Quick prototypes and MVPs

### When to Create Multiple Files
- Multiple features or views needed
- Complex state management required
- Reusable components
- Would exceed 200 lines in one file
- Need separation of concerns

## Development Workflow

1. **Start Simple**: Begin with `template.html` for simple ideas
2. **Iterate Quickly**: Use in-memory database pattern for prototyping
3. **Scale Up**: Move to multi-file structure when complexity grows
4. **Reference Examples**: Check examples directory for similar patterns
5. **Follow Guidelines**: Use `claude.md` as your development guide

## Configuration Files

### .claude/settings.local.json
Local configuration for Claude Code behavior, preferences, and settings specific to this workshop environment.

## Design System

All examples follow the workshop's dark theme design system:
- Pure black backgrounds (#0a0a0a)
- High contrast, eye-friendly colors
- Blue accents (#3b82f6) for CTAs
- Smooth transitions (250ms)
- Generous padding (24px)
- Large border radius (12px)

## Getting Started

1. **Setup**: Follow instructions in `workshop/setup.md`
2. **Learn**: Read through `claude.md` to understand the approach
3. **Explore**: Check out the examples directory
4. **Build**: Start with `template.html` or choose an example as inspiration
5. **Advanced**: Move to `resources/advanced.md` for sophisticated features

## Best Practices

- **Keep it Simple**: Start with single-file apps
- **Use Examples**: Reference similar projects in `/examples`
- **Follow Theme**: Maintain consistent dark theme styling
- **Ship Fast**: Focus on MVP features first
- **Professional UI**: Make it demo-ready from the start

## Additional Resources

- `workshop/troubleshooting.md` - Solutions to common issues
- `resources/advanced.md` - Advanced features and techniques
- Example READMEs - Detailed documentation for each example project

---

Built to help you ship impressive MVPs in 90 minutes!
