/* =========================================================
   BLOVEN DECOR
   PRIVATE CONTROL
   ADMIN AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://drlecysiiyvvikjcpbby.supabase.co/";


    const SUPABASE_ANON_KEY =
        "sb_publishable_ruxhxAoa5c92fxg6rfQmSQ_Vh2hs82D";


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loginForm =
        document.getElementById("adminLoginForm");


    const emailInput =
        document.getElementById("adminEmail");


    const passwordInput =
        document.getElementById("adminPassword");


    const loginButton =
        document.getElementById("adminLoginButton");


    const errorBox =
        document.getElementById("adminLoginError");


    const togglePassword =
        document.getElementById("togglePassword");


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(message) {

        errorBox.textContent = message;

        errorBox.classList.add("visible");

    }


    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    function clearError() {

        errorBox.textContent = "";

        errorBox.classList.remove("visible");

    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.textContent =
                isPassword
                    ? "HIDE"
                    : "SHOW";


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );


    /* =====================================================
       CHECK EXISTING SESSION
    ===================================================== */

    async function checkExistingSession() {

        const {
            data: {
                session
            }
        } = await supabaseClient
            .auth
            .getSession();


        if (session) {

            window.location.href =
                "dashboard.html";

        }

    }


    checkExistingSession();


    /* =====================================================
       LOGIN
    ===================================================== */

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearError();


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (!email) {

                showError(
                    "Please enter your email address."
                );

                return;

            }


            if (!password) {

                showError(
                    "Please enter your password."
                );

                return;

            }


            loginButton.disabled = true;


            loginButton.querySelector("span")
                .textContent = "SIGNING IN...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({
                            email,
                            password
                        });


                if (error) {

                    throw error;

                }


                if (!data.session) {

                    throw new Error(
                        "Login session could not be created."
                    );

                }


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                let message =
                    "Unable to sign in. Please check your details and try again.";


                if (
                    error.message &&
                    error.message
                        .toLowerCase()
                        .includes("invalid login")
                ) {

                    message =
                        "The email or password is incorrect.";

                }


                showError(message);


            } finally {

                loginButton.disabled = false;


                loginButton.querySelector("span")
                    .textContent = "SIGN IN";

            }

        }
    );


});