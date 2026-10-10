/* =========================================================
   BLOVEN DECOR
   PUBLIC BOOKING SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL = "https://drlecysiiyvvikjcpbby.supabase.co/";

    const SUPABASE_ANON_KEY = "sb_publishable_ruxhxAoa5c92fxg6rfQmSQ_Vh2hs82D";


    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form = document.getElementById("bookingForm");

    const submitButton =
        document.getElementById("bookingSubmit");

    const errorBox =
        document.getElementById("bookingError");

    const successBox =
        document.getElementById("bookingSuccess");

    const bookingReference =
        document.getElementById("bookingReference");


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (mobileMenuButton && mobileMenu) {

        mobileMenuButton.addEventListener("click", () => {

            mobileMenu.classList.toggle("active");

            document.body.classList.toggle("menu-open");

        });


        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    mobileMenu.classList.remove("active");

                    document.body.classList.remove("menu-open");

                });

            });

    }


    /* =====================================================
       MINIMUM EVENT DATE
    ===================================================== */

    const eventDate =
        document.getElementById("eventDate");


    if (eventDate) {

        const today = new Date();

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1).padStart(2, "0");

        const day =
            String(today.getDate()).padStart(2, "0");

        eventDate.min =
            `${year}-${month}-${day}`;

    }


    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    function clearError() {

        errorBox.textContent = "";

        errorBox.classList.remove("visible");

    }


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(message) {

        errorBox.textContent = message;

        errorBox.classList.add("visible");

        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    /* =====================================================
       BUTTON STATE
    ===================================================== */

    function setLoading(loading) {

        submitButton.disabled = loading;

        const text =
            submitButton.querySelector(".submit-text");

        const arrow =
            submitButton.querySelector(".submit-arrow");


        if (loading) {

            text.textContent = "SENDING REQUEST...";

            arrow.textContent = "…";

        } else {

            text.textContent = "SEND BOOKING REQUEST";

            arrow.textContent = "↗";

        }

    }


    /* =====================================================
       COLLECT SERVICES
    ===================================================== */

    function getSelectedServices() {

        return Array.from(
            document.querySelectorAll(
                'input[name="services"]:checked'
            )
        ).map(input => input.value);

    }


    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearError();


        /* ---------------------------------------------
           Basic validation
        --------------------------------------------- */

        const fullName =
            document.getElementById("fullName")
                .value
                .trim();


        const phone =
            document.getElementById("phone")
                .value
                .trim();


        const email =
            document.getElementById("email")
                .value
                .trim();


        const company =
            document.getElementById("company")
                .value
                .trim();


        const eventType =
            document.getElementById("eventType")
                .value;


        const eventName =
            document.getElementById("eventName")
                .value
                .trim();


        const selectedEventDate =
            document.getElementById("eventDate")
                .value;


        const eventTime =
            document.getElementById("eventTime")
                .value;


        const venue =
            document.getElementById("venue")
                .value
                .trim();


        const guestCountValue =
            document.getElementById("guestCount")
                .value;


        const guestCount =
            guestCountValue
                ? parseInt(guestCountValue, 10)
                : null;


        const budget =
            document.getElementById("budget")
                .value;


        const notes =
            document.getElementById("notes")
                .value
                .trim();


        const services =
            getSelectedServices();


        /* ---------------------------------------------
           Required fields
        --------------------------------------------- */

        if (!fullName) {

            showError(
                "Please enter your full name."
            );

            return;
        }


        if (!phone) {

            showError(
                "Please enter your phone number."
            );

            return;
        }


        if (!eventType) {

            showError(
                "Please select your event type."
            );

            return;
        }


        if (!selectedEventDate) {

            showError(
                "Please select your event date."
            );

            return;
        }


        if (!venue) {

            showError(
                "Please enter your venue or location."
            );

            return;
        }


        /* ---------------------------------------------
           Email validation
        --------------------------------------------- */

        if (email) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showError(
                    "Please enter a valid email address."
                );

                return;
            }

        }


        /* ---------------------------------------------
           Guest count validation
        --------------------------------------------- */

        if (
            guestCount !== null &&
            (
                Number.isNaN(guestCount) ||
                guestCount < 1
            )
        ) {

            showError(
                "Please enter a valid guest count."
            );

            return;
        }


        /* ---------------------------------------------
           Submit
        --------------------------------------------- */

        setLoading(true);


        try {

            const { data, error } =
                await supabaseClient.rpc(
                    "create_booking_request",
                    {
                        p_full_name: fullName,

                        p_phone: phone,

                        p_email:
                            email || null,

                        p_company:
                            company || null,

                        p_event_type:
                            eventType,

                        p_event_name:
                            eventName || null,

                        p_event_date:
                            selectedEventDate,

                        p_event_time:
                            eventTime || null,

                        p_venue:
                            venue,

                        p_guest_count:
                            guestCount,

                        p_budget:
                            budget || null,

                        p_notes:
                            notes || null,

                        p_services:
                            services
                    }
                );


            if (error) {

                console.error(
                    "Booking error:",
                    error
                );

                throw error;

            }


            /* -----------------------------------------
               Successful booking
            ------------------------------------------ */

            bookingReference.textContent =
                data;


            form.style.display = "none";

            successBox.hidden = false;


            successBox.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (error) {

            console.error(error);


            showError(
                "We couldn't send your booking request right now. Please try again or contact Bloven Decor directly."
            );

        } finally {

            setLoading(false);

        }

    });


});