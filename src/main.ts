// Hostly Main Script

function initAll() {
  initThemeSwitcher();
  initMobileMenu();
  initFaqAccordion();
  initStartForm();
  initRevenueCalculator();
  initTestimonialsSlider();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

// 0. INTERACTIVE THEME SWITCHER (Single Toggle Button: Slate vs Alpine Light)
function initThemeSwitcher() {
  const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
  let savedTheme = localStorage.getItem("hostly_theme");
  
  // Migrate any old "obsidian" theme or default to "titanium"
  if (!savedTheme || savedTheme === "obsidian") {
    savedTheme = "titanium";
  }

  function applyTheme(themeName: string) {
    // Apply data-theme attribute to html root
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("hostly_theme", themeName);

    // Update button visual state across desktop, mobile, and footer switchers
    toggleButtons.forEach((btn) => {
      const icon = btn.querySelector(".theme-toggle-icon");
      const label = btn.querySelector(".theme-toggle-label");
      const track = btn.querySelector(".theme-switch-track");
      const thumb = btn.querySelector(".theme-switch-thumb");

      if (themeName === "light") {
        if (icon) icon.textContent = "🕊️";
        if (label) label.textContent = "Alpine";
        if (track) {
          track.classList.remove("bg-slate-800", "border-slate-600");
          track.classList.add("bg-slate-700/80", "border-slate-500");
        }
        if (thumb) {
          thumb.classList.remove("translate-x-0", "bg-[#D4AF37]");
          thumb.classList.add("translate-x-4", "bg-slate-100");
        }
      } else {
        // titanium (Slate Executive Dark)
        if (icon) icon.textContent = "🌌";
        if (label) label.textContent = "Slate";
        if (track) {
          track.classList.remove("bg-slate-700/80", "border-slate-500");
          track.classList.add("bg-slate-800", "border-slate-600");
        }
        if (thumb) {
          thumb.classList.remove("translate-x-4", "bg-slate-100");
          thumb.classList.add("translate-x-0", "bg-[#D4AF37]");
        }
      }
    });
  }

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const current = localStorage.getItem("hostly_theme") || "titanium";
      const nextTheme = current === "light" ? "titanium" : "light";
      applyTheme(nextTheme);
    });
  });

  // Apply initially stored theme
  applyTheme(savedTheme);
}

// 1. MOBILE MENU TOGGLE
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });

    // Close mobile menu when clicking a link
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.add("hidden");
      });
    });
  }
}

// 2. FAQ ACCORDION
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-btn");
    const content = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    if (btn && content) {
      btn.addEventListener("click", () => {
        const isOpen = !content.classList.contains("hidden");

        // Close all accordion items
        document.querySelectorAll(".faq-answer").forEach((a) => a.classList.add("hidden"));
        document.querySelectorAll(".faq-icon").forEach((i) => (i.textContent = "+"));

        // Toggle clicked item
        if (!isOpen) {
          content.classList.remove("hidden");
          if (icon) icon.textContent = "−";
        }
      });
    }
  });
}

// 3. START WITH US FORM HANDLER
function initStartForm() {
  const form = document.getElementById("start-form") as HTMLFormElement;
  const successBox = document.getElementById("start-success");
  const submitBtn = document.getElementById("start-submit-btn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.textContent = "Connecting...";
        (submitBtn as HTMLButtonElement).disabled = true;
      }

      setTimeout(() => {
        form.classList.add("hidden");
        if (successBox) successBox.classList.remove("hidden");
        if (submitBtn) {
          submitBtn.textContent = "Submit Inquiry & Connect With Us";
          (submitBtn as HTMLButtonElement).disabled = false;
        }
        form.reset();
      }, 500);
    });
  }
}

