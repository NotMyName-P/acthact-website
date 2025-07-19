document.addEventListener('DOMContentLoaded', () => {

    // --- GSAP Setup ---
    gsap.registerPlugin(ScrollTrigger);

    // --- Hero Title Parallax/Tilt ---
    const heroSection = document.getElementById('home');
    if (heroSection && window.innerWidth > 768) {
        heroSection.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { offsetWidth, offsetHeight } = heroSection;
            const x = (clientX / offsetWidth - 0.5) * 2; // -1 to 1 range
            const y = (clientY / offsetHeight - 0.5) * 2; // -1 to 1 range
            gsap.to('.hero-title', { x: -x * 10, y: -y * 10, rotateX: y * -4, rotateY: x * 4, duration: 0.8, ease: "power3.out" });
        });
    }

    // --- GSAP Text Reveal with SPACE FIX ---
    document.querySelectorAll('.gsap-text-reveal').forEach(heading => {
        // Hide original heading to prevent flash of unstyled text
        gsap.set(heading, { autoAlpha: 0 });

        const text = heading.textContent;
        heading.innerHTML = '';
        const type = heading.getAttribute('data-effect-type') || 'chars';

        if (type === 'chars') {
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.innerHTML = char.trim() === '' ? ' ' : char;
                heading.appendChild(span);
            });
        } else {
            text.split(' ').forEach((word, index) => {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word;
                heading.appendChild(wordSpan);
                if (index < text.split(' ').length - 1) {
                    const space = document.createElement('span');
                    space.innerHTML = ' ';
                    heading.appendChild(space);
                }
            });
        }
        
        // Reveal the heading with the animation
        gsap.fromTo(heading.children, 
            { opacity: 0, y: 20, visibility: 'hidden' },
            {
                autoAlpha: 1, // GSAP's way of handling opacity and visibility
                y: 0,
                duration: 1, 
                stagger: { amount: 0.4, from: "start" },
                ease: 'power3.out',
                scrollTrigger: { 
                    trigger: heading, 
                    start: 'top 90%', 
                    once: true 
                }
            }
        );
    });

    // --- GSAP Scroll-Triggered Animations for Card Containers ---
    gsap.utils.toArray('.gsap-reveal-target').forEach(elem => {
        gsap.fromTo(elem,
            { opacity: 0, y: 30, visibility: 'hidden' },
            {
                autoAlpha: 1,
                y: 0,
                duration: 1, 
                ease: 'power3.out',
                scrollTrigger: { 
                    trigger: elem, 
                    start: 'top 85%', 
                    once: true 
                }
            }
        );
    });

    // --- Stripe & Payment Form Logic ---
    const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE'); // !!! REPLACE WITH YOUR KEY !!!
    const elements = stripe.elements();
    const card = elements.create('card', {
        style: {
            base: {
                color: '#F8FAFC',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                '::placeholder': { color: '#94A3B8' },
            },
            invalid: { color: '#3B82F6', iconColor: '#3B82F6' },
        }
    });

    const cardElementContainer = document.getElementById('card-element');
    if (cardElementContainer) { card.mount('#card-element'); }

    const cardErrors = document.getElementById('card-errors');
    if (cardErrors) {
        card.on('change', function(event) {
            cardErrors.textContent = event.error ? event.error.message : '';
        });
    }

    const pricingCardsContainer = document.querySelector('.pricing-cards');
    const paymentFormContainer = document.querySelector('.payment-form-container');

    document.querySelectorAll('.select-plan-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const planName = this.getAttribute('data-plan-name');
            const planPrice = this.getAttribute('data-plan-price');
            document.getElementById('selected-plan-name').textContent = planName;
            document.getElementById('selected-plan-display-price').textContent = `$${planPrice}`;
            
            // GSAP-powered transition
            if (pricingCardsContainer && paymentFormContainer) {
                gsap.to(pricingCardsContainer, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    onComplete: () => {
                        pricingCardsContainer.style.display = 'none';
                        paymentFormContainer.style.display = 'block';
                        gsap.from(paymentFormContainer, { 
                            opacity: 0, 
                            y: 20, 
                            duration: 0.8, 
                            ease: 'power3.out' 
                        });
                    }
                });
            }
        });
    });

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const payButton = paymentForm.querySelector('.pay-button');
            payButton.disabled = true;
            payButton.textContent = 'Processing...';

            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: card,
                billing_details: {
                    name: document.getElementById('card-name').value,
                },
            });

            if (error) {
                cardErrors.textContent = error.message;
                payButton.disabled = false;
                payButton.textContent = 'Pay Now';
                return;
            }

            // This is where you would send the paymentMethod.id to your backend
            console.log('Payment Method created:', paymentMethod.id);
            alert('Payment processing simulated! Check the console for the PaymentMethod ID.');
            
            payButton.disabled = false;
            payButton.textContent = 'Pay Now';
        });
    }
    
    // --- Smooth Scrolling for Navigation Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});