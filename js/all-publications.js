// State Variables
let allPublications = [];
let currentFilteredArticles = [];
let currentPage = 1;
const itemsPerPage = 30; // Max articles per page

// DOM Elements
const articleContainer = document.getElementById('article-list');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// Fetch data from the JSON file
async function fetchData() {
    try {
        const response = await fetch('data/publications.json');
        if (!response.ok) throw new Error("Não foi possível carregar as publicações.");
        
        allPublications = await response.json();
        performSearch(); // Triggers initial render and sorting
    } catch (error) {
        articleContainer.innerHTML = `<p style="color: red;">Erro carregando publicações: ${error.message}</p>`;
		console.log(error.message);
    }
}

// Search & Sort Logic
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const sortBy = sortSelect.value;
    // 1. Filter
    if (query === '') {
        currentFilteredArticles = [...allPublications];
    } else {
        currentFilteredArticles = allPublications.filter(article => {
            const matchTitle = article.title.toLowerCase().includes(query);
            const matchBody = article.body.toLowerCase().includes(query);
            const matchTags = article.tags.some(tag => tag.toLowerCase().includes(query));
            return matchTitle || matchBody || matchTags;
        });
    }

    // 2. Sort
    if (sortBy === 'date') {
        currentFilteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
        currentFilteredArticles.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 3. Reset to page 1 and render
    currentPage = 1;
    renderPage(currentPage, query, false);
}

// Render a specific page of articles
function renderPage(page, query, fromPagination=false) {
    articleContainer.innerHTML = ''; 
    
    if (currentFilteredArticles.length === 0) {
        articleContainer.innerHTML = '<p>Nenhuma publicação encontrada para sua pesquisa.</p>';
        paginationContainer.innerHTML = ''; // Hide pagination
        return;
    }

    // Calculate start and end indices for the 30 items
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const articlesToShow = currentFilteredArticles.slice(startIndex, endIndex);

    // Build the HTML
    articlesToShow.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';

        const tagsHtml = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Format the date for the archive page
        const dateObj = new Date(article.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        card.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <div class="article-date">${formattedDate}</div>
            <div class="article-tags">${tagsHtml}</div>
            <p class="article-preview-expanded">${article.body}</p> 
        `;
        
        card.addEventListener('click', () => {
            window.location.href = article.link;
        });
        
        articleContainer.appendChild(card);
    });

    renderPagination(query);
    
    // NEW SCROLL LOGIC: Only scroll if explicitly triggered by a pagination click
    if (fromPagination) {
         window.scrollTo({ 
             top: document.querySelector('.controls-section').offsetTop - 20, 
             behavior: 'smooth' 
         });
    }
}

// Build the Pagination Buttons
function renderPagination(query) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentFilteredArticles.length / itemsPerPage);

    if (totalPages <= 1) return; // No need for pagination if only 1 page

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerText = 'Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage, query, true); // Pass true to trigger scroll
        }
    });
    paginationContainer.appendChild(prevBtn);

    // Numbered Square Buttons
    for (let i = 1; i <= totalPages; i++) {
        const numBtn = document.createElement('button');
        numBtn.className = `page-btn square ${i === currentPage ? 'active' : ''}`;
        numBtn.innerText = i;
        numBtn.addEventListener('click', () => {
            currentPage = i;
            renderPage(currentPage, query, true); // Pass true to trigger scroll
        });
        paginationContainer.appendChild(numBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerText = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage, query, true); // Pass true to trigger scroll
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});
sortSelect.addEventListener('change', performSearch);