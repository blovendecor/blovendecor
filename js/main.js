/* =========================================================
   BLOVEN DECOR
   MAIN JAVASCRIPT
   EDITORIAL / VOGUE STYLE HERO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const slides = document.querySelectorAll(".hero-slide");

    const words = document.querySelectorAll(".hero-word");

    const currentSlide =
        document.getElementById("currentSlide");

    const menuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const kicker =
        document.querySelector(".hero-kicker");

    const description =
        document.querySelector(".hero-description");

    const readMore =
        document.querySelector(".read-more");


    /* =====================================================
       SLIDESHOW SETTINGS
    ===================================================== */

    let currentIndex = 0;

    let isAnimating = false;

    let slideshowTimer = null;

    const slideInterval = 6000;

    const fadeDuration = 1.4;


    /* =====================================================
       INITIAL SLIDE SETUP
    ===================================================== */

    slides.forEach((slide, index) => {

        gsap.set(slide, {
            opacity: index === 0 ? 1 : 0,
            zIndex: index === 0 ? 2 : 1
        });

    });


    /* =====================================================
       COUNTER
    ===================================================== */

    function updateCounter() {

        if (!currentSlide) return;

        currentSlide.textContent =
            String(currentIndex + 1).padStart(2, "0");

    }


    updateCounter();


    /* =====================================================
       CHANGE SLIDE
       SIMPLE EDITORIAL CROSSFADE
    ===================================================== */

    function changeSlide(nextIndex) {

        if (isAnimating) return;

        if (nextIndex === currentIndex) return;

        const current =
            slides[currentIndex];

        const next =
            slides[nextIndex];


        if (!current || !next) return;


        isAnimating = true;


        /* -------------------------------------------------
           STOP ANY EXISTING ANIMATIONS
        ------------------------------------------------- */

        gsap.killTweensOf([
            current,
            next
        ]);


        /* -------------------------------------------------
           PREPARE NEXT IMAGE
        ------------------------------------------------- */

        gsap.set(next, {
            opacity: 0,
            zIndex: 3
        });


        /* -------------------------------------------------
           CROSSFADE
        ------------------------------------------------- */

        gsap.to(next, {

            opacity: 1,

            duration: fadeDuration,

            ease: "power2.inOut",

            onComplete: () => {

                /* -----------------------------------------
                   COMPLETELY HIDE OLD IMAGE
                ----------------------------------------- */

                gsap.set(current, {
                    opacity: 0,
                    zIndex: 1
                });


                /* -----------------------------------------
                   KEEP NEW IMAGE VISIBLE
                ----------------------------------------- */

                gsap.set(next, {
                    opacity: 1,
                    zIndex: 2
                });


                /* -----------------------------------------
                   UPDATE INDEX
                ----------------------------------------- */

                currentIndex =
                    nextIndex;


                updateCounter();


                /* -----------------------------------------
                   ALLOW NEXT TRANSITION
                ----------------------------------------- */

                isAnimating = false;

            }

        });

    }


    /* =====================================================
       START SLIDESHOW
    ===================================================== */

    function startSlideshow() {

        stopSlideshow();


        if (slides.length < 2) {
            return;
        }


        slideshowTimer =
            setInterval(() => {

                const nextIndex =
                    (currentIndex + 1) %
                    slides.length;


                changeSlide(nextIndex);

            }, slideInterval);

    }


    /* =====================================================
       STOP SLIDESHOW
    ===================================================== */

    function stopSlideshow() {

        if (slideshowTimer !== null) {

            clearInterval(
                slideshowTimer
            );

            slideshowTimer = null;

        }

    }


    /* =====================================================
       START HERO SLIDESHOW
    ===================================================== */

    startSlideshow();


    /* =====================================================
       WORD-BY-WORD HERO TITLE
    ===================================================== */

    if (words.length) {

        gsap.set(words, {
            color: "#d3d3d3"
        });


        const textTimeline =
            gsap.timeline({
                delay: 0.9
            });


        words.forEach((word, index) => {

            textTimeline.to(
                word,
                {
                    color: "#111111",

                    duration: 0.22,

                    ease: "power1.out"
                },
                index === 0
                    ? 0
                    : "+=.12"
            );

        });

    }


    /* =====================================================
       HERO KICKER
    ===================================================== */

    if (kicker) {

        gsap.from(kicker, {

            opacity: 0,

            y: 20,

            duration: 0.8,

            delay: 0.25,

            ease: "power3.out"

        });

    }


    /* =====================================================
       HERO DESCRIPTION
    ===================================================== */

    if (description) {

        gsap.from(description, {

            opacity: 0,

            y: 20,

            duration: 0.9,

            delay: 2.6,

            ease: "power3.out"

        });

    }


    /* =====================================================
       READ MORE
    ===================================================== */

    if (readMore) {

        gsap.from(readMore, {

            opacity: 0,

            y: 15,

            duration: 1,

            delay: 2.9,

            ease: "power3.out"

        });

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {


            /* ---------------------------------------------
               NEXT
            --------------------------------------------- */

            if (event.key === "ArrowRight") {

                const nextIndex =
                    (currentIndex + 1) %
                    slides.length;


                changeSlide(nextIndex);


                startSlideshow();

            }


            /* ---------------------------------------------
               PREVIOUS
            --------------------------------------------- */

            if (event.key === "ArrowLeft") {

                const nextIndex =
                    (
                        currentIndex -
                        1 +
                        slides.length
                    ) %
                    slides.length;


                changeSlide(nextIndex);


                startSlideshow();

            }

        }
    );


    /* =====================================================
       PAUSE SLIDESHOW WHEN TAB IS HIDDEN
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                stopSlideshow();

            } else {

                startSlideshow();

            }

        }
    );


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    let menuOpen = false;


    if (menuButton && mobileMenu) {


        /* -------------------------------------------------
           OPEN / CLOSE MENU
        ------------------------------------------------- */

        menuButton.addEventListener(
            "click",
            () => {


                menuOpen =
                    !menuOpen;


                menuButton.classList.toggle(
                    "active",
                    menuOpen
                );


                mobileMenu.classList.toggle(
                    "open",
                    menuOpen
                );


                menuButton.setAttribute(
                    "aria-expanded",
                    String(menuOpen)
                );


                document.body.style.overflow =
                    menuOpen
                        ? "hidden"
                        : "";

            }
        );


        /* -------------------------------------------------
           MOBILE NAVIGATION LINKS
        ------------------------------------------------- */

        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {


                        menuOpen = false;


                        menuButton.classList.remove(
                            "active"
                        );


                        mobileMenu.classList.remove(
                            "open"
                        );


                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        document.body.style.overflow =
                            "";

                    }
                );

            });

    }


    /* =====================================================
       CLOSE MOBILE MENU WITH ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                menuOpen
            ) {

                menuOpen = false;


                menuButton.classList.remove(
                    "active"
                );


                mobileMenu.classList.remove(
                    "open"
                );


                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                document.body.style.overflow =
                    "";

            }

        }
    );


    /* =====================================================
       PREVENT HERO IMAGE DRAGGING
    ===================================================== */

    document
        .querySelectorAll(".hero-slide img")
        .forEach(image => {

            image.addEventListener(
                "dragstart",
                event => {

                    event.preventDefault();

                }
            );

        });


    /* =====================================================
       PRELOAD HERO IMAGES
       Prevents a blank frame when an image is reached.
    ===================================================== */

    document
        .querySelectorAll(".hero-slide img")
        .forEach(image => {

            const preload =
                new Image();

            preload.src =
                image.src;

        });


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "Bloven Decor — Hero initialized"
    );

});


































