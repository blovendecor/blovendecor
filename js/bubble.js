/* =========================================================
   BLOVEN DECOR
   FREE DRAG CONTACT BUBBLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const wrapper =
        document.getElementById("contactBubbleWrap");

    const bubble =
        document.getElementById("contactBubble");

    const options =
        document.getElementById("contactOptions");


    if (!wrapper || !bubble || !options) {
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let dragging = false;
    let moved = false;

    let pointerId = null;

    let startX = 0;
    let startY = 0;

    let offsetX = 0;
    let offsetY = 0;


    /* =====================================================
       HELPERS
    ===================================================== */

    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }


    function closeOptions() {

        wrapper.classList.remove("open");

        bubble.setAttribute(
            "aria-expanded",
            "false"
        );

        options.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function openOptions() {

        wrapper.classList.add("open");

        bubble.setAttribute(
            "aria-expanded",
            "true"
        );

        options.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function toggleOptions() {

        if (
            wrapper.classList.contains("open")
        ) {

            closeOptions();

        } else {

            openOptions();

        }

    }


    /* =====================================================
       SNAP TO NEAREST EDGE
    ===================================================== */

    function snapToEdge() {

        const rect =
            wrapper.getBoundingClientRect();


        const bubbleCenter =
            rect.left +
            rect.width / 2;


        const screenCenter =
            window.innerWidth / 2;


        wrapper.classList.remove(
            "edge-left",
            "edge-right"
        );


        if (bubbleCenter < screenCenter) {

            wrapper.style.left = "10px";
            wrapper.style.right = "auto";


            wrapper.classList.add(
                "edge-left"
            );

        } else {

            wrapper.style.right = "10px";
            wrapper.style.left = "auto";


            wrapper.classList.add(
                "edge-right"
            );

        }

    }


    /* =====================================================
       POINTER DOWN
    ===================================================== */

    bubble.addEventListener(
        "pointerdown",
        (event) => {

            dragging = true;
            moved = false;

            pointerId =
                event.pointerId;


            bubble.setPointerCapture(
                pointerId
            );


            const rect =
                wrapper.getBoundingClientRect();


            offsetX =
                event.clientX -
                rect.left;


            offsetY =
                event.clientY -
                rect.top;


            startX =
                event.clientX;


            startY =
                event.clientY;


            bubble.style.cursor =
                "grabbing";


            /*
             * Remove edge positioning while
             * the user is dragging.
             */

            wrapper.style.left =
                `${rect.left}px`;

            wrapper.style.top =
                `${rect.top}px`;

            wrapper.style.right =
                "auto";

            wrapper.style.bottom =
                "auto";


            wrapper.classList.remove(
                "edge-left",
                "edge-right"
            );


            /*
             * Close the contact menu
             * immediately when dragging begins.
             */

            closeOptions();


            event.preventDefault();

        }
    );


    /* =====================================================
       POINTER MOVE
    ===================================================== */

    bubble.addEventListener(
        "pointermove",
        (event) => {

            if (
                !dragging ||
                event.pointerId !== pointerId
            ) {

                return;

            }


            const distanceX =
                Math.abs(
                    event.clientX -
                    startX
                );


            const distanceY =
                Math.abs(
                    event.clientY -
                    startY
                );


            /*
             * Small movements still count
             * as a click.
             */

            if (
                distanceX > 4 ||
                distanceY > 4
            ) {

                moved = true;

            }


            if (!moved) {
                return;
            }


            /* ---------------------------------------------
               NEW POSITION
            --------------------------------------------- */

            let newX =
                event.clientX -
                offsetX;


            let newY =
                event.clientY -
                offsetY;


            /* ---------------------------------------------
               SCREEN BOUNDS
            --------------------------------------------- */

            const maxX =
                window.innerWidth -
                wrapper.offsetWidth;


            const maxY =
                window.innerHeight -
                wrapper.offsetHeight;


            newX =
                clamp(
                    newX,
                    0,
                    maxX
                );


            newY =
                clamp(
                    newY,
                    0,
                    maxY
                );


            /* ---------------------------------------------
               MOVE FREELY
            --------------------------------------------- */

            wrapper.style.left =
                `${newX}px`;

            wrapper.style.top =
                `${newY}px`;

            wrapper.style.right =
                "auto";

            wrapper.style.bottom =
                "auto";

        }
    );


    /* =====================================================
       POINTER UP
    ===================================================== */

    bubble.addEventListener(
        "pointerup",
        (event) => {

            if (
                event.pointerId !== pointerId
            ) {

                return;

            }


            dragging = false;

            pointerId = null;


            bubble.style.cursor =
                "grab";


            /*
             * If the user moved it,
             * snap it to the nearest edge.
             */

            if (moved) {

                snapToEdge();


            } else {

                /*
                 * If they didn't move it,
                 * this was simply a click.
                 */

                toggleOptions();

            }


            /*
             * Reset after pointer release.
             */

            setTimeout(() => {

                moved = false;

            }, 50);

        }
    );


    /* =====================================================
       POINTER CANCEL
    ===================================================== */

    bubble.addEventListener(
        "pointercancel",
        () => {

            dragging = false;

            pointerId = null;

            bubble.style.cursor =
                "grab";


            if (moved) {

                snapToEdge();

            }


            setTimeout(() => {

                moved = false;

            }, 50);

        }
    );


    /* =====================================================
       CLICK OUTSIDE
    ===================================================== */

    document.addEventListener(
        "pointerdown",
        (event) => {

            if (
                !wrapper.contains(event.target)
            ) {

                closeOptions();

            }

        }
    );


    /* =====================================================
       WINDOW RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            const rect =
                wrapper.getBoundingClientRect();


            const maxY =
                window.innerHeight -
                wrapper.offsetHeight;


            const currentY =
                clamp(
                    rect.top,
                    0,
                    maxY
                );


            wrapper.style.top =
                `${currentY}px`;


            /*
             * Keep it attached to whichever
             * edge it was already using.
             */

            if (
                wrapper.classList.contains(
                    "edge-left"
                )
            ) {

                wrapper.style.left =
                    "10px";

            } else if (
                wrapper.classList.contains(
                    "edge-right"
                )
            ) {

                wrapper.style.right =
                    "10px";

            }

        }
    );

});