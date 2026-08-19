const menuBtn=document.querySelector(".menu-btn");
const nav=document.querySelector(".nav-links");

menuBtn?.addEventListener("click",()=>{
  nav.classList.toggle("open");
  if(nav.classList.contains("open")){
    nav.style.display="flex";
    nav.style.position="absolute";
    nav.style.top="82px";
    nav.style.left="0";
    nav.style.right="0";
    nav.style.padding="22px 8vw";
    nav.style.background="#f5f4ec";
    nav.style.flexDirection="column";
    nav.style.gap="18px";
  }else nav.style.display="";
});

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",()=>{
    if(nav?.classList.contains("open")){
      nav.classList.remove("open");
      nav.style.display="";
    }
  });
});

const revealItems=document.querySelectorAll(".style-card,.features > div,.quote-card");
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity="1";
      entry.target.style.transform="translateY(0)";
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});

revealItems.forEach(item=>{
  item.style.opacity="0";
  item.style.transform="translateY(20px)";
  item.style.transition="opacity .6s ease, transform .6s ease";
  observer.observe(item);
});

const navbar=document.querySelector(".navbar");
window.addEventListener("scroll",()=>{
  navbar.style.boxShadow=window.scrollY>30?"0 8px 30px rgba(0,0,0,.06)":"none";
});

console.log("KStudio Hijab berhasil dimuat ✨");


/* =========================================================
   AUTO SCROLL + KARAOKE READER
   - Starts after 2 seconds without user activity.
   - Scrolls at 2x the previous speed.
   - Reads page text with browser Speech Synthesis.
   - Highlights the spoken word like karaoke.
   - User interaction pauses everything and resets the timer.
   ========================================================= */
