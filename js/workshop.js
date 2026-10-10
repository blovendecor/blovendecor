/* =========================================================
   BLOVEN DECOR
   SERVICES PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       LOADER
    ===================================================== */

    const loader = document.getElementById("servicesLoader");

    function hideLoader() {

        if (!loader) return;

        loader.classList.add("hide");

    }

    if (document.readyState === "complete") {

        setTimeout(hideLoader, 400);

    } else {

        window.addEventListener("load", () => {

            setTimeout(hideLoader, 400);

        });

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const siteNavigation =
        document.getElementById("siteNavigation");

    const navigationLinks =
        document.querySelectorAll(
            ".navigation-links a"
        );


    function openNavigation() {

        if (!menuToggle || !siteNavigation) return;

        menuToggle.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        siteNavigation.classList.add("open");

        document.body.style.overflow = "hidden";

    }


    function closeNavigation() {

        if (!menuToggle || !siteNavigation) return;

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        siteNavigation.classList.remove("open");

        document.body.style.overflow = "";

    }


    if (menuToggle && siteNavigation) {

        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    siteNavigation.classList.contains(
                        "open"
                    );

                if (isOpen) {

                    closeNavigation();

                } else {

                    openNavigation();

                }

            }
        );

    }


    /* =====================================================
       CLOSE NAV WHEN LINK IS CLICKED
    ===================================================== */

    navigationLinks.forEach(link => {

        link.addEventListener("click", () => {

            closeNavigation();

        });

    });


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeNavigation();

            }

        }
    );


    /* =====================================================
       SERVICE CARD REVEAL
    ===================================================== */

    const serviceCards =
        document.querySelectorAll(
            ".service-card"
        );


    /*
     * Make sure cards are visible even if
     * IntersectionObserver is unavailable.
     */

    if (!("IntersectionObserver" in window)) {

        serviceCards.forEach(card => {

            card.classList.add("visible");

        });

    } else {

        const cardObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            cardObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.08,
                    rootMargin:
                        "0px 0px -50px 0px"
                }
            );


        serviceCards.forEach(
            (card, index) => {

                /*
                 * This only controls the
                 * appearance timing.
                 *
                 * It does NOT affect
                 * grid alignment.
                 */

                card.style.transitionDelay =
                    `${Math.min(
                        index * 0.05,
                        0.3
                    )}s`;

                cardObserver.observe(card);

            }
        );

    }


    /* =====================================================
       HERO IMAGE
    ===================================================== */

    const heroImage =
        document.querySelector(
            ".services-hero-image img"
        );


    /*
     * Very subtle desktop movement.
     * Disabled on mobile and reduced-motion.
     */

    if (
        heroImage &&
        window.matchMedia(
            "(min-width: 901px)"
        ).matches &&
        !window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        let ticking = false;


        function updateHeroImage() {

            const hero =
                document.querySelector(
                    ".services-hero"
                );

            if (!hero) return;

            const scrollY =
                window.scrollY;

            const heroHeight =
                hero.offsetHeight;


            if (scrollY <= heroHeight) {

                const movement =
                    Math.min(
                        scrollY * 0.055,
                        25
                    );

                heroImage.style.transform =
                    `translateY(${movement}px) scale(1.02)`;

            }

            ticking = false;

        }


        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {

                    window.requestAnimationFrame(
                        updateHeroImage
                    );

                    ticking = true;

                }

            },
            { passive: true }
        );

    }


    /* =====================================================
       IMAGE ERROR HANDLING
    ===================================================== */

    const allImages =
        document.querySelectorAll(
            ".service-card-image img"
        );


    allImages.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                /*
                 * Keeps the card visible even
                 * if an image path is wrong.
                 */

                image.style.display = "none";

            }
        );

    });


    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(resizeTimer);

            resizeTimer =
                setTimeout(() => {

                    if (
                        window.innerWidth > 1000
                    ) {

                        closeNavigation();

                    }

                }, 150);

        }
    );


    /* =====================================================
       INITIAL CARD CHECK
    ===================================================== */

    /*
     * If cards are already inside the viewport
     * when the page loads, reveal them.
     */

    setTimeout(() => {

        serviceCards.forEach(card => {

            const rect =
                card.getBoundingClientRect();

            if (
                rect.top <
                window.innerHeight * 0.95
            ) {

                card.classList.add(
                    "visible"
                );

            }

        });

    }, 100);

});