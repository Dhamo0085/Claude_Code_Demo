// Advanced In-Memory Database for Discord Clone
class DiscordDatabase {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.servers = [];
        this.channels = [];
        this.messages = [];
        this.directMessages = [];
        this.reactions = [];
        this.initializeSampleData();
    }

    initializeSampleData() {
        // Create users
        this.users = [
            {
                id: 1,
                username: 'CodeMaster',
                tag: '1234',
                avatar: '👨‍💻',
                status: 'online',
                customStatus: 'Building cool stuff',
                bio: 'Full-stack developer | Coffee enthusiast'
            },
            {
                id: 2,
                username: 'DesignQueen',
                tag: '5678',
                avatar: '👩‍🎨',
                status: 'online',
                customStatus: 'Designing the future',
                bio: 'UI/UX Designer | Figma expert'
            },
            {
                id: 3,
                username: 'DataNinja',
                tag: '9012',
                avatar: '🥷',
                status: 'idle',
                customStatus: 'Crunching numbers',
                bio: 'Data Scientist | ML enthusiast'
            },
            {
                id: 4,
                username: 'DevOpsGuru',
                tag: '3456',
                avatar: '⚙️',
                status: 'online',
                customStatus: 'Deploying to prod',
                bio: 'DevOps Engineer | Kubernetes wizard'
            },
            {
                id: 5,
                username: 'ProductPro',
                tag: '7890',
                avatar: '📊',
                status: 'offline',
                customStatus: '',
                bio: 'Product Manager | User advocate'
            },
            {
                id: 6,
                username: 'SecuritySam',
                tag: '2468',
                avatar: '🔒',
                status: 'dnd',
                customStatus: 'Do not disturb',
                bio: 'Security Engineer | Bug bounty hunter'
            }
        ];

        // Set current user
        this.currentUser = this.users[0];

        // Create servers
        this.servers = [
            {
                id: 1,
                name: 'Web Dev Community',
                icon: '💻',
                owner: 1,
                members: [1, 2, 3, 4, 5],
                createdAt: new Date('2024-01-15')
            },
            {
                id: 2,
                name: 'Design Systems',
                icon: '🎨',
                owner: 2,
                members: [1, 2, 3],
                createdAt: new Date('2024-02-20')
            },
            {
                id: 3,
                name: 'AI & Machine Learning',
                icon: '🤖',
                owner: 3,
                members: [1, 3, 4, 6],
                createdAt: new Date('2024-03-10')
            },
            {
                id: 4,
                name: 'Startup Founders',
                icon: '🚀',
                owner: 5,
                members: [1, 2, 3, 4, 5],
                createdAt: new Date('2024-04-01')
            }
        ];

        // Create channels
        this.channels = [
            // Web Dev Community channels
            { id: 1, serverId: 1, name: 'general', type: 'text', position: 0 },
            { id: 2, serverId: 1, name: 'javascript', type: 'text', position: 1 },
            { id: 3, serverId: 1, name: 'react', type: 'text', position: 2 },
            { id: 4, serverId: 1, name: 'career-advice', type: 'text', position: 3 },
            { id: 5, serverId: 1, name: 'code-review', type: 'text', position: 4 },

            // Design Systems channels
            { id: 6, serverId: 2, name: 'general', type: 'text', position: 0 },
            { id: 7, serverId: 2, name: 'figma-tips', type: 'text', position: 1 },
            { id: 8, serverId: 2, name: 'inspiration', type: 'text', position: 2 },

            // AI & ML channels
            { id: 9, serverId: 3, name: 'general', type: 'text', position: 0 },
            { id: 10, serverId: 3, name: 'papers', type: 'text', position: 1 },
            { id: 11, serverId: 3, name: 'projects', type: 'text', position: 2 },
            { id: 12, serverId: 3, name: 'resources', type: 'text', position: 3 },

            // Startup Founders channels
            { id: 13, serverId: 4, name: 'general', type: 'text', position: 0 },
            { id: 14, serverId: 4, name: 'funding', type: 'text', position: 1 },
            { id: 15, serverId: 4, name: 'growth-hacking', type: 'text', position: 2 }
        ];

        // Create sample messages
        this.messages = [
            // Web Dev Community - general
            {
                id: 1,
                channelId: 1,
                authorId: 2,
                content: 'Hey everyone! Just joined this server. Excited to connect with fellow devs!',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                edited: false
            },
            {
                id: 2,
                channelId: 1,
                authorId: 1,
                content: 'Welcome @DesignQueen! Feel free to introduce yourself in detail.',
                timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
                edited: false
            },
            {
                id: 3,
                channelId: 1,
                authorId: 4,
                content: 'Has anyone tried the new React 19 features? The compiler looks amazing!',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                edited: false
            },
            {
                id: 4,
                channelId: 1,
                authorId: 3,
                content: 'Yeah! The automatic memoization is a game changer. No more useMemo everywhere.',
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
                edited: false
            },

            // Web Dev Community - javascript
            {
                id: 5,
                channelId: 2,
                authorId: 1,
                content: 'Quick question: What\'s your preferred way to handle async errors in JavaScript?',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                edited: false
            },
            {
                id: 6,
                channelId: 2,
                authorId: 4,
                content: 'I usually use try-catch blocks with async/await. Much cleaner than .catch()',
                timestamp: new Date(Date.now() - 25 * 60 * 1000),
                edited: false
            },
            {
                id: 7,
                channelId: 2,
                authorId: 2,
                content: 'Same here! Plus you can wrap multiple awaits in one try block.',
                timestamp: new Date(Date.now() - 20 * 60 * 1000),
                edited: false
            },

            // Web Dev Community - react
            {
                id: 8,
                channelId: 3,
                authorId: 1,
                content: 'Anyone building anything cool with Next.js 15?',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                edited: false
            },
            {
                id: 9,
                channelId: 3,
                authorId: 2,
                content: 'Working on a SaaS dashboard. The new partial prerendering is incredible for performance!',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                edited: false
            },

            // Design Systems - general
            {
                id: 10,
                channelId: 6,
                authorId: 2,
                content: 'Welcome to Design Systems! This is where we discuss component libraries, design tokens, and everything design systems.',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                edited: false
            },
            {
                id: 11,
                channelId: 6,
                authorId: 1,
                content: 'Love the focus! Been wanting to learn more about systematic design approaches.',
                timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
                edited: false
            },

            // AI & ML - general
            {
                id: 12,
                channelId: 9,
                authorId: 3,
                content: 'Just published a new tutorial on fine-tuning LLMs. Check it out!',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                edited: false
            },
            {
                id: 13,
                channelId: 9,
                authorId: 6,
                content: 'This is exactly what I needed! Thanks for sharing.',
                timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
                edited: false
            },

            // Startup Founders - general
            {
                id: 14,
                channelId: 13,
                authorId: 5,
                content: 'Morning everyone! What are you all working on this week?',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                edited: false
            },
            {
                id: 15,
                channelId: 13,
                authorId: 1,
                content: 'Launching our MVP this Friday! Super nervous but excited.',
                timestamp: new Date(Date.now() - 3 * 60 * 1000),
                edited: false
            },
            {
                id: 16,
                channelId: 13,
                authorId: 2,
                content: 'That\'s awesome! You got this! 🚀',
                timestamp: new Date(Date.now() - 1 * 60 * 1000),
                edited: false
            }
        ];

        // Sample direct messages
        this.directMessages = [
            {
                id: 1,
                participants: [1, 2],
                messages: [
                    {
                        id: 1,
                        authorId: 2,
                        content: 'Hey! Saw your message in the React channel. Want to collaborate on a project?',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                    },
                    {
                        id: 2,
                        authorId: 1,
                        content: 'Absolutely! What did you have in mind?',
                        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
                    },
                    {
                        id: 3,
                        authorId: 2,
                        content: 'I\'m building a design system library. Could use some React expertise!',
                        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                    }
                ]
            },
            {
                id: 2,
                participants: [1, 3],
                messages: [
                    {
                        id: 4,
                        authorId: 3,
                        content: 'Quick question about that API endpoint you built...',
                        timestamp: new Date(Date.now() - 30 * 60 * 1000)
                    },
                    {
                        id: 5,
                        authorId: 1,
                        content: 'Sure, what\'s up?',
                        timestamp: new Date(Date.now() - 28 * 60 * 1000)
                    }
                ]
            }
        ];

        // Sample reactions
        this.reactions = [
            { messageId: 3, emoji: '👍', userIds: [1, 2, 3] },
            { messageId: 4, emoji: '🔥', userIds: [1, 4] },
            { messageId: 15, emoji: '🚀', userIds: [2, 3, 4, 5] },
            { messageId: 16, emoji: '❤️', userIds: [1, 3, 4] }
        ];
    }

    // User methods
    getCurrentUser() {
        return this.currentUser;
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    getAllUsers() {
        return this.users;
    }

    updateUserStatus(userId, status) {
        const user = this.getUserById(userId);
        if (user) {
            user.status = status;
        }
    }

    // Server methods
    getAllServers() {
        return this.servers.filter(s => s.members.includes(this.currentUser.id));
    }

    getServerById(id) {
        return this.servers.find(s => s.id === id);
    }

    createServer(name, icon) {
        const server = {
            id: Date.now(),
            name,
            icon: icon || '🎮',
            owner: this.currentUser.id,
            members: [this.currentUser.id],
            createdAt: new Date()
        };
        this.servers.push(server);

        // Create default general channel
        this.createChannel(server.id, 'general');

        return server;
    }

    getServerMembers(serverId) {
        const server = this.getServerById(serverId);
        if (!server) return [];
        return server.members.map(userId => this.getUserById(userId)).filter(u => u);
    }

    // Channel methods
    getChannelsByServer(serverId) {
        return this.channels
            .filter(c => c.serverId === serverId)
            .sort((a, b) => a.position - b.position);
    }

    getChannelById(id) {
        return this.channels.find(c => c.id === id);
    }

    createChannel(serverId, name) {
        const serverChannels = this.getChannelsByServer(serverId);
        const channel = {
            id: Date.now(),
            serverId,
            name,
            type: 'text',
            position: serverChannels.length,
            createdAt: new Date()
        };
        this.channels.push(channel);
        return channel;
    }

    // Message methods
    getMessagesByChannel(channelId) {
        return this.messages
            .filter(m => m.channelId === channelId)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    sendMessage(channelId, content) {
        const message = {
            id: Date.now(),
            channelId,
            authorId: this.currentUser.id,
            content,
            timestamp: new Date(),
            edited: false
        };
        this.messages.push(message);
        return message;
    }

    editMessage(messageId, newContent) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && message.authorId === this.currentUser.id) {
            message.content = newContent;
            message.edited = true;
            return message;
        }
        return null;
    }

    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1 && this.messages[index].authorId === this.currentUser.id) {
            this.messages.splice(index, 1);
            return true;
        }
        return false;
    }

    // Direct message methods
    getDMConversations() {
        return this.directMessages.filter(dm =>
            dm.participants.includes(this.currentUser.id)
        );
    }

    getDMWithUser(userId) {
        return this.directMessages.find(dm =>
            dm.participants.includes(this.currentUser.id) &&
            dm.participants.includes(userId)
        );
    }

    sendDirectMessage(recipientId, content) {
        let conversation = this.getDMWithUser(recipientId);

        if (!conversation) {
            conversation = {
                id: Date.now(),
                participants: [this.currentUser.id, recipientId],
                messages: []
            };
            this.directMessages.push(conversation);
        }

        const message = {
            id: Date.now(),
            authorId: this.currentUser.id,
            content,
            timestamp: new Date()
        };

        conversation.messages.push(message);
        return message;
    }

    // Reaction methods
    addReaction(messageId, emoji) {
        let reaction = this.reactions.find(r => r.messageId === messageId && r.emoji === emoji);

        if (!reaction) {
            reaction = {
                messageId,
                emoji,
                userIds: []
            };
            this.reactions.push(reaction);
        }

        if (!reaction.userIds.includes(this.currentUser.id)) {
            reaction.userIds.push(this.currentUser.id);
        }

        return reaction;
    }

    removeReaction(messageId, emoji) {
        const reaction = this.reactions.find(r => r.messageId === messageId && r.emoji === emoji);
        if (reaction) {
            reaction.userIds = reaction.userIds.filter(id => id !== this.currentUser.id);
            if (reaction.userIds.length === 0) {
                const index = this.reactions.indexOf(reaction);
                this.reactions.splice(index, 1);
            }
        }
    }

    getReactionsForMessage(messageId) {
        return this.reactions.filter(r => r.messageId === messageId);
    }
}

// Initialize database
const db = new DiscordDatabase();
