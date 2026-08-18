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
   AUTO SCROLL
   - Starts after 2 seconds without user activity.
   - Stops immediately when the user interacts.
   - Scrolls smoothly down at a slow, steady speed.
   - At the bottom, quickly returns to the top and repeats.
   ========================================================= */
(() => {
  const INACTIVITY_DELAY = 2000; // 2 seconds
  const SCROLL_SPEED = 0.45;     // pixels per animation frame (slow)
  const TOP_RESET_DURATION = 450; // quick return to top, in ms

  let inactivityTimer = null;
  let autoScrollFrame = null;
  let isAutoScrolling = false;
  let isResettingToTop = false;

  function stopAutoScroll() {
    if (autoScrollFrame !== null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
    isAutoScrolling = false;
  }

  function startAutoScroll() {
    if (isResettingToTop || isAutoScrolling) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // If the page is too short to scroll, there is nothing to do.
    if (maxScroll <= 5) return;

    isAutoScrolling = true;

    const step = () => {
      if (!isAutoScrolling) return;

      const current = window.scrollY;
      const bottom = document.documentElement.scrollHeight - window.innerHeight;

      if (current >= bottom - 2) {
        isAutoScrolling = false;
        autoScrollFrame = null;
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

    const startY = window.scrollY;
    const startTime = performance.now();

    function animateTop(now) {
      const progress = Math.min((now - startTime) / TOP_RESET_DURATION, 1);

      // Ease-out for a quick but smooth return.
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animateTop);
      } else {
        window.scrollTo(0, 0);
        isResettingToTop = false;

        // Wait another 2 seconds before starting downward again.
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

  // Any of these actions count as user activity.
  const activityEvents = [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "touchmove",
    "keydown"
  ];

  activityEvents.forEach(eventName => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });

  // Keyboard focus/navigation should also pause the auto-scroll.
  window.addEventListener("focus", resetInactivityTimer);
  window.addEventListener("resize", resetInactivityTimer);

  // Start the first 2-second inactivity countdown.
  resetInactivityTimer();
})();

