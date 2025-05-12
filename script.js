document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const hamburger = document.getElementById('hamburger-menu');
    const menuListMobile = document.getElementById('menu-list');

    if (hamburger && menuListMobile) {
        hamburger.addEventListener('click', () => {
            // Check the state *before* toggling
            const isActive = menuListMobile.classList.contains('active');

            // Toggle classes based on the *opposite* of the current state
            hamburger.classList.toggle('active', !isActive);
            menuListMobile.classList.toggle('active', !isActive);

            // Update accessibility attribute
            hamburger.setAttribute('aria-expanded', !isActive);
        });

        // Close menu when a link is clicked
        menuListMobile.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (menuListMobile.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    menuListMobile.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false'); // Accessibility
                }
            });
        });
    } else {
        console.error("Hamburger or Menu List element not found!");
    }


    // --- Desktop Navigation Sliding Background & Active Link ---
    const mainNav = document.getElementById('main-nav');
    const menuListDesktop = document.getElementById('menu-list'); // Re-use variable
    const menuLinksDesktop = menuListDesktop?.querySelectorAll('a'); // Use optional chaining
    const sectionsForNav = document.querySelectorAll('main section[id]');

    let currentActiveLink = null;
    let scrollTimeoutNav;
    let resizeTimeoutNav;

    function updateSlider(targetLink) {
        if (!menuListDesktop || window.innerWidth <= 768) {
            menuListDesktop?.style.setProperty('--slider-opacity', '0');
            return;
        }
        // Use active link if no specific target (e.g., on mouseleave or scroll update)
        if (!targetLink) targetLink = currentActiveLink;

        if (targetLink) {
            const sliderLeft = targetLink.offsetLeft;
            const sliderWidth = targetLink.offsetWidth;
            menuListDesktop.style.setProperty('--slider-left', `${sliderLeft}px`);
            menuListDesktop.style.setProperty('--slider-width', `${sliderWidth}px`);
            menuListDesktop.style.setProperty('--slider-opacity', '1');
        } else {
            menuListDesktop.style.setProperty('--slider-opacity', '0');
        }
    }

    function setActiveLinkOnScroll() {
        if (window.innerWidth <= 768 || !mainNav || !menuListDesktop || !sectionsForNav) return;

        let foundActive = false;
        const scrollPosition = window.pageYOffset; // More compatible than scrollY
        const navHeight = mainNav.offsetHeight;
        // Adjust buffer - activate when section top is closer to the top of the viewport
        const buffer = navHeight + 60; // Increased buffer slightly

        sectionsForNav.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            // Check if the current scroll position is within the bounds of this section (with buffer)
             if (scrollPosition >= sectionTop - buffer && scrollPosition < sectionTop + sectionHeight - buffer) {
                const correspondingLink = menuListDesktop.querySelector(`a[href="#${sectionId}"]`);

                if (correspondingLink && correspondingLink !== currentActiveLink) {
                     // Remove active from the previous link
                     if(currentActiveLink) currentActiveLink.classList.remove('active');
                     // Add active to the new link
                     correspondingLink.classList.add('active');
                     currentActiveLink = correspondingLink;
                 } else if (correspondingLink && correspondingLink === currentActiveLink) {
                    // Already the active link, do nothing extra but mark as found
                 }
                 foundActive = true; // Mark that we found an active section
             } else {
                // Section is not in view according to buffer, remove active if it was the one
                const correspondingLink = menuListDesktop.querySelector(`a[href="#${sectionId}"]`);
                if (correspondingLink && correspondingLink === currentActiveLink) {
                    correspondingLink.classList.remove('active');
                    currentActiveLink = null; // Clear current active since it's no longer in view
                }
             }
        });

        // If scrolled near the top, ensure no link is active
        if (!foundActive && scrollPosition < (sectionsForNav[0]?.offsetTop - buffer)) {
             if(currentActiveLink) {
                currentActiveLink.classList.remove('active');
                currentActiveLink = null;
            }
        }

         // Update slider based on the final active link for this scroll event
         updateSlider(currentActiveLink);
    }

    // Add listeners only if on desktop initially
    function setupDesktopNavListeners() {
        if (window.innerWidth > 768 && menuLinksDesktop && menuListDesktop) {
             menuLinksDesktop.forEach(link => {
                link.addEventListener('mouseenter', () => updateSlider(link));
             });
             menuListDesktop.addEventListener('mouseleave', () => updateSlider(currentActiveLink)); // Update slider on mouse leave
        }
        // Note: No easy way to *remove* specific listeners cleanly on resize without tracking them.
        // Relying on the width check within handlers is simpler for this case.
    }

    setupDesktopNavListeners(); // Initial setup

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeoutNav);
        scrollTimeoutNav = setTimeout(setActiveLinkOnScroll, 50); // Debounce scroll events
    });

    // Initial check after load and potential layout shifts
    // Use setTimeout to allow layout to settle
    setTimeout(() => {
         setActiveLinkOnScroll();
         // Ensure slider is positioned correctly on load if a section is already in view
         if (currentActiveLink && window.innerWidth > 768) {
             setTimeout(() => updateSlider(currentActiveLink), 50); // Extra small delay for accuracy
         }
    }, 300);

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeoutNav);
        resizeTimeoutNav = setTimeout(() => { // Debounce resize events
            setActiveLinkOnScroll(); // Recalculate active state
            if (window.innerWidth > 768) {
                 if (currentActiveLink) {
                    updateSlider(currentActiveLink); // Update slider position
                 }
                 setupDesktopNavListeners(); // Ensure listeners are attached if switching to desktop
             } else {
                 menuListDesktop?.style.setProperty('--slider-opacity', '0'); // Hide slider on mobile resize
             }
            // Close mobile menu if window resized larger while open
            if (window.innerWidth > 768 && menuListMobile?.classList.contains('active')) {
                hamburger?.classList.remove('active');
                menuListMobile.classList.remove('active');
                hamburger?.setAttribute('aria-expanded', 'false');
            }
        }, 150);
    });


    // --- Modal Logic ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('[data-modal-close]');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore background scrolling
        }
    }

    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeModal(closeBtn.closest('.modal'));
        });
    });

    // Close modal if clicking outside the content area
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            // Check if the click target is the modal backdrop itself
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            modals.forEach(modal => {
                // Check if the modal is currently displayed
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });


    // --- FAQ Chatbot Logic ---
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotMessagesContainer = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotSendBtn = document.getElementById('chatbot-send-btn');

    // FAQ data (Consider moving to JSON for larger sites)
    const faqData = {
        hello: "Hi there! How can I help you learn about Kabya?",
        hi: "Hello! Ask me anything about Kabya.",
        "who are you": "I'm Kabya Ghosh, an 18-year-old (born Sep 24, 2005) tech enthusiast and robotics innovator from Satkhira, Nalta, Bangladesh.",
        "who is kabya": "Kabya Ghosh is an undergraduate tech enthusiast from Bangladesh, focusing on robotics, UI/UX design, and innovative projects.",
        age: "Kabya is 18 years old, born on September 24, 2005.",
        birthday: "Kabya's birthday is September 24th (born 2005).",
        "where do you live": "Kabya lives in Nalta, Satkhira, Bangladesh.",
        location: "Kabya is based in Nalta, Satkhira, Bangladesh.",
        country: "Kabya is from Bangladesh.",
        skills: "Kabya's skills include Python, C++, HTML, CSS, JavaScript, Fusion 360 (CAD), OpenCV (Computer Vision), Arduino programming, and ROS (Robot Operating System). He's also into UI/UX Design.",
        "what can you do": "Kabya works on robotics, coding, web development (like this site!), 3D design, and AI projects. Key skills: Python, C++, Fusion 360, OpenCV, Arduino, ROS, HTML/CSS/JS.",
        "programming languages": "Kabya primarily uses Python and C++, along with web technologies like HTML, CSS, and JavaScript.",
        "design skills": "Kabya is exploring UI/UX and Product Design, and uses Fusion 360 for 3D modeling.",
        "robotics skills": "For robotics, Kabya uses Arduino, ROS, Python, C++, OpenCV, and Fusion 360 for building and programming robots.",
        projects: "Some of Kabya's key projects are Mission Bot (an autonomous robot), an Automated Flood Pump, a Smart Irrigation System, and his custom AI project 'KGs1 Beta'. Click on a project card to learn more!",
        "mission bot": "Mission Bot is an autonomous robot project developed by Kabya, designed for tasks like exploration. It has been featured in the press. Click its project card for more details.",
        "flood pump": "It's an automated system Kabya built to manage water levels during floods using sensors and a pump. Click its project card for more details.",
        "smart irrigation": "A system that uses sensors to automate watering for plants or crops, saving water. Click its project card for more details.",
        "kgs1 beta": "KGs1 Beta is Kabya's custom AI project, likely focusing on AI assistance or specific AI tasks. Click its project card for more details.",
        "what have you built": "Kabya has built several projects including Mission Bot, an Automated Flood Pump, a Smart Irrigation System, and is working on a custom AI (KGs1 Beta). Check out the Projects section!",
        education: "Kabya is preparing to join Daffodil International University (DIU) to study Computer Science and Engineering (CSE).",
        university: "Kabya plans to attend Daffodil International University (DIU) for CSE.",
        goals: "Kabya aims to become an expert in Robotics and Cybersecurity, specialize in 3D printing, and eventually build his own R&D lab.",
        "future plans": "His future plans include excelling in his CSE studies, deepening his expertise in robotics/cybersecurity, and establishing an R&D lab.",
        hobbies: "Kabya's hobbies include robotics, coding, managing his aquarium, caring for his cockatiel, biking, and working on various tech projects. See the About section!",
        interests: "He's interested in robotics, programming, technology, design, aquariums, birds (cockatiels), and biking.",
        pets: "Yes, Kabya has an aquarium and cares for a cockatiel.",
        achievements: "Kabya received a national award in the presence of PM Sheikh Hasina and the Education Minister. His Mission Bot project was also featured in the press. He's also growing his YouTube channel, KraftGenesis. Check the Achievements timeline!",
        awards: "He won a significant national award presented by the Education Minister, with PM Sheikh Hasina attending the ceremony. See the Achievements section for details.",
        youtube: "Kabya runs the YouTube channel 'KraftGenesis' where he shares his tech projects and knowledge. You can find it at youtube.com/@KraftGenesis or via the link in the header/footer.",
        kraftgenesis: "KraftGenesis is Kabya's YouTube channel focused on tech projects and innovation: youtube.com/@KraftGenesis",
        contact: "You can reach out via Email, WhatsApp, or Facebook! Check the Contact section at the bottom of the page for details.",
        email: "Kabya's email is kabyaghosh4@gmail.com. You can find it in the Contact section.",
        devices: "Kabya uses tech like an iPad M2, Infinix Note 40 Pro phone, a Haier TV, and LG AC & Fridge.",
        default: "That's interesting! I can answer questions about Kabya's skills, projects, background, or contact info. Try asking something specific!"
    };

    function addChatMessage(message, sender) {
        if (!chatbotMessagesContainer) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        // Basic sanitization (replace potential HTML tags -> use textContent for safety)
        messageElement.textContent = message;
        chatbotMessagesContainer.appendChild(messageElement);
        // Scroll to the bottom smoothly
        chatbotMessagesContainer.scrollTo({
            top: chatbotMessagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function getBotResponse(userInput) {
        const lowerCaseInput = userInput.toLowerCase().trim().replace(/[?,.!]/g, ""); // Normalize input

        // Prioritize exact match
        for (const keyword in faqData) {
            // Ensure we don't match the 'default' key directly
            if (Object.hasOwnProperty.call(faqData, keyword) && keyword !== 'default' && lowerCaseInput === keyword) {
                return faqData[keyword];
            }
        }
        // Check if input *contains* a keyword (longer keywords first for better matching)
        const keywords = Object.keys(faqData).filter(k => k !== 'default').sort((a, b) => b.length - a.length);
         for (const keyword of keywords) {
             if (lowerCaseInput.includes(keyword)) {
                 return faqData[keyword];
             }
         }
        // Default response if no match found
        return faqData.default;
    }

    function handleUserInput() {
         if (!chatbotInput) return;
        const userInput = chatbotInput.value.trim();
        if (userInput) {
            addChatMessage(userInput, 'user');
            // Simulate bot thinking delay
            setTimeout(() => {
                const botResponse = getBotResponse(userInput);
                addChatMessage(botResponse, 'bot');
            }, 600); // Slightly increased delay
            chatbotInput.value = ''; // Clear input field
        }
    }

    if (chatbotToggler && chatbotWindow && chatbotInput && chatbotSendBtn && chatbotMessagesContainer) {
        chatbotToggler.addEventListener('click', () => {
            const isOpen = chatbotWindow.classList.toggle('open');
            chatbotToggler.classList.toggle('open');
            chatbotToggler.setAttribute('aria-expanded', isOpen); // Accessibility
            if (isOpen) {
                // Delay focus slightly to allow transition to start
                setTimeout(() => chatbotInput.focus(), 50);
            }
        });

        chatbotSendBtn.addEventListener('click', handleUserInput);

        chatbotInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                // Prevent default form submission if it were in a form
                event.preventDefault();
                handleUserInput();
            }
        });
    } else {
         console.error("One or more chatbot elements not found!");
    }


    // --- Scroll Animation Observer ---
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const scrollObserverOptions = {
        root: null, // relative to viewport
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -30px 0px' // Trigger slightly before element bottom hits 30px above viewport bottom
    };

    const scrollObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver(scrollObserverCallback, scrollObserverOptions);
        elementsToAnimate.forEach(el => { scrollObserver.observe(el); });
    } else {
         // Fallback for older browsers: make elements visible immediately
         console.warn("IntersectionObserver not supported. Scroll animations disabled.");
         elementsToAnanimate.forEach(el => { el.classList.add('is-visible'); });
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded