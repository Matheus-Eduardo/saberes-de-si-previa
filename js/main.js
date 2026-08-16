// Store all articles loaded from JSON
let allArticles = [];

// DOM Elements
const articleContainer = document.getElementById('article-list');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// Fetch data from the JSON files
async function fetchData() {
    try {
        // Fetch both JSON files in parallel
        const [articlesRes, pubRes] = await Promise.all([
            fetch('data/articles.json'),
            fetch('data/publications.json')
        ]);

        if (!articlesRes.ok || !pubRes.ok) throw new Error("Could not load content files.");

        const articles = await articlesRes.json();
        const publications = await pubRes.json();

        // Combine them into a single list for the homepage
        allArticles = [...articles, ...publications];
        renderArticles(allArticles);
    } catch (error) {
        articleContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Render articles to the HTML
function renderArticles(articlesToRender) {
    articleContainer.innerHTML = ''; // Clear current articles
    
    // Sort before displaying
    const sortBy = sortSelect.value;
    let sortedArticles = [...articlesToRender];
    
    if (sortBy === 'date') {
        sortedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
        sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Enforce the 20 article limit
    const limitedArticles = sortedArticles.slice(0, 20);

    if (limitedArticles.length === 0) {
        articleContainer.innerHTML = '<p>No articles found matching your search.</p>';
        return;
    }

    // Build the HTML for each article
    limitedArticles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';

        const tagsHtml = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Format the raw YYYY-MM-DD date into something readable (e.g., "May 18, 2026")
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
            <p class="article-preview">${article.body}</p>
        `;
        
        // Direct redirection using the custom link property from the JSON
        card.addEventListener('click', () => {
            window.location.href = article.link;
        });
        
        articleContainer.appendChild(card);
    });
}

// Search Logic
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        renderArticles(allArticles);
        return;
    }

    const filteredArticles = allArticles.filter(article => {
        const matchTitle = article.title.toLowerCase().includes(query);
        const matchBody = article.body.toLowerCase().includes(query);
        const matchTags = article.tags.some(tag => tag.toLowerCase().includes(query));
        
        return matchTitle || matchBody || matchTags;
    });

    renderArticles(filteredArticles);
}

// --- Event Listeners ---

// 1. Trigger search on clicking the search icon
searchBtn.addEventListener('click', performSearch);

// 2. Trigger search on pressing "Enter" inside the search bar
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});

// Re-sort current view when dropdown changes
sortSelect.addEventListener('change', () => {
    performSearch();
});