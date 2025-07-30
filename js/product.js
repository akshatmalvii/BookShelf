document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const cartCountElement = document.querySelector('.cart-count');

    let allBooks = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    async function fetchProductDetails() {
        try {
            const params = new URLSearchParams(window.location.search);
            const bookId = parseInt(params.get('id'), 10);

            if (isNaN(bookId)) {
                productDetailContainer.innerHTML = '<p>Invalid book ID.</p>';
                return;
            }

            const response = await fetch('data/books.json');
            allBooks = await response.json();
            const book = allBooks.find(b => b.id === bookId);

            if (book) {
                displayProduct(book);
            } else {
                productDetailContainer.innerHTML = '<p>Book not found.</p>';
            }
        } catch (error) {
            console.error("Failed to fetch product details:", error);
            productDetailContainer.innerHTML = '<p>Could not load book details.</p>';
        }
    }

    function displayProduct(book) {
        const isBookInCart = cart.some(item => item.id === book.id);

        productDetailContainer.innerHTML = `
            <div class="product-image-container">
                <img src="${book.coverImage}" alt="Cover of ${book.title}">
            </div>
            <div class="product-info-container">
                <h1>${book.title}</h1>
                <p class="author">by ${book.author}</p>
                <div class="product-meta">
                    <span><i class="ph ph-star-fill" style="color: var(--accent-color);"></i> ${book.rating} Rating</span>
                    <span><i class="ph ph-book-open"></i> ${book.format}</span>
                    <span><i class="ph ph-translate"></i> ${book.language}</span>
                </div>
                <p class="price">₹${book.price}</p>
                <p class="product-description">${book.description}</p>
                <button class="add-to-cart-btn product-add-to-cart-btn" data-id="${book.id}" ${!book.inStock || isBookInCart ? 'disabled' : ''}>
                    <i class="ph ph-shopping-cart-simple"></i>
                    ${isBookInCart ? 'Added to Cart' : (book.inStock ? 'Add to Cart' : 'Out of Stock')}
                </button>
            </div>
        `;
    }

    productDetailContainer.addEventListener('click', e => {
        const button = e.target.closest('.product-add-to-cart-btn');
        if (button) {
            const bookId = parseInt(button.dataset.id, 10);
            addToCart(bookId, button);
        }
    });

    function addToCart(bookId, buttonElement) {
        const book = allBooks.find(b => b.id === bookId);
        if (!book) return;

        const cartItem = cart.find(item => item.id === bookId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ id: bookId, title: book.title, price: book.price, coverImage: book.coverImage, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();

        // Update the button state immediately
        buttonElement.innerHTML = `<i class="ph ph-shopping-cart-simple"></i> Added to Cart`;
        buttonElement.disabled = true;
    }

    fetchProductDetails();
    updateCartCount();
});