(() => {
  const INACTIVITY_DELAY = 2000;
  const SCROLL_SPEED = 1.8;       // 2x lebih cepat lagi (4x dari kecepatan awal)
  const TOP_RESET_DURATION = 450;
  const SPEECH_LANG = "id-ID";

  let inactivityTimer = null;
  let autoScrollFrame = null;
  let isAutoScrolling = false;
  let isResettingToTop = false;
  let speechQueue = [];
  let speechIndex = 0;
  let isSpeaking = false;
  let speechSession = 0;

  const readableSelectors = [
    ".hero .eyebrow",
    ".hero h1",
    ".hero-copy > p",
    ".mini-note strong",
    ".mini-note small",
    ".marquee div",
    ".section-heading .eyebrow",
    ".section-heading h2",
    ".section-heading > p",
    ".card-info h3",
    ".card-info p",
    ".card-info span",
    ".inspiration .eyebrow",
    ".quote-card p",
    ".quote-card small",
    ".inspiration-copy h2",
    ".inspiration-copy p",
    ".about-top .eyebrow",
    ".about-top h2",
    ".features h3",
    ".features p",
    "footer p"
  ];

  function prepareKaraokeText() {
    document.querySelectorAll(".karaoke-text").forEach(el => {
      el.querySelectorAll(".karaoke-word").forEach(word => {
        word.replaceWith(document.createTextNode(word.textContent));
      });
    });

    document.querySelectorAll(readableSelectors.join(",")).forEach(el => {
      if (el.dataset.karaokeReady === "true") return;
      el.dataset.karaokeReady = "true";
      el.classList.add("karaoke-text");

      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (node.parentElement?.closest(".karaoke-word")) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);

      nodes.forEach(textNode => {
        const text = textNode.nodeValue;
        const fragment = document.createDocumentFragment();

        // Keep whitespace while wrapping each spoken word.
        text.split(/(\s+)/).forEach(part => {
          if (/^\s+$/.test(part) || part === "") {
            fragment.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement("span");
            span.className = "karaoke-word";
            span.textContent = part;
            fragment.appendChild(span);
          }
        });

        textNode.parentNode.replaceChild(fragment, textNode);
      });
    });
  }

  function clearHighlight() {
    document.querySelectorAll(".karaoke-word.active").forEach(word => {
      word.classList.remove("active");
    });
  }

  function stopSpeech() {
    speechSession++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    isSpeaking = false;
    clearHighlight();
  }

  function buildSpeechQueue() {
    speechQueue = Array.from(
      document.querySelectorAll(".karaoke-text")
    ).filter(el => {
      const text = el.textContent.replace(/\s+/g, " ").trim();
      return text.length > 0 && !el.closest(".socials");
    });
  }

  function speakCurrentBlock(session) {
    if (session !== speechSession || !isAutoScrolling) return;

    if (speechIndex >= speechQueue.length) {
      speechIndex = 0;
    }

    const el = speechQueue[speechIndex];
    if (!el) return;

    clearHighlight();
    el.classList.add("karaoke-reading");

    const text = el.textContent.replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onboundary = event => {
      if (session !== speechSession || !isAutoScrolling) return;
      if (event.name !== "word") return;

      const spokenBefore = text.slice(0, event.charIndex);
      const wordIndex = spokenBefore.trim()
        ? spokenBefore.trim().split(/\s+/).length - 1
        : 0;

      const words = el.querySelectorAll(".karaoke-word");
      words.forEach(word => word.classList.remove("active"));

      const activeWord = words[wordIndex];
      if (activeWord) {
        activeWord.classList.add("active");

        // Keep the spoken text comfortably visible.
        const rect = activeWord.getBoundingClientRect();
        if (rect.top < 110 || rect.bottom > window.innerHeight - 80) {
          activeWord.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      }
    };

    utterance.onstart = () => {
      if (session === speechSession) isSpeaking = true;
    };

    utterance.onend = () => {
      if (session !== speechSession || !isAutoScrolling) return;

      clearHighlight();
      el.classList.remove("karaoke-reading");
      speechIndex++;
      setTimeout(() => speakCurrentBlock(session), 120);
    };

    utterance.onerror = () => {
      if (session !== speechSession || !isAutoScrolling) return;

      clearHighlight();
      el.classList.remove("karaoke-reading");
      speechIndex++;
      setTimeout(() => speakCurrentBlock(session), 120);
    };

    window.speechSynthesis.speak(utterance);
  }

  function startSpeech() {
    if (!("speechSynthesis" in window)) return;

    stopSpeech();
    buildSpeechQueue();

    if (!speechQueue.length) return;

    speechIndex = 0;
    const session = speechSession;
    setTimeout(() => speakCurrentBlock(session), 150);
  }

  function stopAutoScroll() {
    if (autoScrollFrame !== null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
    isAutoScrolling = false;
    stopSpeech();
  }

  function startAutoScroll() {
    if (isResettingToTop || isAutoScrolling) return;

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 5) return;

    isAutoScrolling = true;
    // Suara pembaca dinonaktifkan.

    const step = () => {
      if (!isAutoScrolling) return;

      const current = window.scrollY;
      const bottom =
        document.documentElement.scrollHeight - window.innerHeight;

      if (current >= bottom - 2) {
        isAutoScrolling = false;
        autoScrollFrame = null;
        stopSpeech();
        quicklyReturnToTop();
        return;
      }

      window.scrollBy(0, SCROLL_SPEED);
      autoScrollFrame = requestAnimationFrame(step);
    };

    autoScrollFrame = requestAnimationFrame(step);
  }

  function quicklyReturnToTop() {
    if (isResettingToTop) return;

    isResettingToTop = true;
    stopSpeech();

    const startY = window.scrollY;
    const startTime = performance.now();

    function animateTop(now) {
      const progress = Math.min(
        (now - startTime) / TOP_RESET_DURATION,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animateTop);
      } else {
        window.scrollTo(0, 0);
        isResettingToTop = false;
        resetInactivityTimer();
      }
    }

    requestAnimationFrame(animateTop);
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    stopAutoScroll();

    inactivityTimer = setTimeout(() => {
      startAutoScroll();
    }, INACTIVITY_DELAY);
  }

  // Prepare the text once the page is loaded.
  prepareKaraokeText();

  const activityEvents = [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "touchmove",
    "keydown"
  ];

  activityEvents.forEach(eventName => {
    window.addEventListener(
      eventName,
      resetInactivityTimer,
      { passive: true }
    );
  });

  window.addEventListener("focus", resetInactivityTimer);
  window.addEventListener("resize", resetInactivityTimer);

  // User can also click any link/button and the reader will pause.
  document.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("click", resetInactivityTimer);
  });

  resetInactivityTimer();
})();
