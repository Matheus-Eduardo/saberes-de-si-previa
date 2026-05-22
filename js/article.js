document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the '?post=' parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const postName = urlParams.get('post');
    const contentContainer = document.getElementById('article-content');

    if (!postName) {
        contentContainer.innerHTML = '<h1>Error</h1><p>No article specified.</p>';
        return;
    }

    // 2. Fetch the markdown file
    fetch(`articles/${postName}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Article not found');
            }
            return response.text();
        })
        .then(markdownText => {
            // 3. Convert markdown to HTML and inject it
            contentContainer.innerHTML = marked.parse(markdownText);
            
            // Optional: Update the page title based on the first heading
            const firstHeading = contentContainer.querySelector('h1');
            if (firstHeading) {
                document.title = `${firstHeading.innerText} | Know Thyself`;
            }
        })
        .catch(error => {
            contentContainer.innerHTML = `<h1>404</h1><p>Sorry, this philosophical text seems to be lost to history. (${error.message})</p>`;
        });
});