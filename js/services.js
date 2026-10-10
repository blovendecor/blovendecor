/* =========================================================
   BLOVEN DECOR
   SERVICES PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       LOADER
    ===================================================== */

    const loader = document.getElementById("servicesLoader");

    const hideLoader = () => {

        if (!loader) return;

        loader.classList.add("hidden");

        setTimeout(() => {

            if (loader) {
                loader.remove();
            }

        }, 800);

    };

    window.addEventListener("load", hideLoader);

    setTimeout(hideLoader, 2200);


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (menuButton && mobileMenu) {

        const menuLinks =
            mobileMenu.querySelectorAll("a");


        const openMenu = () => {

            menuButton.classList.add("active");

            mobileMenu.classList.add("active");

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

            document.body.classList.add("menu-open");

        };


        const closeMenu = () => {

            menuButton.classList.remove("active");

            mobileMenu.classList.remove("active");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove("menu-open");

        };


        menuButton.addEventListener("click", () => {

            if (
                mobileMenu.classList.contains("active")
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        });


        menuLinks.forEach(link => {

            link.addEventListener(
                "click",
                closeMenu
            );

        });


        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });

    }


    /* =====================================================
       IMAGE LOADING
    ===================================================== */

    const images =
        document.querySelectorAll("img");


    images.forEach(image => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

        });

    });


    /* =====================================================
       SCROLL REVEALS
       
       Subtle opacity only.
       NO card movement.
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".services-introduction, " +
        ".service-feature, " +
        ".services-visual-break, " +
        ".secondary-service, " +
        ".services-closing"
    );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.08
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backTop =
        document.querySelector(
            ".footer-back-top"
        );


    if (backTop) {

        backTop.addEventListener(
            "click",
            event => {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener("resize", () => {

        if (
            window.innerWidth > 900 &&
            mobileMenu
        ) {

            mobileMenu.classList.remove(
                "active"
            );

            if (menuButton) {

                menuButton.classList.remove(
                    "active"
                );

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

            document.body.classList.remove(
                "menu-open"
            );

        }

    });

});