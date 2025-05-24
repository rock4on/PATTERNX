document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Codul pentru text-truncate-multiline
    const truncateElements = document.querySelectorAll('.text-truncate-multiline');
    truncateElements.forEach(el => {
        // Simplu line clamp, poate necesita o soluție mai robustă pentru cazuri complexe
        // Sau folosește proprietăți CSS ca -webkit-line-clamp dacă suportul browserului este suficient
        const maxHeight = parseInt(window.getComputedStyle(el).lineHeight) * 2; // Limitează la 2 linii
        if (el.scrollHeight > maxHeight) {
            // Poți adăuga "..." sau alte indicații aici dacă dorești
        }
    });
});