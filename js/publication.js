document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('doc');

    const descEl = document.getElementById('pub-description');
    const iframeEl = document.getElementById('pdf-frame');

    if (!docId) {
        descEl.innerText = "Erro: Publicação não encontrada.";
        return;
    }

    try {
        // Fetch publications list to locate matching entry
        const res = await fetch('data/publications.json');
        const publications = await res.json();
        
        // Find publication where link parameter matches URL parameter
        const item = publications.find(p => p.link.includes(docId));

        if (!item) {
            descEl.innerText = "Publicação não encontrada.";
            return;
        }

        // Render Metadata
        document.title = `${item.title} | Saberes de Si`;

        // 1. Check for and render Optional Markdown Description
        if (item.description && item.description.trim() !== '') {
            try {
                const descRes = await fetch(item.description);
                if (descRes.ok) {
                    const markdownText = await descRes.text();
                    descEl.innerHTML = marked.parse(markdownText);
                    descEl.style.display = 'block'; // Reveal container if present
                }
            } catch (err) {
                console.warn("Não foi possível carregar a descrição.", err);
            }
        }

        // 2. Set PDF Embed Source
        iframeEl.src = item.pdfUrl;

    } catch (error) {
        descEl.innerText = "Erro carregando o conteúdo.";
        console.error(error);
    }
});