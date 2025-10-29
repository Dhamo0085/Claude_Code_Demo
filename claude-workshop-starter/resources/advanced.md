# Advanced Claude Code Features

This guide covers advanced features in Claude Code that enable sophisticated workflows, task management, and modular AI development.

## Table of Contents

1. [Subagents](#subagents)
2. [Task Management](#task-management)
3. [Plan Mode](#plan-mode)
4. [Extended Thinking](#extended-thinking)
5. [Best Practices](#best-practices)

---

## Subagents

Subagents are specialized AI assistants that Claude Code can delegate tasks to. Each operates with its own context window, custom system prompt, and configurable tool access.

### What Are Subagents?

Think of subagents as specialized team members. The main Claude instance acts as a project manager, delegating specific tasks to experts who handle them independently.

**Key Benefits:**
- **Context Preservation**: Each subagent operates in its own context, preventing pollution of the main conversation
- **Specialized Expertise**: Task-specific configurations improve success rates
- **Reusability**: Share across projects and teams
- **Flexible Permissions**: Control tool access per subagent
- **Parallel Processing**: Run up to 10 subagents concurrently for maximum efficiency

### Creating Subagents

#### Quick Start

1. Run the `/agents` command in Claude Code
2. Select "Create New Agent"
3. Define the agent's purpose and select tools
4. Save and invoke automatically or explicitly

#### Manual Configuration

Subagents are stored as Markdown files with YAML frontmatter:

**Location:**
- **Project level**: `.claude/agents/` (highest priority)
- **User level**: `~/.claude/agents/` (available across all projects)

**File Format:**
```yaml
---
name: code-reviewer
description: Use this agent to review code changes for bugs, style issues, and best practices
tools: Read, Grep, Glob
model: sonnet
---

You are an expert code reviewer. When reviewing code:
- Check for potential bugs and edge cases
- Verify adherence to coding standards
- Look for security vulnerabilities
- Suggest performance improvements
- Provide constructive feedback with examples

Always explain WHY a change should be made, not just WHAT to change.
```

### Available Tools

Subagents can be granted access to any of Claude Code's internal tools:

- **File Operations**: Read, Write, Edit, Glob
- **Search**: Grep
- **Execution**: Bash, BashOutput
- **Web**: WebFetch, WebSearch
- **Version Control**: Git operations via Bash
- **Task Delegation**: Even subagents can spawn other subagents (with limits)

### Model Selection

Specify the model via the `model` field:

- `sonnet` - Claude Sonnet 4.5 (balanced performance)
- `opus` - Claude Opus (most capable, slower)
- `haiku` - Claude Haiku (fastest, most cost-effective)
- `inherit` - Matches the main conversation's model
- Omit field to use configured default

**Cost Optimization Tip**: Use `haiku` for straightforward tasks like file operations, simple searches, or quick validations.

### Usage Methods

#### Automatic Invocation

Claude automatically delegates tasks based on:
- Task description
- Agent capabilities
- Context requirements

```bash
# Claude will automatically use the test-runner agent if it exists
claude "Run the tests and fix any failures"
```

#### Explicit Invocation

Request a specific agent directly:

```bash
claude "Use the code-reviewer subagent to check my latest changes"
```

### Built-in Subagent Types

Claude Code provides several built-in specialized agents:

1. **Explore Agent**: Fast codebase exploration
   - Pattern matching (e.g., "src/components/**/*.tsx")
   - Keyword searching (e.g., "API endpoints")
   - Architecture understanding
   - Thoroughness levels: "quick", "medium", "very thorough"

2. **Plan Agent**: Strategic planning and analysis
   - Similar to Explore but focused on planning
   - Read-only operations for safety
   - Multi-step task breakdown

3. **General-Purpose Agent**: Complex multi-step tasks
   - Full tool access
   - Autonomous operation
   - Code searching and file operations

### Example Subagents

#### Test Runner Agent

```yaml
---
name: test-runner
description: Automatically run tests, analyze failures, and fix test issues
tools: Bash, Read, Edit, Grep
model: sonnet
---

You are a test automation expert. When running tests:
1. Execute the test suite using the appropriate command
2. Analyze any failures carefully
3. Read relevant test and source files
4. Fix issues one at a time
5. Re-run tests to verify fixes
6. Provide a summary of what was fixed

Always run tests before and after making changes.
```

#### Documentation Generator

```yaml
---
name: doc-generator
description: Generate comprehensive documentation for code files and modules
tools: Read, Write, Glob, Grep
model: haiku
---

You are a technical documentation specialist. When generating docs:
1. Read and understand the code structure
2. Identify public APIs and interfaces
3. Document parameters, return values, and examples
4. Include usage examples
5. Follow the project's documentation style
6. Keep language clear and concise

Focus on what developers need to know to USE the code, not just what it does.
```

#### Security Auditor

```yaml
---
name: security-auditor
description: Review code for security vulnerabilities and best practices
tools: Read, Grep, Glob, WebSearch
model: sonnet
---

You are a security expert. When auditing code:
1. Check for common vulnerabilities (OWASP Top 10)
2. Verify input validation and sanitization
3. Review authentication and authorization
4. Check for exposed secrets or credentials
5. Verify secure communication (HTTPS, encryption)
6. Look for insecure dependencies
7. Provide specific remediation steps

Always cite security standards (OWASP, CWE) when identifying issues.
```

### Best Practices for Subagents

1. **Single Responsibility**: Design focused agents with one clear purpose
2. **Detailed Prompts**: Write comprehensive system prompts with specific guidance
3. **Minimal Tools**: Grant only necessary tool access for security and focus
4. **Generate First**: Let Claude create initial configuration, then customize
5. **Version Control**: Commit project-level agents to share with team
6. **Test Thoroughly**: Verify agent behavior on representative tasks
7. **Iterative Refinement**: Improve prompts based on actual results
8. **Clear Descriptions**: Help Claude know when to automatically invoke

---

## Task Management

Claude Code includes sophisticated task tracking to help manage complex, multi-step workflows.

### The TodoWrite Tool

The TodoWrite tool creates and manages a structured task list for your coding session.

**When to Use:**
- Complex multi-step tasks (3+ distinct steps)
- Non-trivial and complex tasks requiring careful planning
- User explicitly requests todo list
- User provides multiple tasks (numbered or comma-separated)
- After receiving new instructions
- When starting work on a task (mark as in_progress)
- After completing a task (mark as completed)

**When NOT to Use:**
- Single, straightforward tasks
- Trivial tasks providing no organizational benefit
- Tasks completable in less than 3 trivial steps
- Purely conversational or informational requests

### Task States

Each task has three possible states:

1. **pending**: Task not yet started
2. **in_progress**: Currently working on (limit to ONE at a time)
3. **completed**: Task finished successfully

### Task Format

Every task requires two forms:

```javascript
{
  "content": "Run the build",              // Imperative form (what needs to be done)
  "activeForm": "Running the build",      // Present continuous (shown during execution)
  "status": "in_progress"
}
```

### Task Management Best Practices

1. **Update in Real-Time**: Keep status current as you work
2. **Mark Complete Immediately**: Don't batch completions
3. **One Task Active**: Exactly ONE task should be in_progress at any time
4. **Complete Before Starting**: Finish current tasks before starting new ones
5. **Remove Irrelevant**: Delete tasks that are no longer needed
6. **Break Down Complex**: Split large tasks into smaller, manageable steps

### Task Completion Requirements

**ONLY mark a task completed when:**
- You have FULLY accomplished it
- All tests pass
- Implementation is complete
- No unresolved errors

**Keep as in_progress if:**
- Tests are failing
- Implementation is partial
- You encountered unresolved errors
- You couldn't find necessary files or dependencies

### Example Workflow

```bash
# User request: "Build a user authentication system"

# 1. Create todo list
TodoWrite([
  { content: "Research existing auth patterns in codebase",
    activeForm: "Researching existing auth patterns",
    status: "in_progress" },
  { content: "Design authentication schema",
    activeForm: "Designing authentication schema",
    status: "pending" },
  { content: "Implement login endpoint",
    activeForm: "Implementing login endpoint",
    status: "pending" },
  { content: "Implement registration endpoint",
    activeForm: "Implementing registration endpoint",
    status: "pending" },
  { content: "Add password hashing",
    activeForm: "Adding password hashing",
    status: "pending" },
  { content: "Create JWT token generation",
    activeForm: "Creating JWT token generation",
    status: "pending" },
  { content: "Write tests for authentication",
    activeForm: "Writing tests for authentication",
    status: "pending" },
  { content: "Update documentation",
    activeForm: "Updating documentation",
    status: "pending" }
])

# 2. Complete first task, mark as completed, start next
TodoWrite([
  { content: "Research existing auth patterns in codebase",
    activeForm: "Researching existing auth patterns",
    status: "completed" },
  { content: "Design authentication schema",
    activeForm: "Designing authentication schema",
    status: "in_progress" },
  // ... rest remain pending
])

# 3. Continue until all tasks completed
```

---

## Plan Mode

Plan mode enables safe code exploration through read-only analysis before making changes.

### What is Plan Mode?

Plan mode puts Claude in a "thinking first" state where it:
- Explores the codebase without making changes
- Analyzes architecture and patterns
- Identifies potential issues
- Formulates a comprehensive plan
- Presents the plan for your approval

### When to Use Plan Mode

1. **Complex Refactoring**: Understanding before changing
2. **New Codebase**: Learning structure and patterns
3. **Architectural Changes**: Planning system-wide modifications
4. **Risk Assessment**: Understanding potential impacts
5. **Debugging Complex Issues**: Tracing through multiple files

### How to Activate

Simply ask Claude to plan:

```bash
claude "Make a plan for adding user authentication"
claude "Plan how to refactor the database layer"
claude "Think through how to optimize this API"
```

### Plan Mode Workflow

1. **Exploration Phase**: Claude reads files, searches code, analyzes structure
2. **Analysis Phase**: Identifies patterns, dependencies, potential issues
3. **Planning Phase**: Formulates step-by-step approach
4. **Presentation Phase**: Shows you the plan for approval
5. **Execution Phase**: After approval, proceeds with implementation

### Example Plan Output

```markdown
## Plan for Adding User Authentication

### Current State
- No authentication system exists
- User model in src/models/user.js
- Express.js backend with SQLite database

### Proposed Changes

1. Install dependencies (jsonwebtoken, bcrypt)
2. Create authentication middleware
3. Add password hashing to user model
4. Implement login endpoint
5. Implement registration endpoint
6. Protect existing routes
7. Add token validation

### Potential Issues
- Need to migrate existing users (if any)
- Session management not addressed (phase 2)
- Rate limiting should be added for login attempts

### Testing Strategy
- Unit tests for auth functions
- Integration tests for endpoints
- Manual testing of protected routes
```

---

## Extended Thinking

Extended thinking allows Claude to spend more time breaking down problems, planning solutions, and exploring different approaches before responding.

### What is Extended Thinking?

Extended thinking gives Claude additional computation time to:
- Evaluate multiple approaches
- Consider edge cases
- Plan complex implementations
- Reason through difficult problems
- Make better architectural decisions

### Activating Extended Thinking

Use specific phrases to trigger thinking modes:

```bash
# Basic thinking
claude "think about how to optimize this database query"

# More thinking
claude "think hard about the best architecture for this feature"

# Maximum thinking
claude "think harder about edge cases in this algorithm"
claude "ultrathink about this complex problem"
```

**Thinking Levels:**
- `"think"` - Basic additional reasoning
- `"think hard"` - Moderate additional reasoning
- `"think harder"` - Significant additional reasoning
- `"ultrathink"` - Maximum reasoning time

### When to Use Extended Thinking

1. **Complex Algorithms**: Optimization problems, data structures
2. **Architecture Decisions**: System design, technology choices
3. **Edge Case Discovery**: Security, validation, error handling
4. **Refactoring Plans**: Large-scale code changes
5. **Performance Optimization**: Bottleneck analysis and solutions

### Recommended Workflow

For problems requiring deeper analysis:

```bash
# Step 1: Research
claude "Research how authentication is currently implemented"

# Step 2: Think
claude "Think hard about the best approach for adding OAuth"

# Step 3: Plan
claude "Make a detailed plan for implementing OAuth with Google"

# Step 4: Execute
claude "Implement the OAuth flow according to the plan"
```

### Interleaved Thinking

With Claude 4 models, thinking can happen between tool calls:

- Claude thinks after receiving tool results
- Makes more sophisticated reasoning about next steps
- Adjusts plan based on discoveries
- Provides better error recovery

This is automatically enabled in Claude Code's newer versions.

---

## Best Practices

### Combining Advanced Features

**For Large Features:**
1. Use extended thinking to evaluate approaches
2. Create a plan with plan mode
3. Break into tasks with TodoWrite
4. Use subagents for specialized work (tests, docs, reviews)
5. Track progress with todos

**Example Workflow:**
```bash
# Complex feature request
claude "Think hard about the best way to add real-time notifications"

# → Claude uses extended thinking
# → Creates a detailed architectural analysis

claude "Make a plan for implementing real-time notifications"

# → Claude enters plan mode
# → Explores codebase
# → Creates comprehensive plan
# → Presents for approval

# After approval, Claude:
# → Creates todo list with TodoWrite
# → Marks first task as in_progress
# → May delegate to subagents (e.g., websocket-expert)
# → Updates todos as it progresses
# → Uses test-runner subagent to verify
```

### Performance Optimization

1. **Use Haiku for Simple Tasks**: File reads, simple searches, quick validations
2. **Use Sonnet for Standard Work**: Most coding tasks, balanced performance
3. **Use Opus for Complex Problems**: Architectural decisions, complex algorithms
4. **Parallel Subagents**: Invoke multiple subagents simultaneously for independent tasks

### Cost Management

1. **Limit Context**: Use subagents to isolate work and reduce token usage
2. **Choose Right Model**: Don't use Opus when Haiku will suffice
3. **Clear Instructions**: Reduce back-and-forth with specific requests
4. **Reuse Subagents**: Create once, use across projects

### Security Considerations

1. **Minimal Tools**: Grant subagents only necessary tool access
2. **Review Plans**: Always review before approving complex changes
3. **Version Control**: Commit often when making changes
4. **Test Changes**: Use test-runner subagent to verify correctness
5. **Audit Agents**: Use security-auditor for sensitive code

### Team Collaboration

1. **Share Subagents**: Commit `.claude/agents/` to repository
2. **Document Agents**: Include clear descriptions and examples
3. **Standard Naming**: Use consistent naming conventions
4. **Test Together**: Verify agents work for all team members
5. **Iterate**: Improve agents based on team feedback

---

## Advanced Workflows

### Multi-Agent Research

Use multiple subagents in parallel to research different aspects:

```bash
claude "I need to research three different approaches: REST API, GraphQL, and gRPC.
Use three explore agents in parallel to research each approach in our codebase
and provide recommendations."
```

### Automated Code Review Pipeline

1. Create commit with changes
2. Invoke code-reviewer subagent
3. Invoke security-auditor subagent
4. Invoke test-runner subagent
5. Review all reports
6. Make fixes if needed
7. Create pull request

### Documentation Pipeline

1. Use doc-generator subagent on all public APIs
2. Use example-generator for code samples
3. Use test-runner to verify examples work
4. Compile into comprehensive docs

### Continuous Improvement

1. Run code-analyzer on codebase
2. Identify improvement opportunities
3. Create todos for each improvement
4. Use refactor-expert subagent for each
5. Run test-runner after each change
6. Track progress with todos

---

## Further Reading

- [Official Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Building Agents with Claude](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Extended Thinking Guide](https://docs.claude.com/en/docs/build-with-claude/extended-thinking)

---

**Remember**: These advanced features are tools to help you build better software faster. Start simple, experiment, and gradually incorporate more sophisticated workflows as you become comfortable with each feature.
