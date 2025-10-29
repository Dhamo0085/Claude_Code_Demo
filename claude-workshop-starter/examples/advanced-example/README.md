# Discord Clone - Advanced Example

A fully functional Discord-like chat application built with vanilla JavaScript. Features real-time messaging, server/channel management, direct messages, user presence, emoji reactions, and more.

## 🚀 Features

### Core Functionality
- **Multi-Server Support** - Join and switch between multiple servers
- **Channel System** - Text channels organized within servers
- **Real-Time Messaging** - Send and receive messages instantly
- **Direct Messages** - Private conversations with other users
- **User Presence** - Online, Idle, DND, and Offline status indicators
- **Member List** - See who's in your server, organized by status
- **Emoji Reactions** - React to messages with emojis
- **Message Formatting** - @mentions and URL auto-linking

### Server Management
- **Create Servers** - Build your own community with custom name and icon
- **Create Channels** - Add new text channels to your servers
- **Server Switching** - Instantly switch between servers in the sidebar
- **Member Roster** - View all members and their online status

### User Features
- **User Profiles** - View detailed profiles with bio and custom status
- **Status System** - Four status types (online, idle, dnd, offline)
- **Custom Status Messages** - Set a custom status message
- **Avatar System** - Emoji-based avatars for quick identification

### UI/UX
- **Discord-Accurate Design** - Matches Discord's color scheme and layout
- **3-Column Layout** - Servers → Channels → Chat → Members
- **Smooth Animations** - Polished transitions and hover effects
- **Responsive Design** - Works on desktop and mobile
- **Dark Theme** - Easy on the eyes for long chat sessions

## 📁 File Structure

```
advanced-example/
├── index.html      # Main HTML structure with 3-column layout
├── styles.css      # Discord-themed styles with authentic colors
├── database.js     # In-memory database with sample data
├── app.js          # Application logic and UI rendering
└── README.md       # This file
```

## 🎯 Pre-Loaded Demo Data

The app comes with realistic sample data to demonstrate all features:

### Servers (4)
1. **Web Dev Community** 💻 - 5 channels, 5 members
2. **Design Systems** 🎨 - 3 channels, 3 members
3. **AI & Machine Learning** 🤖 - 4 channels, 4 members
4. **Startup Founders** 🚀 - 3 channels, 5 members

### Users (6)
- **CodeMaster** 👨‍💻 (You) - Online, "Building cool stuff"
- **DesignQueen** 👩‍🎨 - Online, "Designing the future"
- **DataNinja** 🥷 - Idle, "Crunching numbers"
- **DevOpsGuru** ⚙️ - Online, "Deploying to prod"
- **ProductPro** 📊 - Offline
- **SecuritySam** 🔒 - DND, "Do not disturb"

### Messages
- 16 pre-loaded messages across different channels
- Realistic conversations about tech topics
- Messages with reactions and timestamps

### Direct Messages
- 2 active DM conversations
- 5 messages in DM history

## 🎮 How to Use

### Getting Started
1. Open `index.html` in your browser
2. You'll see 4 servers in the left sidebar
3. The first server (Web Dev Community) is auto-selected

### Basic Navigation
- **Switch Servers** - Click server icons in the left sidebar
- **Change Channels** - Click channel names in the middle sidebar
- **View Members** - See members list on the right sidebar
- **Home Button** - Click 🏠 at top to view direct messages

### Sending Messages
1. Type in the message box at the bottom
2. Press Enter to send
3. Messages appear instantly in the chat
4. @mention users with `@username`
5. URLs are automatically converted to links

### Creating Servers
1. Click the `+` button in the server sidebar
2. Choose an icon from the picker
3. Enter a server name
4. Click "Create Server"
5. A default #general channel is created automatically

### Creating Channels
1. Select a server
2. Click the `+` button next to "TEXT CHANNELS"
3. Enter a channel name (auto-formatted with dashes)
4. Click "Create Channel"

### Direct Messages
1. Click the 🏠 Home button
2. See your DM conversations in the middle sidebar
3. Click a DM to open the conversation
4. Or click a member → View Profile → Send Message

### Reactions
1. Hover over a message
2. Click the `➕` button next to existing reactions
3. Select an emoji from the picker
4. Click an existing reaction to toggle it

