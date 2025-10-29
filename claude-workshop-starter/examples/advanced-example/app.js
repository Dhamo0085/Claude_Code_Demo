// Discord Clone Application Logic
class DiscordApp {
    constructor() {
        this.currentServer = null;
        this.currentChannel = null;
        this.currentDM = null;
        this.selectedIcon = '🎮';
        this.currentEmojiTarget = null;
        this.init();
    }

    init() {
        // Load initial data
        this.renderUserPanel();
        this.renderServers();

        // Auto-select first server and channel
        const servers = db.getAllServers();
        if (servers.length > 0) {
            this.selectServer(servers[0].id);
        }
    }

    // ===== User Panel =====
    renderUserPanel() {
        const user = db.getCurrentUser();
        document.getElementById('userAvatar').textContent = user.avatar;
        document.getElementById('username').textContent = user.username;
        document.getElementById('userTag').textContent = `#${user.tag}`;

        // Add status indicator
        const avatar = document.getElementById('userAvatar');
        const existingIndicator = avatar.querySelector('.status-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        const indicator = document.createElement('div');
        indicator.className = `status-indicator ${user.status}`;
        avatar.appendChild(indicator);
    }

    // ===== Server Management =====
    renderServers() {
        const servers = db.getAllServers();
        const serversList = document.getElementById('serversList');

        serversList.innerHTML = servers.map(server => `
            <div class="server-item ${this.currentServer === server.id ? 'active' : ''}"
                 onclick="app.selectServer(${server.id})"
                 title="${server.name}">
                <div class="server-icon">${server.icon}</div>
            </div>
        `).join('');
    }

    selectServer(serverId) {
        this.currentServer = serverId;
        this.currentDM = null;
        const server = db.getServerById(serverId);

        // Update server header
        document.getElementById('serverName').textContent = server.name;

        // Render channels
        this.renderChannels();

        // Render servers (to update active state)
        this.renderServers();

        // Auto-select first channel
        const channels = db.getChannelsByServer(serverId);
        if (channels.length > 0) {
            this.selectChannel(channels[0].id);
        }

        // Render members
        this.renderMembers();
    }

    // ===== Channel Management =====
    renderChannels() {
        if (!this.currentServer) return;

        const channels = db.getChannelsByServer(this.currentServer);
        const channelsList = document.getElementById('channelsList');

        let html = `
            <div class="channel-category">
                <span>TEXT CHANNELS</span>
                <button class="add-channel-btn" onclick="app.showCreateChannelModal()">+</button>
            </div>
        `;

        html += channels.map(channel => `
            <div class="channel-item ${this.currentChannel === channel.id ? 'active' : ''}"
                 onclick="app.selectChannel(${channel.id})">
                <span class="channel-icon">#</span>
                <span class="channel-name">${channel.name}</span>
            </div>
        `).join('');

        // Add DM section
        html += `<div class="dm-section">`;
        html += `<div class="channel-category"><span>DIRECT MESSAGES</span></div>`;

        const dmConversations = db.getDMConversations();
        const currentUser = db.getCurrentUser();

        dmConversations.forEach(dm => {
            const otherUserId = dm.participants.find(id => id !== currentUser.id);
            const otherUser = db.getUserById(otherUserId);

            html += `
                <div class="dm-item ${this.currentDM === dm.id ? 'active' : ''}"
                     onclick="app.selectDM(${dm.id})">
                    <div class="dm-avatar">
                        ${otherUser.avatar}
                        <div class="status-indicator ${otherUser.status}"></div>
                    </div>
                    <div class="dm-username">${otherUser.username}</div>
                </div>
            `;
        });

        html += `</div>`;

        channelsList.innerHTML = html;
    }

    selectChannel(channelId) {
        this.currentChannel = channelId;
        this.currentDM = null;
        const channel = db.getChannelById(channelId);

        // Update channel header
        document.getElementById('currentChannelName').textContent = channel.name;

        // Update placeholder
        document.getElementById('messageInput').placeholder = `Message #${channel.name}`;

        // Render channels (to update active state)
        this.renderChannels();

        // Render messages
        this.renderMessages();
    }

    // ===== Direct Messages =====
    selectDM(dmId) {
        this.currentDM = dmId;
        this.currentChannel = null;

        const dm = db.directMessages.find(d => d.id === dmId);
        const currentUser = db.getCurrentUser();
        const otherUserId = dm.participants.find(id => id !== currentUser.id);
        const otherUser = db.getUserById(otherUserId);

        // Update channel header
        document.getElementById('currentChannelName').textContent = `@${otherUser.username}`;

        // Update placeholder
        document.getElementById('messageInput').placeholder = `Message @${otherUser.username}`;

        // Render channels (to update active state)
        this.renderChannels();

        // Render DM messages
        this.renderDMMessages(dm);
    }

    renderDMMessages(dm) {
        const messagesList = document.getElementById('messagesList');

        if (dm.messages.length === 0) {
            messagesList.innerHTML = `
                <div class="welcome-screen">
                    <h2>Start your conversation!</h2>
                    <p>This is the beginning of your direct message history.</p>
                </div>
            `;
            return;
        }

        messagesList.innerHTML = dm.messages.map(message => {
            const author = db.getUserById(message.authorId);
            return this.renderMessageHTML(message, author);
        }).join('');

        this.scrollToBottom();
    }

    sendDirectMessage() {
        // Get the currently viewed user from profile modal
        const profileUsername = document.getElementById('profileUsername').textContent;
        const recipient = db.getAllUsers().find(u => u.username === profileUsername);

        if (recipient) {
            // Create or get existing DM conversation
            let dm = db.getDMWithUser(recipient.id);
            if (!dm) {
                db.sendDirectMessage(recipient.id, 'Hey! 👋');
                dm = db.getDMWithUser(recipient.id);
            }

            this.closeUserProfileModal();
            this.selectDM(dm.id);
        }
    }

    // ===== Message Management =====
    renderMessages() {
        if (!this.currentChannel) return;

        const messages = db.getMessagesByChannel(this.currentChannel);
        const messagesList = document.getElementById('messagesList');

        if (messages.length === 0) {
            const channel = db.getChannelById(this.currentChannel);
            messagesList.innerHTML = `
                <div class="welcome-screen">
                    <h2>Welcome to #${channel.name}!</h2>
                    <p>This is the start of the #${channel.name} channel.</p>
                </div>
            `;
            return;
        }

        messagesList.innerHTML = messages.map(message => {
            const author = db.getUserById(message.authorId);
            return this.renderMessageHTML(message, author);
        }).join('');

        this.scrollToBottom();
    }

    renderMessageHTML(message, author) {
        const reactions = db.getReactionsForMessage(message.id);
        const currentUser = db.getCurrentUser();

        let reactionsHTML = '';
        if (reactions.length > 0) {
            reactionsHTML = `
                <div class="message-reactions">
                    ${reactions.map(reaction => {
                        const hasReacted = reaction.userIds.includes(currentUser.id);
                        return `
                            <div class="reaction ${hasReacted ? 'reacted' : ''}"
                                 onclick="app.toggleReaction(${message.id}, '${reaction.emoji}')">
                                <span>${reaction.emoji}</span>
                                <span class="reaction-count">${reaction.userIds.length}</span>
                            </div>
                        `;
                    }).join('')}
                    <div class="reaction" onclick="app.showEmojiPickerForMessage(${message.id})">
                        <span>➕</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="message" data-message-id="${message.id}">
                <div class="message-avatar">${author.avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${author.username}</span>
                        <span class="message-timestamp">${this.formatTimestamp(message.timestamp)}</span>
                        ${message.edited ? '<span class="message-timestamp">(edited)</span>' : ''}
                    </div>
                    <div class="message-text">${this.formatMessageContent(message.content)}</div>
                    ${reactionsHTML}
                </div>
            </div>
        `;
    }

    formatMessageContent(content) {
        // Convert @mentions to highlighted text
        content = content.replace(/@(\w+)/g, '<span style="color: var(--brand-color); background: rgba(88,101,242,0.1); padding: 0 2px; border-radius: 3px;">@$1</span>');

        // Convert URLs to links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--text-link);">$1</a>');

        return content;
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - messageTime) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return messageTime.toLocaleDateString('en-US', options);
    }

    handleMessageKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();

        if (!content) return;

        if (this.currentChannel) {
            // Send channel message
            db.sendMessage(this.currentChannel, content);
            this.renderMessages();
        } else if (this.currentDM) {
            // Send DM
            const dm = db.directMessages.find(d => d.id === this.currentDM);
            const currentUser = db.getCurrentUser();
            const otherUserId = dm.participants.find(id => id !== currentUser.id);
            db.sendDirectMessage(otherUserId, content);
            this.renderDMMessages(dm);
        }

        input.value = '';
    }

