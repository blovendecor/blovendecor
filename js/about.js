/* =========================================================
   BLOVEN DECOR
   ABOUT PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loader =
        document.getElementById("pageLoader");

    const menuToggle =
        document.getElementById("menuToggle");

    const navigation =
        document.getElementById("siteNavigation");

    const currentYear =
        document.getElementById("currentYear");

    const revealElements =
        document.querySelectorAll(".reveal");


    /* =====================================================
       PAGE LOADER
    ===================================================== */

    window.addEventListener("load", () => {

        setTimeout(() => {

            loader?.classList.add("loaded");

        }, 450);

    });


    /* =====================================================
       YEAR
    ===================================================== */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       MOBILE / FULLSCREEN NAVIGATION
    ===================================================== */

    function openNavigation() {

        menuToggle?.classList.add("active");

        navigation?.classList.add("open");

        menuToggle?.setAttribute(
            "aria-expanded",
            "true"
        );

        navigation?.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";

    }


    function closeNavigation() {

        menuToggle?.classList.remove("active");

        navigation?.classList.remove("open");

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

        navigation?.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

    }


    menuToggle?.addEventListener(
        "click",
        () => {

            const isOpen =
                navigation.classList.contains("open");

            if (isOpen) {

                closeNavigation();

            } else {

                openNavigation();

            }

        }
    );


    /* =====================================================
       NAVIGATION LINKS
    ===================================================== */

    const navigationLinks =
        navigation?.querySelectorAll("a");

    navigationLinks?.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                closeNavigation();

            }
        );

    });


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                navigation?.classList.contains("open")
            ) {

                closeNavigation();

            }

        }
    );


    /* =====================================================
       REVEAL ON SCROLL
    ===================================================== */

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -50px 0px"
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(element);

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add("visible");

            }
        );

    }


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const heroImage =
        document.querySelector(
            ".about-hero-image"
        );


    if (
        heroImage &&
        window.matchMedia(
            "(min-width: 768px)"
        ).matches
    ) {

        let ticking = false;


        window.addEventListener(
            "scroll",
            () => {

                if (ticking) {
                    return;
                }

                window.requestAnimationFrame(
                    () => {

                        const scroll =
                            window.scrollY;

                        if (scroll < window.innerHeight) {

                            heroImage.style.transform =
                                `translateY(${scroll * 0.12}px) scale(1.02)`;

                        }

                        ticking = false;

                    }
                );

                ticking = true;

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       SMOOTH BACK TO TOP
    ===================================================== */

    const backToTop =
        document.querySelector(
            '.footer-bottom a[href="#"]'
        );


    backToTop?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* =====================================================
       IMAGE ERROR FALLBACK
    ===================================================== */

    const images =
        document.querySelectorAll(
            "img"
        );


    images.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.style.background =
                    "#d9d4ca";

            }
        );

    });

});