### User Profiles
1. Click any username in the chat
2. Or click a member in the members list
3. Or click your own avatar at the bottom
4. View their profile, status, and bio
5. Click "Send Message" to start a DM

## 🎨 Color Palette (Discord-Accurate)

```css
--bg-primary: #36393f      /* Main content background */
--bg-secondary: #2f3136    /* Sidebars background */
--bg-tertiary: #202225     /* Server list background */
--brand-color: #5865f2     /* Discord blurple */
--status-online: #43b581   /* Online green */
--status-idle: #faa61a     /* Idle yellow */
--status-dnd: #f04747      /* DND red */
```

## 🔧 Technical Details

### Architecture
- **Vanilla JavaScript** - No frameworks, just pure JS
- **In-Memory Database** - All data stored in JavaScript objects
- **Event-Driven** - Click handlers and keyboard events
- **Component-Based** - Modular rendering functions

### Database Schema
```javascript
Users {
  id, username, tag, avatar, status,
  customStatus, bio
}

Servers {
  id, name, icon, owner, members[], createdAt
}

Channels {
  id, serverId, name, type, position
}

Messages {
  id, channelId, authorId, content,
  timestamp, edited
}

DirectMessages {
  id, participants[], messages[]
}

Reactions {
  messageId, emoji, userIds[]
}
```

### Key Functions
- `selectServer(id)` - Switch to a server
- `selectChannel(id)` - Switch to a channel
- `sendMessage()` - Send a message
- `renderMessages()` - Display messages
- `addReaction()` - React to a message
- `createServer()` - Create new server
- `createChannel()` - Create new channel

## 🎯 Demo Scenarios

### Scenario 1: Join a Community
1. Click "Web Dev Community" server
2. Explore the #javascript and #react channels
3. Read existing conversations
4. Send a message asking a question

### Scenario 2: Start a Project Server
1. Click the `+` button to create a server
2. Choose 🚀 icon and name it "My Startup"
3. Create channels: #general, #product, #engineering
4. Start planning your project

### Scenario 3: Have a Private Chat
1. Click the 🏠 Home button
2. Click an existing DM conversation
3. Or click a member → Send Message
4. Have a private conversation

### Scenario 4: Engage with Messages
1. Browse messages in any channel
2. Add reactions (👍 ❤️ 🔥) to messages
3. @mention other users
4. Share links that auto-format

## 🚀 Future Enhancements

Want to extend this? Here are ideas:

### Phase 2 Features
- Voice channels and calls
- Video chat integration
- File uploads and sharing
- Message editing and deletion
- Server roles and permissions
- Channel categories
- Server settings panel
- User settings and themes

### Technical Improvements
- Persistent storage (localStorage)
- Real backend (Node.js + Socket.io)
- Database (MongoDB/PostgreSQL)
- Authentication system
- Real-time sync across tabs
- Message search
- Notifications system

### UI Enhancements
- Server discovery page
- Gif picker integration
- Code syntax highlighting
- Message threads
- Pinned messages
- Server boosting UI
- Rich embeds for links

## 📊 Statistics

- **Lines of Code**: ~2,500
- **Files**: 4 (HTML, CSS, JS, DB)
- **Pre-loaded Data**:
  - 4 servers
  - 15 channels
  - 6 users
  - 16 messages
  - 2 DM conversations
  - 4 reaction sets
- **Features**: 20+ implemented

## 🎓 Learning Points

This example demonstrates:
1. **Complex State Management** - Managing servers, channels, messages
2. **Component Rendering** - Dynamic UI updates
3. **Modal Systems** - Multiple overlay modals
4. **Data Relationships** - Users, servers, channels, messages
5. **UI/UX Patterns** - Discord's proven interaction patterns
6. **Real-time Feel** - Instant updates despite no backend
7. **Scalable Architecture** - Easy to extend and modify

## 🐛 Known Limitations

- No persistence (refresh clears data)
- No real-time updates (single user only)
- No message editing/deleting
- No file uploads
- No voice/video
- Simplified permission system
- No server invites

## 📝 License

This is a demo project for educational purposes. Discord and its design are property of Discord Inc.

---

**Ready to chat!** Open `index.html` and explore a fully functional Discord clone. 💬
