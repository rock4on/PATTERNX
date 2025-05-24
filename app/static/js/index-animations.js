document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Oprește observarea după ce animația a pornit
                }
            });
        }, {
            threshold: 0.1 // Elementul este considerat vizibil la 10% vizibilitate
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
});