/* =========================================================
   BLOVEN DECOR
   BRAND INTRODUCTION IMAGE SEQUENCE
========================================================= */

const brandImages = document.querySelectorAll(".brand-image");

if (brandImages.length > 1) {

    let brandCurrent = 0;
    let brandAnimating = false;

    const brandHoldTime = 5;
    const brandTransitionTime = 1.35;


    /* -----------------------------------------------------
       INITIAL STATE
    ----------------------------------------------------- */

    brandImages.forEach((image, index) => {

        gsap.set(image, {
            opacity: index === 0 ? 1 : 0,
            visibility: index === 0 ? "visible" : "hidden"
        });

        const img = image.querySelector("img");

        if (img) {

            gsap.set(img, {
                scale: 1.04,
                yPercent: 0
            });

        }

    });


    /* -----------------------------------------------------
       SHOW NEXT IMAGE
    ----------------------------------------------------- */

    function showNextBrandImage() {

        if (brandAnimating) return;

        brandAnimating = true;

        const current = brandImages[brandCurrent];

        const nextIndex =
            (brandCurrent + 1) % brandImages.length;

        const next = brandImages[nextIndex];

        const currentImg =
            current.querySelector("img");

        const nextImg =
            next.querySelector("img");


        /* Prepare next image */

        gsap.set(next, {
            visibility: "visible",
            opacity: 0,
            zIndex: 2
        });

        gsap.set(current, {
            zIndex: 1
        });


        /*
         * Start the next photograph slightly
         * below the final position.
         */

        gsap.set(nextImg, {
            yPercent: 8,
            scale: 1.04
        });


        /* -------------------------------------------------
           NEXT IMAGE MOVES INTO PLACE
        ------------------------------------------------- */

        gsap.to(next, {
            opacity: 1,
            duration: brandTransitionTime,
            ease: "power2.inOut"
        });

        gsap.to(nextImg, {
            yPercent: 0,
            scale: 1,
            duration: brandTransitionTime,
            ease: "power3.out"
        });


        /* -------------------------------------------------
           OLD IMAGE LEAVES
        ------------------------------------------------- */

        gsap.to(current, {
            opacity: 0,
            duration: brandTransitionTime,
            ease: "power2.inOut",
            onComplete: () => {

                current.style.visibility = "hidden";

                brandCurrent = nextIndex;

                brandAnimating = false;

            }
        });

    }


    /* -----------------------------------------------------
       AUTOMATIC 5 SECOND SEQUENCE
    ----------------------------------------------------- */

    setInterval(() => {

        showNextBrandImage();

    }, brandHoldTime * 1000 + brandTransitionTime * 1000);

}






























