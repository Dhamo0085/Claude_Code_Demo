// In-memory database for ProductLaunch
class Database {
    constructor() {
        this.products = [];
        this.comments = [];
        this.upvotes = new Set(); // Track which products have been upvoted
        this.initializeSampleData();
    }

    initializeSampleData() {
        // Sample products with realistic data
        const sampleProducts = [
            {
                id: 1,
                name: 'Claude Code',
                tagline: 'AI pair programmer that works in your terminal',
                description: 'Claude Code is an AI-powered coding assistant that lives right in your terminal. It can read your entire codebase, make complex edits across multiple files, and even run tests. Built by Anthropic for developers who want to ship faster without sacrificing quality.',
                maker: 'Anthropic Team',
                category: 'Developer Tools',
                website: 'https://claude.ai/code',
                image: '💻',
                upvotes: 247,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
            },
            {
                id: 2,
                name: 'MeetingCost Pro',
                tagline: 'Real-time calculator showing the true cost of meetings',
                description: 'Stop wasting money on unnecessary meetings. MeetingCost Pro calculates the real-time cost of your meetings based on attendee salaries. See exactly how much that "quick sync" is costing your company. Integrates with Google Calendar and Slack.',
                maker: 'Sarah Chen',
                category: 'Productivity',
                website: 'https://meetingcost.pro',
                image: '💰',
                upvotes: 189,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
            },
            {
                id: 3,
                name: 'DesignOS',
                tagline: 'Design system generator powered by AI',
                description: 'Generate complete design systems in minutes. DesignOS analyzes your brand guidelines and creates a comprehensive design system with components, typography, colors, and spacing. Export to Figma, Sketch, or code.',
                maker: 'Michael Park',
                category: 'Design',
                website: 'https://designos.io',
                image: '🎨',
                upvotes: 156,
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
            },
            {
                id: 4,
                name: 'GrowthMetrics AI',
                tagline: 'Marketing analytics that actually predict growth',
                description: 'Traditional analytics tell you what happened. GrowthMetrics AI tells you what will happen next. Uses machine learning to predict which marketing channels will drive the most growth for your specific business. Stop guessing, start growing.',
                maker: 'Lisa Rodriguez',
                category: 'Marketing',
                website: 'https://growthmetrics.ai',
                image: '📈',
                upvotes: 134,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
            },
            {
                id: 5,
                name: 'VoiceClone Studio',
                tagline: 'Clone your voice for podcasts and videos',
                description: 'Create a digital clone of your voice with just 10 minutes of recording. Use it to generate voiceovers, fix mistakes in recordings, or translate your content into any language while keeping your voice. Perfect for content creators.',
                maker: 'Alex Kumar',
                category: 'AI/ML',
                website: 'https://voiceclone.studio',
                image: '🎙️',
                upvotes: 298,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                id: 6,
                name: 'CodeReview Bot',
                tagline: 'AI code reviewer that catches bugs before production',
                description: 'Automated code reviews that actually understand your codebase. CodeReview Bot learns your coding standards, catches security vulnerabilities, and suggests performance improvements. Integrates with GitHub, GitLab, and Bitbucket.',
                maker: 'David Wu',
                category: 'Developer Tools',
                website: 'https://codereview.bot',
                image: '🤖',
                upvotes: 112,
                createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
            },
            {
                id: 7,
                name: 'FocusBlock',
                tagline: 'Block distractions based on your work patterns',
                description: 'Smart distraction blocking that learns when you need to focus. FocusBlock tracks your productivity patterns and automatically blocks distracting websites and apps during your peak focus hours. Works across all your devices.',
                maker: 'Emma Thompson',
                category: 'Productivity',
                website: 'https://focusblock.app',
                image: '🎯',
                upvotes: 87,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        ];

        // Sample comments
        const sampleComments = [
            {
                id: 1,
                productId: 1,
                author: 'John Developer',
                text: 'This is a game changer! Been using it for a week and my productivity has doubled.',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: 2,
                productId: 1,
                author: 'Rachel Designer',
                text: 'Finally, an AI tool that actually understands context. The multi-file editing is incredible.',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
                id: 3,
                productId: 5,
                author: 'Tom Podcaster',
                text: 'Saved me hours on post-production. The voice quality is indistinguishable from my real voice!',
                createdAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
                id: 4,
                productId: 2,
                author: 'CEO Steve',
                text: 'Eye-opening! We cut our meeting time by 40% after seeing the real costs. Highly recommend.',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
            },
            {
                id: 5,
                productId: 3,
                author: 'Design Lead Amy',
                text: 'As a design systems architect, I\'m impressed. This would have taken our team weeks to build.',
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            }
        ];

        this.products = sampleProducts;
        this.comments = sampleComments;
    }

    // Product methods
    addProduct(product) {
        const newProduct = {
            id: Date.now(),
            ...product,
            upvotes: 0,
            createdAt: new Date()
        };
        this.products.unshift(newProduct);
        return newProduct;
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getProductsByCategory(category) {
        if (category === 'all') return this.products;
        return this.products.filter(p => p.category === category);
    }

    // Trending algorithm: combines recency with upvotes
    getTrendingProducts() {
        return [...this.products].sort((a, b) => {
            const aScore = this.calculateTrendingScore(a);
            const bScore = this.calculateTrendingScore(b);
            return bScore - aScore;
        });
    }

    calculateTrendingScore(product) {
        const hoursOld = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 24 - hoursOld) / 24; // Boost for products less than 24h old
        return product.upvotes * (1 + recencyBoost);
    }

    upvoteProduct(id) {
        const product = this.getProductById(id);
        if (product && !this.upvotes.has(id)) {
            product.upvotes++;
            this.upvotes.add(id);
            return true;
        }
        return false;
    }

    hasUpvoted(id) {
        return this.upvotes.has(id);
    }

    // Comment methods
    addComment(productId, author, text) {
        const comment = {
            id: Date.now(),
            productId,
            author,
            text,
            createdAt: new Date()
        };
        this.comments.push(comment);
        return comment;
    }

    getCommentsByProduct(productId) {
        return this.comments
            .filter(c => c.productId === productId)
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    getCommentCount(productId) {
        return this.comments.filter(c => c.productId === productId).length;
    }

    // Stats methods
    getStats() {
        const totalProducts = this.products.length;
        const totalUpvotes = this.products.reduce((sum, p) => sum + p.upvotes, 0);
        const totalComments = this.comments.length;
        const activeMakers = new Set(this.products.map(p => p.maker)).size;

        return {
            totalProducts,
            totalUpvotes,
            totalComments,
            activeMakers
        };
    }
}

// Initialize database
const db = new Database();
