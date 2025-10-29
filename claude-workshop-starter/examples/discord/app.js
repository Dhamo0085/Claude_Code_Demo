// Main application logic
class ProductLaunchApp {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.render();
    }

    // Render all UI
    render() {
        this.renderStats();
        this.renderProducts();
    }

    // Render stats dashboard
    renderStats() {
        const stats = db.getStats();
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUpvotes').textContent = stats.totalUpvotes;
        document.getElementById('totalComments').textContent = stats.totalComments;
        document.getElementById('activeMakers').textContent = stats.activeMakers;
    }

    // Render products list
    renderProducts() {
        const products = db.getTrendingProducts();
        const filtered = this.currentFilter === 'all'
            ? products
            : products.filter(p => p.category === this.currentFilter);

        const productsList = document.getElementById('productsList');

        if (filtered.length === 0) {
            productsList.innerHTML = `
                <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                    <div style="font-size: 3em; margin-bottom: 16px;">🔍</div>
                    <h3>No products found</h3>
                    <p>Try a different category or be the first to submit a product!</p>
                </div>
            `;
            return;
        }

        productsList.innerHTML = filtered.map((product, index) => {
            const commentCount = db.getCommentCount(product.id);
            const hasUpvoted = db.hasUpvoted(product.id);

            return `
                <div class="product-card" onclick="app.showProductDetail(${product.id})">
                    <div class="product-rank">#${index + 1}</div>

                    <div class="product-image">
                        ${this.renderProductImage(product)}
                    </div>

                    <div class="product-info">
                        <div class="product-header">
                            <h3 class="product-name">${product.name}</h3>
                            <a href="${product.website}"
                               class="product-link"
                               target="_blank"
                               onclick="event.stopPropagation()">
                                ${this.getDomain(product.website)} ↗
                            </a>
                        </div>
                        <p class="product-tagline">${product.tagline}</p>
                        <div class="product-meta">
                            <span class="product-category">${product.category}</span>
                            <span class="product-maker">By ${product.maker}</span>
                            <div class="product-stats">
                                <span>💬 ${commentCount} comments</span>
                                <span>🕐 ${this.getTimeAgo(product.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="upvote-section">
                        <button class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}"
                                onclick="app.upvoteProduct(${product.id}, event)">
                            <div class="upvote-icon">▲</div>
                            <div class="upvote-count">${product.upvotes}</div>
                            <div class="upvote-label">upvotes</div>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderProductImage(product) {
        if (product.image && product.image.startsWith('http')) {
            return `<img src="${product.image}" alt="${product.name}">`;
        }
        return product.image || '📦';
    }

    getDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // Filter products by category
    filterByCategory(category) {
        this.currentFilter = category;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        this.renderProducts();
    }

    // Upvote a product
    upvoteProduct(productId, event) {
        event.stopPropagation();

        if (db.upvoteProduct(productId)) {
            this.render();
        }
    }

    // Show product detail modal
    showProductDetail(productId) {
        const product = db.getProductById(productId);
        if (!product) return;

        const comments = db.getCommentsByProduct(productId);
        const hasUpvoted = db.hasUpvoted(productId);

        const detailHTML = `
            <div class="product-detail-header">
                <div class="product-detail-image">
                    ${this.renderProductImage(product)}
                </div>
                <div class="product-detail-info">
                    <h2 class="product-detail-name">${product.name}</h2>
                    <p class="product-detail-tagline">${product.tagline}</p>
                    <div class="product-detail-meta">
                        <span class="product-category">${product.category}</span>
                        <span class="product-maker">By ${product.maker}</span>
                        <span style="color: var(--text-muted);">🕐 ${this.getTimeAgo(product.createdAt)}</span>
                    </div>
                    <div class="product-detail-actions">
                        <button class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}"
                                onclick="app.upvoteFromDetail(${productId})">
                            <div class="upvote-icon">▲</div>
                            <div class="upvote-count">${product.upvotes}</div>
                            <div class="upvote-label">upvotes</div>
                        </button>
                        <a href="${product.website}" target="_blank" class="visit-btn">
                            Visit Website →
                        </a>
                    </div>
                </div>
            </div>

            <div class="product-description">
                ${product.description}
            </div>

            <div class="comments-section">
                <h3 class="comments-header">💬 Discussion (${comments.length})</h3>

                <div class="comment-form">
                    <textarea id="commentText"
                              placeholder="Share your thoughts..."
                              rows="3"></textarea>
                    <button class="btn-primary" onclick="app.addComment(${productId})">
                        Post Comment
                    </button>
                </div>

                <div class="comment-list">
                    ${comments.length === 0
                        ? '<div class="empty-comments">No comments yet. Be the first to share your thoughts!</div>'
                        : comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-author">${comment.author}</div>
                                <div class="comment-time">${this.getTimeAgo(comment.createdAt)}</div>
                                <div class="comment-text">${comment.text}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;

        document.getElementById('productDetail').innerHTML = detailHTML;
        document.getElementById('detailModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    upvoteFromDetail(productId) {
        if (db.upvoteProduct(productId)) {
            this.render();
            this.showProductDetail(productId); // Refresh detail view
        }
    }

    // Add comment
    addComment(productId) {
        const textarea = document.getElementById('commentText');
        const text = textarea.value.trim();

        if (!text) {
            alert('Please enter a comment!');
            return;
        }

        // Random author names for demo
        const authors = ['Alex', 'Sarah', 'Mike', 'Lisa', 'Tom', 'Emma', 'John', 'Rachel'];
        const author = authors[Math.floor(Math.random() * authors.length)] + ' (You)';

        db.addComment(productId, author, text);
        textarea.value = '';

        // Refresh detail view
        this.render();
        this.showProductDetail(productId);
    }

    // Show submit modal
    showSubmitModal() {
        document.getElementById('submitModal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    closeSubmitModal() {
        document.getElementById('submitModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    // Submit new product
    submitProduct() {
        const name = document.getElementById('productName').value.trim();
        const tagline = document.getElementById('productTagline').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const maker = document.getElementById('productMaker').value.trim();
        const category = document.getElementById('productCategory').value;
        const website = document.getElementById('productUrl').value.trim();
        const image = document.getElementById('productImage').value.trim() || '🚀';

        if (!name || !tagline || !description || !maker || !website) {
            alert('Please fill in all required fields!');
            return;
        }

        db.addProduct({
            name,
            tagline,
            description,
            maker,
            category,
            website,
            image
        });

        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productTagline').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productMaker').value = '';
        document.getElementById('productUrl').value = '';
        document.getElementById('productImage').value = '';

        this.closeSubmitModal();
        this.render();

        // Show success (optional)
        alert('🎉 Product launched successfully!');
    }

    closeDetailModal() {
        document.getElementById('detailModal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }

    closeModals() {
        this.closeSubmitModal();
        this.closeDetailModal();
    }
}

// Initialize app
const app = new ProductLaunchApp();