// 4. INTERACTIVE REVENUE & SAVINGS CALCULATOR
function initRevenueCalculator() {
  const revInput = document.getElementById("calc-revenue") as HTMLInputElement;
  const propInput = document.getElementById("calc-properties") as HTMLInputElement;
  const directInput = document.getElementById("calc-direct-rate") as HTMLInputElement;
  const yieldInput = document.getElementById("calc-yield-boost") as HTMLInputElement;

  if (!revInput || !propInput || !directInput || !yieldInput) return;

  const dispRev = document.getElementById("display-revenue");
  const dispProp = document.getElementById("display-properties");
  const dispDirect = document.getElementById("display-direct-rate");
  const dispYield = document.getElementById("display-yield-boost");

  const resBaseline = document.getElementById("result-baseline");
  const resSaved = document.getElementById("result-saved");
  const resBoost = document.getElementById("result-boost");
  const resTotalAnnual = document.getElementById("result-total-annual");
  const resTotalMonthly = document.getElementById("result-total-monthly");

  function calculate() {
    const revPerProp = parseFloat(revInput.value) || 0;
    const props = parseInt(propInput.value, 10) || 1;
    const directRate = parseFloat(directInput.value) || 0;
    const yieldBoost = parseFloat(yieldInput.value) || 0;

    // Update displays
    if (dispRev) dispRev.textContent = `$${revPerProp.toLocaleString("en-US")}`;
    if (dispProp) dispProp.textContent = `${props} ${props === 1 ? "Property" : "Properties"}`;
    if (dispDirect) dispDirect.textContent = `${directRate}% Shift`;
    if (dispYield) dispYield.textContent = `+${yieldBoost}% ADR Boost`;

    // Calculations
    const annualBaseline = revPerProp * props * 12;
    const commissionSaved = annualBaseline * (directRate / 100) * 0.155;
    const yieldGain = annualBaseline * (yieldBoost / 100);
    const totalAnnual = commissionSaved + yieldGain;
    const totalMonthly = totalAnnual / 12;

    // Update results
    if (resBaseline) resBaseline.textContent = `$${Math.round(annualBaseline).toLocaleString("en-US")} / yr`;
    if (resSaved) resSaved.textContent = `+$${Math.round(commissionSaved).toLocaleString("en-US")} / yr`;
    if (resBoost) resBoost.textContent = `+$${Math.round(yieldGain).toLocaleString("en-US")} / yr`;
    if (resTotalAnnual) resTotalAnnual.textContent = `+$${Math.round(totalAnnual).toLocaleString("en-US")} / Year`;
    if (resTotalMonthly) resTotalMonthly.textContent = `+$${Math.round(totalMonthly).toLocaleString("en-US")} / Month`;

    // Dynamically update visual track progress fill on range sliders
    [revInput, propInput, directInput, yieldInput].forEach((slider) => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const percentage = Math.min(Math.max(((val - min) / (max - min)) * 100, 0), 100);
      slider.style.background = `linear-gradient(90deg, #E6C665 0%, #D4AF37 ${percentage}%, rgba(148, 163, 184, 0.2) ${percentage}%, rgba(148, 163, 184, 0.2) 100%)`;
    });
  }

  // Attach comprehensive event listeners for dynamic drag & touch updates across all browsers/devices
  const events = ["input", "change", "mousemove", "touchmove", "pointermove", "click", "keyup", "keydown"];
  [revInput, propInput, directInput, yieldInput].forEach((input) => {
    events.forEach((eventType) => {
      input.addEventListener(eventType, calculate, { passive: true });
    });
  });

  // Initial calculation
  calculate();
}

// 6. INTERACTIVE SLIDING TESTIMONIALS CAROUSEL (Pakistani Hosts)
function initTestimonialsSlider() {
  const track = document.getElementById("testimonials-track") as HTMLElement | null;
  const prevBtn = document.getElementById("test-prev-btn");
  const nextBtn = document.getElementById("test-next-btn");
  const indicator = document.getElementById("test-slide-indicator");
  const totalSpan = document.getElementById("test-slide-total");
  const dotsContainer = document.getElementById("test-dots-container");

  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.children) as HTMLElement[];
  const totalCards = cards.length;
  let currentIndex = 0;
  let autoPlayTimer: any = null;

  function getCardsPerView() {
    if (window.innerWidth >= 1024) return 3; // lg: 3 cards
    if (window.innerWidth >= 768) return 2;  // md: 2 cards
    return 1;                                // sm/mobile: 1 card
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - getCardsPerView());
  }

  function updateSlider() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIdx;

    const cardWidthPercent = 100 / getCardsPerView();
    track!.style.transform = `translateX(-${currentIndex * cardWidthPercent}%)`;

    if (indicator) indicator.textContent = (currentIndex + 1).toString();
    if (totalSpan) totalSpan.textContent = (maxIdx + 1).toString();

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.className = "w-7 h-2 rounded-full bg-[#D4AF37] transition-all duration-300 shadow-sm";
        } else {
          dot.className = "w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-500 cursor-pointer transition-all duration-300";
        }
      });
    }
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement("button");
      dot.className = i === currentIndex 
        ? "w-7 h-2 rounded-full bg-[#D4AF37] transition-all duration-300 shadow-sm" 
        : "w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-500 cursor-pointer transition-all duration-300";
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = i;
        updateSlider();
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function nextSlide() {
    currentIndex++;
    if (currentIndex > getMaxIndex()) currentIndex = 0;
    updateSlider();
  }

  function prevSlide() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = getMaxIndex();
    updateSlider();
  }

  function startAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, 4500);
  }

  function resetAutoPlay() {
    startAutoPlay();
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  track.addEventListener("mouseenter", () => {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  });

  track.addEventListener("mouseleave", () => {
    startAutoPlay();
  });

  // Touch & swipe support for mobile devices
  let startX = 0;
  let endX = 0;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
      resetAutoPlay();
    } else {
      startAutoPlay();
    }
  }, { passive: true });

  let resizeTimeout: any = null;
  window.addEventListener("resize", () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderDots();
      updateSlider();
    }, 150);
  });

  renderDots();
  updateSlider();
  startAutoPlay();
}