/* =========================================================
   SERVICES CARD REVEAL
========================================================= */

const serviceCards = document.querySelectorAll(".service-card");

if (serviceCards.length && typeof gsap !== "undefined") {

    gsap.set(serviceCards, {
        opacity: 0,
        y: 45
    });

    serviceCards.forEach((card) => {

        const image = card.querySelector(".service-card-image img");
        const content = card.querySelector(".service-card-content");

        gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",

            scrollTrigger: {
                trigger: card,
                start: "top 82%",
                once: true
            }
        });

        if (image) {

            gsap.fromTo(
                image,
                {
                    scale: 1.08
                },
                {
                    scale: 1.01,
                    duration: 1.4,
                    ease: "power3.out",

                    scrollTrigger: {
                        trigger: card,
                        start: "top 82%",
                        once: true
                    }
                }
            );

        }

    });

}




















































/* =========================================================
   BLOVEN APPROACH ANIMATION
========================================================= */

const approachSection = document.querySelector(".approach-section");

if (approachSection && typeof gsap !== "undefined") {

    const approachTitle = approachSection.querySelector(".approach-title");
    const approachIntroCopy = approachSection.querySelector(".approach-intro-copy");
    const approachImage = approachSection.querySelector(".approach-feature-image");
    const approachStatement = approachSection.querySelector(".approach-feature-statement");
    const approachPrinciples = approachSection.querySelectorAll(".approach-principle");
    const approachFooter = approachSection.querySelector(".approach-footer");


    /* Intro */

    if (approachTitle) {
        gsap.from(approachTitle, {
            opacity: 0,
            y: 45,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: approachTitle,
                start: "top 82%",
                once: true
            }
        });
    }


    if (approachIntroCopy) {
        gsap.from(approachIntroCopy, {
            opacity: 0,
            y: 35,
            duration: 1,
            delay: .15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: approachIntroCopy,
                start: "top 82%",
                once: true
            }
        });
    }


    /* Feature image */

    if (approachImage) {

        gsap.fromTo(
            approachImage,
            {
                opacity: 0,
                y: 45
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: approachImage,
                    start: "top 78%",
                    once: true,
                    onEnter: () => {
                        approachImage.classList.add("is-visible");
                    }
                }
            }
        );

    }


    /* Statement */

    if (approachStatement) {

        gsap.from(approachStatement, {
            opacity: 0,
            y: 30,
            duration: .9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: approachStatement,
                start: "top 88%",
                once: true
            }
        });

    }


    /* Principles */

    approachPrinciples.forEach((principle) => {

        gsap.from(principle, {
            opacity: 0,
            y: 35,
            duration: .9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: principle,
                start: "top 88%",
                once: true
            }
        });

    });


    /* Footer CTA */

    if (approachFooter) {

        gsap.from(approachFooter, {
            opacity: 0,
            y: 35,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: approachFooter,
                start: "top 88%",
                once: true
            }
        });

    }

}


































/* =========================================================
   FINAL CTA
========================================================= */

const finalCTA = document.querySelector(".final-cta");

if (finalCTA && typeof gsap !== "undefined") {

    const finalCTAImage =
        finalCTA.querySelector(".final-cta-image img");

    const finalCTATitle =
        finalCTA.querySelector(".final-cta-title");

    const finalCTABottom =
        finalCTA.querySelector(".final-cta-bottom");


    /* -----------------------------------------------------
       IMAGE REVEAL
    ----------------------------------------------------- */

    if (finalCTAImage) {

        gsap.fromTo(
            finalCTAImage,

            {
                scale: 1.1
            },

            {
                scale: 1,
                duration: 1.8,
                ease: "power3.out",

                scrollTrigger: {
                    trigger: finalCTA,
                    start: "top 80%",
                    once: true
                }
            }
        );

    }


    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (finalCTATitle) {

        const titleLines =
            finalCTATitle.querySelectorAll("span");

        gsap.from(titleLines, {

            opacity: 0,
            y: 45,

            duration: 1.1,

            stagger: .12,

            ease: "power3.out",

            scrollTrigger: {
                trigger: finalCTA,
                start: "top 72%",
                once: true
            }

        });

    }


    /* -----------------------------------------------------
       BOTTOM CONTENT
    ----------------------------------------------------- */

    if (finalCTABottom) {

        gsap.from(finalCTABottom, {

            opacity: 0,
            y: 30,

            duration: 1,

            delay: .25,

            ease: "power3.out",

            scrollTrigger: {
                trigger: finalCTA,
                start: "top 70%",
                once: true
            }

        });

    }

}