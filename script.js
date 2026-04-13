document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    let glitchTimeoutId = null;
    let nextGlitchTimerId = null;
    const glitchAudio = document.getElementById('glitch-audio');
    const glitchAudio2 = document.getElementById('glitch-audio2');
    const glitchAudio3 = document.getElementById('glitch-audio3');


    // Scramble Logic for grid cards
    const gridCards = document.querySelectorAll('.grid .glass-card');
    const originalTexts = new Map();

    function getTextNodes(node) {
        let all = [];
        for (node = node.firstChild; node; node = node.nextSibling) {
            if (node.nodeType == 3) {
                if (node.nodeValue.trim() !== '') {
                    all.push(node);
                }
            } else {
                all = all.concat(getTextNodes(node));
            }
        }
        return all;
    }

    const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`₪⠶⡄⢄⣆⡇⣯⡛⣄';

    gridCards.forEach(card => {
        const textNodes = getTextNodes(card);
        textNodes.forEach(node => {
            originalTexts.set(node, node.nodeValue);
        });
    });

    function applyScramble() {
        originalTexts.forEach((originalValue, node) => {
            let scrambled = '';
            for (let i = 0; i < originalValue.length; i++) {
                if (originalValue[i] === ' ' || originalValue[i] === '\n') {
                    scrambled += originalValue[i];
                } else {
                    scrambled += glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
                }
            }
            node.nodeValue = scrambled;
        });
    }

    function restoreScramble() {
        originalTexts.forEach((originalValue, node) => {
            node.nodeValue = originalValue;
        });
    }

    let scrambleInterval = null;

    function startCreepyGrid() {
        gridCards.forEach(card => {
            card.style.setProperty('--tilt', `${Math.random() * 20 - 10}deg`);
            card.style.setProperty('--tx', `${Math.random() * 30 - 15}px`);
            card.style.setProperty('--ty', `${Math.random() * 30 - 15}px`);
        });

        if (scrambleInterval) clearInterval(scrambleInterval);
        applyScramble();
        scrambleInterval = setInterval(applyScramble, 80);
    }

    function stopCreepyGrid() {
        gridCards.forEach(card => {
            card.style.removeProperty('--tilt');
            card.style.removeProperty('--tx');
            card.style.removeProperty('--ty');
        });
        if (scrambleInterval) clearInterval(scrambleInterval);
        restoreScramble();
    }

    function triggerGlitch(duration) {
        body.classList.add('creepy-mode');

        // Scroll down precisely to the message, but avoid yanking the screen for mere 150ms subliminal flashes
        if (duration > 500) {
            const introSection = document.querySelector('.intro');
            if (introSection) {
                introSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        startCreepyGrid();

        if (glitchAudio) {
            glitchAudio.currentTime = 0;
            // Catch error in case browser blocks autoplay before user interaction
            glitchAudio.play().catch(e => console.log("Audio prevented:", e));
            
            // 20% chance to play additional spooky audio tracks
            if (Math.random() < 0.2) {
                if (glitchAudio2) {
                    glitchAudio2.currentTime = 0;
                    glitchAudio2.play().catch(e => console.log("Audio prevented:", e));
                }
                if (glitchAudio3) {
                    glitchAudio3.currentTime = 0;
                    glitchAudio3.play().catch(e => console.log("Audio prevented:", e));
                }
            }
        }

        if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
        if (nextGlitchTimerId) clearTimeout(nextGlitchTimerId); // Avoid overlapping schedules

        glitchTimeoutId = setTimeout(() => {
            endGlitch();
        }, duration);
    }

    function endGlitch() {
        body.classList.remove('creepy-mode');
        stopCreepyGrid();
        if (glitchAudio) {
            glitchAudio.pause();
            glitchAudio.currentTime = 0;
        }
        if (glitchAudio2) {
            glitchAudio2.pause();
            glitchAudio2.currentTime = 0;
        }
        if (glitchAudio3) {
            glitchAudio3.pause();
            glitchAudio3.currentTime = 0;
        }

        // Only loop if we've officially unlocked the full sequence by scrolling
        if (hasReachedMiddle) {
            scheduleNextGlitch();
        }
    }

    function scheduleNextGlitch() {
        if (nextGlitchTimerId) clearTimeout(nextGlitchTimerId);

        // Random time before next glitch: between 7s and 12s
        const nextTime = Math.random() * 5000 + 7000;

        nextGlitchTimerId = setTimeout(() => {
            const isLong = Math.random() < 0.4;
            // 40% chance for a long read (3s - 6s), 60% for a short scary flash (0.1s - 0.4s)
            const duration = isLong ? (Math.random() * 3000 + 3000) : (Math.random() * 300 + 100);

            if (!body.classList.contains('creepy-mode')) {
                if (isScrolling) {
                    queuedGlitchDuration = duration;
                } else {
                    triggerGlitch(duration);
                }
            }
        }, nextTime);
    }

    // Interaction handler to extend creepy-mode
    function handleInteraction() {
        if (body.classList.contains('creepy-mode')) {
            if (glitchTimeoutId) clearTimeout(glitchTimeoutId);

            // As long as the user interacts, we delay the end of the glitch by 1.2 seconds
            glitchTimeoutId = setTimeout(() => {
                endGlitch();
            }, 1200);
        }
    }

    // Listeners to maintain the creepy mode if active
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('touchmove', handleInteraction);

    let hasReachedMiddle = false;
    let isScrolling = false;
    let scrollDebounceTimer = null;
    let queuedGlitchDuration = null;

    function handleScrollEnd() {
        isScrolling = false;
        if (!body.classList.contains('creepy-mode') && queuedGlitchDuration !== null) {
            triggerGlitch(queuedGlitchDuration);
            queuedGlitchDuration = null;
        }
    }

    // Trigger glitch on scroll once middle is reached
    let lastScrollFlicker = 0;
    window.addEventListener('scroll', () => {
        isScrolling = true;
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
        scrollDebounceTimer = setTimeout(handleScrollEnd, 350);

        // Check if user scrolled to half of the page
        const scrolledHalf = window.scrollY > (document.body.scrollHeight / 2 - window.innerHeight / 2);

        if (!hasReachedMiddle && scrolledHalf) {
            hasReachedMiddle = true;
            // Initiate the very first long glitch 
            triggerGlitch(Math.random() * 3000 + 3000);
        }

        // Only allow random flickers AFTER reaching the middle
        if (hasReachedMiddle) {
            const now = Date.now();
            if (now - lastScrollFlicker > 5000 && Math.random() < 0.1) {
                lastScrollFlicker = now;
                if (!body.classList.contains('creepy-mode')) {
                    // very quick flash
                    triggerGlitch(150);
                }
            }
        }
    });

    const entryOverlay = document.getElementById('entry-overlay');
    const enterBtn = document.getElementById('enter-btn');

    enterBtn.addEventListener('click', () => {
        entryOverlay.classList.add('hidden');

        // Unlock audio context via direct hit
        function unlockAudio(audioElem) {
            if (audioElem) {
                audioElem.volume = 0; // Mute for proxy play
                audioElem.play().then(() => {
                    audioElem.pause();
                    audioElem.currentTime = 0;
                    audioElem.volume = 1; // Restore
                }).catch(e => console.log(e));
            }
        }
        
        unlockAudio(glitchAudio);
        unlockAudio(glitchAudio2);
        unlockAudio(glitchAudio3);

        body.style.overflow = 'auto'; // Re-enable scroll 

        // First transition: a very short flash just after clicking 
        setTimeout(() => {
            triggerGlitch(200);
        }, 400);
    });

});
