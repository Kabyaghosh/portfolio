document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 3D Tilt Logic (Desktop Only) ---
    const heroSection = document.querySelector('#hero');
    const tiltCard = document.querySelector('.tilt-card');

    if(heroSection && tiltCard && window.innerWidth > 768) {
        heroSection.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 20;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 20;
            
            // Subtle 3D effect - Limit rotation
            tiltCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Reset smoothly when mouse leaves
        heroSection.addEventListener('mouseleave', () => {
            tiltCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
            tiltCard.style.transition = 'transform 0.5s ease';
        });

        // Remove transition when entering to prevent lag
        heroSection.addEventListener('mouseenter', () => {
            tiltCard.style.transition = 'none';
        });
    }

    // --- 2. Custom Cursor Logic ---
    const cursor = document.querySelector('.cursor');
    const cursor2 = document.querySelector('.cursor2');
    
    if(cursor && cursor2 && window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e){
            // Dot follows instantly
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
            
            // Circle follows with CSS delay
            cursor2.style.left = e.clientX + "px";
            cursor2.style.top = e.clientY + "px";
        });

        const hoverables = document.querySelectorAll('a, button, .project-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseover', () => cursor2.classList.add('hovered'));
            el.addEventListener('mouseout', () => cursor2.classList.remove('hovered'));
        });
    }

    // --- 3. Mobile Navigation ---
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.menu a');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle Icon
            const icon = hamburger.querySelector('i');
            if(navMenu.classList.contains('active')){
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when link clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // --- 4. Chatbot Logic ---
    const toggler = document.getElementById('chatbot-toggler');
    const windowBot = document.getElementById('chatbot-window');
    const closeBot = document.getElementById('close-bot');
    const sendBtn = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    // Toggle
    if(toggler) toggler.addEventListener('click', () => windowBot.classList.add('open'));
    if(closeBot) closeBot.addEventListener('click', () => windowBot.classList.remove('open'));

    // Simple Auto-Reply
    const botReply = (msg) => {
        const div = document.createElement('div');
        div.className = 'msg bot-msg';
        
        let text = "I can help with that! Check out the 'Contact' section.";
        if(msg.includes('project') || msg.includes('mission')) text = "Mission Bot is my top project. It's an autonomous rover.";
        if(msg.includes('skill') || msg.includes('code')) text = "I work with Python, C++, and JS.";
        
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    if(sendBtn) {
        sendBtn.addEventListener('click', () => {
            const val = chatInput.value.trim();
            if(!val) return;
            
            // User Msg
            const userDiv = document.createElement('div');
            userDiv.className = 'msg user-msg';
            userDiv.textContent = val;
            chatBody.appendChild(userDiv);
            chatInput.value = '';
            
            // Bot Reply Delay
            setTimeout(() => botReply(val.toLowerCase()), 600);
        });
    }

    // --- 5. Dynamic Year ---
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
