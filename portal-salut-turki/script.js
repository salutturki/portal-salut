document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card');
    const transitionCircle = document.getElementById('circularTransition');
    const transitionContent = document.getElementById('transitionContent');

    // Remove active class on load (in case user clicks 'back' button in browser)
    setTimeout(() => {
        transitionCircle.classList.remove('active');
        transitionContent.classList.remove('active');
        transitionCircle.style.width = '0';
        transitionCircle.style.height = '0';
    }, 100);

    // 3D Tilt Effect on Cards
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });

        // Premium Circular Reveal Page Transition
        card.addEventListener('click', e => {
            e.preventDefault();
            const targetUrl = card.getAttribute('href');
            
            // Calculate size to cover entire screen from click point
            const maxViewportDim = Math.max(window.innerWidth, window.innerHeight);
            const circleSize = maxViewportDim * 2.5; // Multiply by 2.5 to ensure diagonal coverage
            
            // Set circle position to mouse click
            transitionCircle.style.left = e.clientX + 'px';
            transitionCircle.style.top = e.clientY + 'px';
            transitionCircle.style.width = circleSize + 'px';
            transitionCircle.style.height = circleSize + 'px';
            
            // Trigger animation
            transitionCircle.classList.add('active');
            
            // Show logo and spinner after circle covers screen
            setTimeout(() => {
                transitionContent.classList.add('active');
            }, 400);
            
            // Navigate after full animation
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 800);
        });
    });
});