    scrollToBottom() {
        const container = document.querySelector('.messages-container');
        container.scrollTop = container.scrollHeight;
    }

    // ===== Reactions =====
    toggleReaction(messageId, emoji) {
        const currentUser = db.getCurrentUser();
        const reaction = db.getReactionsForMessage(messageId).find(r => r.emoji === emoji);

        if (reaction && reaction.userIds.includes(currentUser.id)) {
            db.removeReaction(messageId, emoji);
        } else {
            db.addReaction(messageId, emoji);
        }

        if (this.currentChannel) {
            this.renderMessages();
        } else if (this.currentDM) {
            const dm = db.directMessages.find(d => d.id === this.currentDM);
            this.renderDMMessages(dm);
        }
    }

    showEmojiPickerForMessage(messageId) {
        this.currentEmojiTarget = messageId;
        document.getElementById('emojiPickerModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    showEmojiPicker() {
        this.currentEmojiTarget = 'input';
        document.getElementById('emojiPickerModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    addEmoji(emoji) {
        if (this.currentEmojiTarget === 'input') {
            // Add to message input
            const input = document.getElementById('messageInput');
            input.value += emoji;
            input.focus();
        } else {
            // Add as reaction
            db.addReaction(this.currentEmojiTarget, emoji);
            if (this.currentChannel) {
                this.renderMessages();
            } else if (this.currentDM) {
                const dm = db.directMessages.find(d => d.id === this.currentDM);
                this.renderDMMessages(dm);
            }
        }

        this.closeEmojiPickerModal();
    }

    // ===== Members List =====
    renderMembers() {
        if (!this.currentServer) return;

        const members = db.getServerMembers(this.currentServer);
        const membersList = document.getElementById('membersList');

        // Group by status
        const online = members.filter(m => m.status === 'online');
        const idle = members.filter(m => m.status === 'idle');
        const dnd = members.filter(m => m.status === 'dnd');
        const offline = members.filter(m => m.status === 'offline');

        let html = '';

        if (online.length > 0) {
            html += this.renderMemberGroup('Online', online);
        }
        if (idle.length > 0) {
            html += this.renderMemberGroup('Idle', idle);
        }
        if (dnd.length > 0) {
            html += this.renderMemberGroup('Do Not Disturb', dnd);
        }
        if (offline.length > 0) {
            html += this.renderMemberGroup('Offline', offline);
        }

        membersList.innerHTML = html;
    }

    renderMemberGroup(label, members) {
        return `
            <div class="members-group">
                <div class="members-group-label">${label} — ${members.length}</div>
                ${members.map(member => `
                    <div class="member-item" onclick="app.showUserProfileFor(${member.id})">
                        <div class="member-avatar">
                            ${member.avatar}
                            <div class="status-indicator ${member.status}"></div>
                        </div>
                        <div class="member-name">${member.username}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    toggleMembersList() {
        const sidebar = document.getElementById('membersSidebar');
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }

    // ===== Modals =====
    showAddServerModal() {
        document.getElementById('createServerModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    closeCreateServerModal() {
        document.getElementById('createServerModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    selectIcon(icon) {
        this.selectedIcon = icon;
        document.getElementById('selectedIcon').textContent = icon;

        // Update selected state
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    createServer() {
        const nameInput = document.getElementById('serverNameInput');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a server name!');
            return;
        }

        const server = db.createServer(name, this.selectedIcon);
        this.renderServers();
        this.selectServer(server.id);

        nameInput.value = '';
        this.closeCreateServerModal();
    }

    showCreateChannelModal() {
        if (!this.currentServer) return;
        document.getElementById('createChannelModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    closeCreateChannelModal() {
        document.getElementById('createChannelModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    createChannel() {
        const nameInput = document.getElementById('channelNameInput');
        let name = nameInput.value.trim().toLowerCase();

        if (!name) {
            alert('Please enter a channel name!');
            return;
        }

        // Remove spaces and special characters
        name = name.replace(/[^a-z0-9-]/g, '-');

        const channel = db.createChannel(this.currentServer, name);
        this.renderChannels();
        this.selectChannel(channel.id);

        nameInput.value = '';
        this.closeCreateChannelModal();
    }

    showUserProfile() {
        const user = db.getCurrentUser();
        this.showUserProfileFor(user.id);
    }

    showUserProfileFor(userId) {
        const user = db.getUserById(userId);

        document.getElementById('profileAvatar').textContent = user.avatar;
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileTag').textContent = `#${user.tag}`;
        document.getElementById('profileStatus').textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);
        document.getElementById('profileCustomStatus').textContent = user.customStatus || 'No custom status';
        document.getElementById('profileBio').textContent = user.bio || 'No bio yet';

        // Update status indicator
        const statusContainer = document.querySelector('.profile-status .status-indicator');
        if (statusContainer) {
            statusContainer.className = `status-indicator ${user.status}`;
        }

        document.getElementById('userProfileModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    closeUserProfileModal() {
        document.getElementById('userProfileModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    closeEmojiPickerModal() {
        document.getElementById('emojiPickerModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    closeAllModals() {
        this.closeCreateServerModal();
        this.closeCreateChannelModal();
        this.closeUserProfileModal();
        this.closeEmojiPickerModal();
    }

    // ===== Home Screen =====
    showHomeScreen() {
        this.currentServer = null;
        this.currentChannel = null;
        this.currentDM = null;

        document.getElementById('serverName').textContent = 'Home';
        document.getElementById('currentChannelName').textContent = 'Friends';

        // Show DMs in channels list
        const channelsList = document.getElementById('channelsList');
        const dmConversations = db.getDMConversations();
        const currentUser = db.getCurrentUser();

        let html = `<div class="channel-category"><span>DIRECT MESSAGES</span></div>`;

        dmConversations.forEach(dm => {
            const otherUserId = dm.participants.find(id => id !== currentUser.id);
            const otherUser = db.getUserById(otherUserId);

            html += `
                <div class="dm-item ${this.currentDM === dm.id ? 'active' : ''}"
                     onclick="app.selectDM(${dm.id})">
                    <div class="dm-avatar">
                        ${otherUser.avatar}
                        <div class="status-indicator ${otherUser.status}"></div>
                    </div>
                    <div class="dm-username">${otherUser.username}</div>
                </div>
            `;
        });

        channelsList.innerHTML = html;

        // Clear messages
        document.getElementById('messagesList').innerHTML = `
            <div class="welcome-screen">
                <h2>Welcome to Discord Clone!</h2>
                <p>Select a direct message or join a server to start chatting.</p>
            </div>
        `;

        // Hide members sidebar
        document.getElementById('membersList').innerHTML = '';

        // Render servers (to clear active state)
        this.renderServers();
    }

    // ===== Other Features =====
    showServerOptions() {
        alert('Server settings coming soon!');
    }

    toggleMute() {
        alert('Mute toggled!');
    }

    toggleDeafen() {
        alert('Deafen toggled!');
    }

    showSettings() {
        alert('Settings coming soon!');
    }
}

// Initialize app
const app = new DiscordApp();
