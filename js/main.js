// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const bookContainer = document.getElementById('book-list-container');
    const searchInput = document.getElementById('search-input');
    const genreFilterContainer = document.getElementById('genre-filter-options');
    const priceFilterOptions = document.getElementById('price-filter-options');
    const priceSlider = document.getElementById('price-slider');
    const priceSliderValue = document.getElementById('price-slider-value');
    const ratingFilterOptions = document.getElementById('rating-filter-options');
    const languageFilterOptions = document.getElementById('language-filter-options');
    const inStockToggle = document.getElementById('in-stock-toggle');
    const sortBySelect = document.getElementById('sort-by');
    const resultsCount = document.getElementById('results-count');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const cartCountElement = document.querySelector('.cart-count');

    // --- State Management ---
    let allBooks = []; 
    let cart = JSON.parse(localStorage.getItem('cart')) || []; 

    // --- Initial Load ---
    async function fetchBooks() {
        try {
            const response = await fetch('data/books.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allBooks = await response.json();
            populateFilters();
            handleUrlParams(); 
            updateCartCount();
        } catch (error) {
            console.error("Failed to fetch books:", error);
            bookContainer.innerHTML = '<p>Sorry, we could not load the books at this time.</p>';
        }
    }

    // --- Rendering Functions ---
    function displayBooks(books) {
        bookContainer.innerHTML = ''; 
        if (books.length === 0) {
            bookContainer.innerHTML = '<p>No books match your criteria.</p>';
            resultsCount.textContent = 'Showing 0 results';
            return;
        }
        resultsCount.textContent = `Showing ${books.length} of ${allBooks.length} results`;

        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            if (!book.inStock) bookCard.classList.add('out-of-stock');

            const isBookInCart = cart.some(item => item.id === book.id);

            const bestsellerBadge = book.isBestseller ? '<div class="bestseller-badge">Bestseller</div>' : '';

            bookCard.innerHTML = `
                ${bestsellerBadge}
                <a href="product.html?id=${book.id}">
                    <img src="${book.coverImage}" alt="Cover of ${book.title}" onerror="this.onerror=null;this.src='https://placehold.co/300x450/cccccc/ffffff?text=Image+Not+Found';">
                </a>
                <div class="book-card-info">
                    <h3>${book.title}</h3>
                    <p class="author">by ${book.author}</p>
                    <p class="price">₹${book.price}</p>
                    <button class="add-to-cart-btn" data-id="${book.id}" ${!book.inStock || isBookInCart ? 'disabled' : ''}>
                        <i class="ph ph-shopping-cart-simple"></i>
                        ${isBookInCart ? 'Added to Cart' : (book.inStock ? 'Add to Cart' : 'Out of Stock')}
                    </button>
                </div>
            `;
            bookContainer.appendChild(bookCard);
        });
    }
    
    function populateFilters() {
        const genres = [...new Set(allBooks.map(book => book.genre))];
        genreFilterContainer.innerHTML = '';
        genres.sort().forEach(genre => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="genre" value="${genre}"> ${genre}`;
            genreFilterContainer.appendChild(label);
        });
    }

    // --- Filtering and Sorting Logic ---
    function applyAllFiltersAndSorting() {
        let filteredBooks = [...allBooks];

        const params = new URLSearchParams(window.location.search);
        if (params.get('filter') === 'bestsellers') {
            filteredBooks = filteredBooks.filter(book => book.isBestseller);
        }

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
        }

        const selectedGenres = [...genreFilterContainer.querySelectorAll('input:checked')].map(el => el.value);
        if (selectedGenres.length > 0) {
            filteredBooks = filteredBooks.filter(book => selectedGenres.includes(book.genre));
        }
        
        const selectedLanguages = [...languageFilterOptions.querySelectorAll('input:checked')].map(el => el.value);
        if (selectedLanguages.length > 0) {
            filteredBooks = filteredBooks.filter(book => selectedLanguages.includes(book.language));
        }

        const selectedPriceRange = priceFilterOptions.querySelector('input[name="price"]:checked').value;
        if (selectedPriceRange !== 'all') {
            const [min, max] = selectedPriceRange.split('-').map(Number);
            filteredBooks = filteredBooks.filter(book => {
                if (max) return book.price >= min && book.price <= max;
                return book.price >= min;
            });
        }
        
        const maxPrice = parseInt(priceSlider.value, 10);
        filteredBooks = filteredBooks.filter(book => book.price <= maxPrice);

        const selectedRatingValue = ratingFilterOptions.querySelector('input[name="rating"]:checked').value;
        if (selectedRatingValue !== 'all') {
            const selectedRating = parseFloat(selectedRatingValue);
            filteredBooks = filteredBooks.filter(book => book.rating >= selectedRating);
        }

        if (inStockToggle.checked) {
            filteredBooks = filteredBooks.filter(book => book.inStock);
        }
        
        const sortBy = sortBySelect.value;
        switch(sortBy) {
            case 'price-asc': filteredBooks.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filteredBooks.sort((a, b) => b.price - a.price); break;
            case 'rating-desc': filteredBooks.sort((a, b) => b.rating - a.rating); break;
        }

        displayBooks(filteredBooks);
    }
    
    function handleUrlParams() {
        applyAllFiltersAndSorting();
    }

    // --- Cart Logic ---
    function addToCart(bookId, buttonElement) {
        const book = allBooks.find(b => b.id === bookId);
        if (!book) return;
        const cartItem = cart.find(item => item.id === bookId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ id: bookId, title: book.title, price: book.price, coverImage: book.coverImage, quantity: 1 });
        }
        
        saveCart();
        updateCartCount();

        // Update the button state immediately
        buttonElement.innerHTML = `<i class="ph ph-shopping-cart-simple"></i> Added to Cart`;
        buttonElement.disabled = true;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    // --- Event Listeners ---
    [searchInput, genreFilterContainer, priceFilterOptions, ratingFilterOptions, languageFilterOptions, inStockToggle, sortBySelect].forEach(el => {
        el.addEventListener('change', applyAllFiltersAndSorting);
    });
    searchInput.addEventListener('input', applyAllFiltersAndSorting);
    priceSlider.addEventListener('input', () => { priceSliderValue.textContent = priceSlider.value; });
    priceSlider.addEventListener('change', applyAllFiltersAndSorting);

    bookContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-cart-btn');
        if (button) {
            const bookId = parseInt(button.dataset.id, 10);
            addToCart(bookId, button);
        }
    });
    
    resetFiltersBtn.addEventListener('click', () => {
        window.history.pushState({}, document.title, window.location.pathname);
        searchInput.value = '';
        document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
        document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = el.value === 'all');
        priceSlider.value = 1000;
        priceSliderValue.textContent = 1000;
        sortBySelect.value = 'default';
        applyAllFiltersAndSorting();
    });

    // --- Initial Call ---
    fetchBooks();
});