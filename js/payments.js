/* =========================================================
   BLOVEN ADMIN
   PAYMENTS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://drlecysiiyvvikjcpbby.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_ruxhxAoa5c92fxg6rfQmSQ_Vh2hs82D";


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );



    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar =
        document.getElementById("adminSidebar");

    const sidebarCollapse =
        document.getElementById("sidebarCollapse");

    const signOutButton =
        document.getElementById("signOutButton");

    const paymentsDate =
        document.getElementById("paymentsDate");

    const totalReceived =
        document.getElementById("totalReceived");

    const monthReceived =
        document.getElementById("monthReceived");

    const outstandingBalance =
        document.getElementById("outstandingBalance");

    const paymentCount =
        document.getElementById("paymentCount");

    const depositTotal =
        document.getElementById("depositTotal");

    const instalmentTotal =
        document.getElementById("instalmentTotal");

    const finalPaymentTotal =
        document.getElementById("finalPaymentTotal");

    const paymentSearch =
        document.getElementById("paymentSearch");

    const paymentTypeFilter =
        document.getElementById("paymentTypeFilter");

    const paymentMethodFilter =
        document.getElementById("paymentMethodFilter");

    const resetPaymentFilters =
        document.getElementById("resetPaymentFilters");

    const paymentLedgerCount =
        document.getElementById("paymentLedgerCount");

    const paymentsTableBody =
        document.getElementById("paymentsTableBody");

    const paymentsMobileList =
        document.getElementById("paymentsMobileList");



    /* =====================================================
       STATE
    ===================================================== */

    let payments = [];
    let bookings = [];
    let clients = [];



    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebarCollapse) {

        sidebarCollapse.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                sidebar.classList.toggle("expanded");

            }
        );

    }



    /* =====================================================
       SIGN OUT
    ===================================================== */

    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            async () => {

                await supabaseClient.auth.signOut();

                window.location.href = "index.html";

            }
        );

    }



    /* =====================================================
       DATE
    ===================================================== */

    function renderDate() {

        const now = new Date();

        paymentsDate.textContent =
            now.toLocaleDateString(
                "en-UG",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }



    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatUGX(amount) {

        const value =
            Number(amount || 0);

        return (
            "UGX " +
            value.toLocaleString(
                "en-UG",
                {
                    maximumFractionDigits: 0
                }
            )
        );

    }



    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-UG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }



    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }



    /* =====================================================
       GET CLIENT
    ===================================================== */

    function getClient(booking) {

        if (!booking) {
            return null;
        }

        return clients.find(
            client =>
                client.id === booking.client_id
        ) || null;

    }



    /* =====================================================
       GET BOOKING
    ===================================================== */

    function getBooking(payment) {

        if (!payment) {
            return null;
        }

        return bookings.find(
            booking =>
                booking.id === payment.booking_id
        ) || null;

    }



    /* =====================================================
       LOAD DATA
    ===================================================== */

    async function loadPayments() {

        try {

            const [
                clientsResponse,
                bookingsResponse,
                paymentsResponse
            ] = await Promise.all([

                supabaseClient
                    .from("clients")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),

                supabaseClient
                    .from("bookings")
                    .select("*")
                    .order(
                        "event_date",
                        {
                            ascending: true
                        }
                    ),

                supabaseClient
                    .from("payments")
                    .select("*")
                    .order(
                        "payment_date",
                        {
                            ascending: false
                        }
                    )

            ]);


            if (clientsResponse.error) {
                throw clientsResponse.error;
            }

            if (bookingsResponse.error) {
                throw bookingsResponse.error;
            }

            if (paymentsResponse.error) {
                throw paymentsResponse.error;
            }


            clients =
                clientsResponse.data || [];

            bookings =
                bookingsResponse.data || [];

            payments =
                paymentsResponse.data || [];


            renderOverview();
            renderPayments();


        } catch (error) {

            console.error(
                "Payments loading error:",
                error
            );

            showError(
                error.message ||
                "Unable to load payment records."
            );

        }

    }



    /* =====================================================
       OVERVIEW
    ===================================================== */

    function renderOverview() {

        let received = 0;
        let currentMonth = 0;

        let deposits = 0;
        let instalments = 0;
        let finalPayments = 0;


        const now = new Date();

        const currentMonthNumber =
            now.getMonth();

        const currentYear =
            now.getFullYear();


        payments.forEach(payment => {

            const amount =
                Number(payment.amount || 0);

            received += amount;


            const paymentDate =
                payment.payment_date
                    ? new Date(payment.payment_date)
                    : null;


            if (
                paymentDate &&
                !Number.isNaN(
                    paymentDate.getTime()
                ) &&
                paymentDate.getMonth() === currentMonthNumber &&
                paymentDate.getFullYear() === currentYear
            ) {

                currentMonth += amount;

            }


            const type =
                normalize(
                    payment.payment_type
                );


            if (type === "deposit") {

                deposits += amount;

            } else if (
                type === "instalment" ||
                type === "installment"
            ) {

                instalments += amount;

            } else if (
                type === "final payment" ||
                type === "final"
            ) {

                finalPayments += amount;

            }

        });


        let outstanding = 0;


        bookings.forEach(booking => {

            const status =
                normalize(
                    booking.status
                );

            if (status === "cancelled") {
                return;
            }


            const agreed =
                Number(
                    booking.total_amount || 0
                );


            const bookingPayments =
                payments.filter(
                    payment =>
                        payment.booking_id === booking.id
                );


            const paid =
                bookingPayments.reduce(
                    (sum, payment) =>
                        sum +
                        Number(
                            payment.amount || 0
                        ),
                    0
                );


            const balance =
                Math.max(
                    agreed - paid,
                    0
                );


            outstanding += balance;

        });


        totalReceived.textContent =
            formatUGX(received);

        monthReceived.textContent =
            formatUGX(currentMonth);

        outstandingBalance.textContent =
            formatUGX(outstanding);

        paymentCount.textContent =
            payments.length.toLocaleString(
                "en-UG"
            );

        depositTotal.textContent =
            formatUGX(deposits);

        instalmentTotal.textContent =
            formatUGX(instalments);

        finalPaymentTotal.textContent =
            formatUGX(finalPayments);

    }



    /* =====================================================
       FILTER PAYMENTS
    ===================================================== */

    function getFilteredPayments() {

        const search =
            normalize(
                paymentSearch.value
            );

        const type =
            normalize(
                paymentTypeFilter.value
            );

        const method =
            normalize(
                paymentMethodFilter.value
            );


        return payments.filter(payment => {

            const booking =
                getBooking(payment);

            const client =
                getClient(booking);


            const searchable = [

                payment.payment_type,

                payment.payment_method,

                payment.reference,

                payment.notes,

                booking?.booking_id,

                booking?.event_name,

                booking?.event_type,

                client?.full_name,

                client?.phone,

                client?.email

            ]
                .map(normalize)
                .join(" ");


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesType =
                !type ||
                normalize(
                    payment.payment_type
                ) === type;


            const matchesMethod =
                !method ||
                normalize(
                    payment.payment_method
                ) === method;


            return (
                matchesSearch &&
                matchesType &&
                matchesMethod
            );

        });

    }



    /* =====================================================
       RENDER PAYMENTS
    ===================================================== */

    function renderPayments() {

        const filtered =
            getFilteredPayments();


        paymentLedgerCount.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "payment"
                    : "payments"
            }`;


        renderDesktopPayments(filtered);

        renderMobilePayments(filtered);

    }



    /* =====================================================
       DESKTOP TABLE
    ===================================================== */

    function renderDesktopPayments(list) {

        if (!list.length) {

            paymentsTableBody.innerHTML = `

                <tr>

                    <td colspan="8">

                        <div class="payment-empty">
                            No payment records match your filters.
                        </div>

                    </td>

                </tr>

            `;

            return;

        }


        paymentsTableBody.innerHTML =
            list.map(payment => {

                const booking =
                    getBooking(payment);

                const client =
                    getClient(booking);


                const clientName =
                    client?.full_name ||
                    "Unknown client";


                const bookingReference =
                    booking?.booking_id ||
                    "—";


                const eventName =
                    booking?.event_name ||
                    booking?.event_type ||
                    "Event";


                const paymentType =
                    payment.payment_type ||
                    "Other";


                const paymentMethod =
                    payment.payment_method ||
                    "—";


                const reference =
                    payment.reference ||
                    "—";


                return `

                    <tr>

                        <td class="payment-date">
                            ${formatDate(
                                payment.payment_date
                            )}
                        </td>


                        <td>

                            <div class="payment-client">

                                <strong>
                                    ${escapeHTML(
                                        clientName
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        client?.phone ||
                                        client?.email ||
                                        "No contact"
                                    )}
                                </span>

                            </div>

                        </td>


                        <td>

                            <div class="payment-booking">

                                <strong>
                                    ${escapeHTML(
                                        bookingReference
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        eventName
                                    )}
                                </span>

                            </div>

                        </td>


                        <td>

                            <span class="payment-type">
                                ${escapeHTML(
                                    paymentType
                                )}
                            </span>

                        </td>


                        <td>

                            <span class="payment-method">
                                ${escapeHTML(
                                    paymentMethod
                                )}
                            </span>

                        </td>


                        <td>

                            <span class="payment-amount">
                                ${formatUGX(
                                    payment.amount
                                )}
                            </span>

                        </td>


                        <td>

                            <span class="payment-reference">
                                ${escapeHTML(
                                    reference
                                )}
                            </span>

                        </td>


                        <td>

                            ${
                                booking
                                    ? `
                                        <a
                                            href="booking.html?id=${encodeURIComponent(
                                                booking.id
                                            )}"
                                            class="payment-view-button"
                                        >
                                            VIEW
                                        </a>
                                      `
                                    : "—"
                            }

                        </td>

                    </tr>

                `;

            }).join("");

    }



    /* =====================================================
       MOBILE LIST
    ===================================================== */

    function renderMobilePayments(list) {

        if (!list.length) {

            paymentsMobileList.innerHTML = `

                <div class="payment-empty">
                    No payment records match your filters.
                </div>

            `;

            return;

        }


        paymentsMobileList.innerHTML =
            list.map(payment => {

                const booking =
                    getBooking(payment);

                const client =
                    getClient(booking);


                const clientName =
                    client?.full_name ||
                    "Unknown client";


                const eventName =
                    booking?.event_name ||
                    booking?.event_type ||
                    "Event";


                const reference =
                    payment.reference ||
                    "—";


                return `

                    <article class="payment-mobile-card">


                        <div class="payment-mobile-top">

                            <div class="payment-mobile-client">

                                <strong>
                                    ${escapeHTML(
                                        clientName
                                    )}
                                </strong>

                                <span>
                                    ${formatDate(
                                        payment.payment_date
                                    )}
                                </span>

                            </div>


                            <div class="payment-mobile-amount">

                                ${formatUGX(
                                    payment.amount
                                )}

                            </div>

                        </div>



                        <div class="payment-mobile-details">


                            <div class="payment-mobile-detail">

                                <span>
                                    BOOKING
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        booking?.booking_id ||
                                        "—"
                                    )}
                                </strong>

                            </div>


                            <div class="payment-mobile-detail">

                                <span>
                                    TYPE
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        payment.payment_type ||
                                        "Other"
                                    )}
                                </strong>

                            </div>


                            <div class="payment-mobile-detail">

                                <span>
                                    METHOD
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        payment.payment_method ||
                                        "—"
                                    )}
                                </strong>

                            </div>


                            <div class="payment-mobile-detail">

                                <span>
                                    REFERENCE
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        reference
                                    )}
                                </strong>

                            </div>


                            <div class="payment-mobile-detail">

                                <span>
                                    EVENT
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        eventName
                                    )}
                                </strong>

                            </div>

                        </div>



                        <div class="payment-mobile-footer">

                            ${
                                booking
                                    ? `
                                        <a
                                            href="booking.html?id=${encodeURIComponent(
                                                booking.id
                                            )}"
                                            class="payment-view-button"
                                        >
                                            VIEW BOOKING
                                        </a>
                                      `
                                    : ""
                            }

                        </div>


                    </article>

                `;

            }).join("");

    }



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       ERROR
    ===================================================== */

    function showError(message) {

        paymentsTableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="payment-empty">

                        ${escapeHTML(
                            message
                        )}

                    </div>

                </td>

            </tr>

        `;


        paymentsMobileList.innerHTML = `

            <div class="payment-empty">

                ${escapeHTML(
                    message
                )}

            </div>

        `;

    }



    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    paymentSearch.addEventListener(
        "input",
        renderPayments
    );


    paymentTypeFilter.addEventListener(
        "change",
        renderPayments
    );


    paymentMethodFilter.addEventListener(
        "change",
        renderPayments
    );


    resetPaymentFilters.addEventListener(
        "click",
        () => {

            paymentSearch.value = "";

            paymentTypeFilter.value = "";

            paymentMethodFilter.value = "";

            renderPayments();

        }
    );



    /* =====================================================
       AUTH
    ===================================================== */

    async function checkAuthentication() {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (
            error ||
            !data ||
            !data.session
        ) {

            window.location.href =
                "index.html";

            return false;

        }


        return true;

    }



    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        renderDate();


        const authenticated =
            await checkAuthentication();


        if (!authenticated) {
            return;
        }


        await loadPayments();

    }


    initialize();

});