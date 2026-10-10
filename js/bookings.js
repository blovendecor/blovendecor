/* =========================================================
   BLOVEN DECOR
   PRIVATE CONTROL
   BOOKINGS
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

    const sidebar =
        document.getElementById("adminSidebar");

    const collapseButton =
        document.getElementById("sidebarCollapse");

    const signOutButton =
        document.getElementById("signOutButton");

    const searchInput =
        document.getElementById("bookingSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const eventFilter =
        document.getElementById("eventFilter");

    const resetButton =
        document.getElementById("resetFilters");

    const tableBody =
        document.getElementById("bookingsTableBody");

    const mobileList =
        document.getElementById("bookingsMobileList");


    /* =====================================================
       STATE
    ===================================================== */

    let bookings = [];

    let clients = [];

    let payments = [];


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (collapseButton && sidebar) {

        collapseButton.addEventListener("click", (event) => {

            event.stopPropagation();

            sidebar.classList.toggle("expanded");

        });

    }


    /* =====================================================
       SIGN OUT
    ===================================================== */

    if (signOutButton) {

        signOutButton.addEventListener("click", async () => {

            await supabaseClient.auth.signOut();

            window.location.href = "index.html";

        });

    }


    /* =====================================================
       DATE
    ===================================================== */

    function updateDate() {

        const dateElement =
            document.getElementById("bookingsDate");

        if (!dateElement) return;


        const now = new Date();


        dateElement.textContent =
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
       AUTHENTICATION
    ===================================================== */

    async function checkAuthentication() {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            window.location.href = "index.html";

            return false;

        }


        if (!data.session) {

            window.location.href = "index.html";

            return false;

        }


        return true;

    }


    /* =====================================================
       LOAD BOOKINGS
    ===================================================== */

    async function loadBookings() {

        const {
            data,
            error
        } = await supabaseClient
            .from("bookings")
            .select(`
                id,
                booking_id,
                client_id,
                event_type,
                event_name,
                event_date,
                event_time,
                venue,
                guest_count,
                status,
                budget,
                notes,
                total_amount,
                created_at,
                updated_at
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Bookings error:",
                error
            );

            showTableError(
                "Unable to load bookings."
            );

            return;

        }


        bookings = data || [];

    }


    /* =====================================================
       LOAD CLIENTS
    ===================================================== */

    async function loadClients() {

        const {
            data,
            error
        } = await supabaseClient
            .from("clients")
            .select(`
                id,
                full_name,
                phone,
                email,
                company
            `);


        if (error) {

            console.error(
                "Clients error:",
                error
            );

            clients = [];

            return;

        }


        clients = data || [];

    }


    /* =====================================================
       LOAD PAYMENTS
    ===================================================== */

    async function loadPayments() {

        const {
            data,
            error
        } = await supabaseClient
            .from("payments")
            .select(`
                id,
                booking_id,
                payment_type,
                amount,
                payment_date,
                payment_method,
                reference,
                notes,
                created_at
            `)
            .order(
                "payment_date",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Payments error:",
                error
            );

            payments = [];

            return;

        }


        payments = data || [];

    }


    /* =====================================================
       CLIENT
    ===================================================== */

    function getClient(clientId) {

        return clients.find(
            client =>
                String(client.id) ===
                String(clientId)
        ) || null;

    }


    /* =====================================================
       RECEIVED
    ===================================================== */

    function getReceived(bookingId) {

        return payments
            .filter(
                payment =>
                    String(payment.booking_id) ===
                    String(bookingId)
            )
            .reduce(
                (
                    total,
                    payment
                ) => {

                    return total +
                        Number(payment.amount || 0);

                },
                0
            );

    }


    /* =====================================================
       TOTAL AGREED
    ===================================================== */

    function getAgreed(booking) {

        return Number(
            booking.total_amount || 0
        );

    }


    /* =====================================================
       BALANCE
    ===================================================== */

    function getBalance(booking) {

        const agreed =
            getAgreed(booking);

        const received =
            getReceived(booking.id);

        return Math.max(
            agreed - received,
            0
        );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(status) {

        return String(
            status || "NEW"
        )
            .trim()
            .toUpperCase();

    }


    function getEffectiveStatus(booking) {

        const databaseStatus =
            normalizeStatus(
                booking.status
            );


        const agreed =
            getAgreed(booking);

        const received =
            getReceived(booking.id);


        if (
            agreed > 0 &&
            received >= agreed
        ) {

            return "FULLY PAID";

        }


        if (
            received > 0 &&
            received < agreed
        ) {

            if (
                databaseStatus === "CONFIRMED" ||
                databaseStatus === "FULLY PAID"
            ) {

                return "PARTIALLY PAID";

            }

        }


        return databaseStatus;

    }


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(amount) {

        return "UGX " +
            Number(
                amount || 0
            ).toLocaleString(
                "en-UG"
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


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

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
       STATUS CLASS
    ===================================================== */

    function statusClass(status) {

        return normalizeStatus(status)
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
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
       RENDER STATS
    ===================================================== */

    function renderStats() {

        const total =
            bookings.length;


        const newBookings =
            bookings.filter(
                booking =>
                    getEffectiveStatus(
                        booking
                    ) === "NEW"
            ).length;


        const confirmed =
            bookings.filter(
                booking => {

                    const status =
                        getEffectiveStatus(
                            booking
                        );

                    return (
                        status === "CONFIRMED" ||
                        status === "PARTIALLY PAID" ||
                        status === "FULLY PAID"
                    );

                }
            ).length;


        const outstanding =
            bookings.reduce(
                (
                    total,
                    booking
                ) => {

                    return total +
                        getBalance(
                            booking
                        );

                },
                0
            );


        document.getElementById(
            "bookingTotal"
        ).textContent = total;


        document.getElementById(
            "bookingNew"
        ).textContent = newBookings;


        document.getElementById(
            "bookingConfirmed"
        ).textContent = confirmed;


        document.getElementById(
            "bookingOutstanding"
        ).textContent =
            formatMoney(
                outstanding
            );

    }


    /* =====================================================
       FILTER BOOKINGS
    ===================================================== */

    function getFilteredBookings() {

        const search =
            String(
                searchInput?.value || ""
            )
                .trim()
                .toLowerCase();


        const selectedStatus =
            statusFilter?.value || "all";


        const selectedEvent =
            eventFilter?.value || "all";


        return bookings.filter(
            booking => {


                const client =
                    getClient(
                        booking.client_id
                    );


                const clientName =
                    client?.full_name || "";


                const clientPhone =
                    client?.phone || "";


                const bookingId =
                    booking.booking_id || "";


                const eventName =
                    booking.event_name || "";


                const eventType =
                    booking.event_type || "";


                const searchable =
                    [
                        clientName,
                        clientPhone,
                        bookingId,
                        eventName,
                        eventType,
                        booking.venue || ""
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const effectiveStatus =
                    getEffectiveStatus(
                        booking
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    effectiveStatus ===
                    selectedStatus;


                const matchesEvent =
                    selectedEvent === "all" ||
                    String(
                        eventType
                    ).toLowerCase() ===
                    String(
                        selectedEvent
                    ).toLowerCase();


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesEvent
                );

            }
        );

    }


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderBookings() {

        const filtered =
            getFilteredBookings();


        const resultCount =
            document.getElementById(
                "bookingResultCount"
            );


        if (resultCount) {

            resultCount.textContent =
                `${filtered.length} ${
                    filtered.length === 1
                        ? "booking"
                        : "bookings"
                }`;

        }


        if (!filtered.length) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="table-empty"
                    >
                        <strong>
                            No bookings found.
                        </strong>

                        Try changing your search
                        or filters.
                    </td>
                </tr>
            `;


            mobileList.innerHTML = `
                <div class="table-empty">
                    <strong>
                        No bookings found.
                    </strong>

                    Try changing your search
                    or filters.
                </div>
            `;


            return;

        }


        tableBody.innerHTML =
            filtered
                .map(
                    booking =>
                        createTableRow(
                            booking
                        )
                )
                .join("");


        mobileList.innerHTML =
            filtered
                .map(
                    booking =>
                        createMobileCard(
                            booking
                        )
                )
                .join("");

    }


    /* =====================================================
       TABLE ROW
    ===================================================== */

    function createTableRow(booking) {

        const client =
            getClient(
                booking.client_id
            );


        const clientName =
            client?.full_name ||
            "Unknown client";


        const clientPhone =
            client?.phone ||
            "";


        const eventName =
            booking.event_name ||
            "Untitled event";


        const eventType =
            booking.event_type ||
            "Other";


        const agreed =
            getAgreed(
                booking
            );


        const received =
            getReceived(
                booking.id
            );


        const balance =
            getBalance(
                booking
            );


        const status =
            getEffectiveStatus(
                booking
            );


        return `
            <tr>

                <td>
                    <span class="booking-id">
                        ${escapeHtml(
                            booking.booking_id ||
                            "—"
                        )}
                    </span>
                </td>


                <td>

                    <span class="booking-client">
                        ${escapeHtml(
                            clientName
                        )}
                    </span>

                    ${
                        clientPhone
                            ? `
                                <span class="booking-client-contact">
                                    ${escapeHtml(
                                        clientPhone
                                    )}
                                </span>
                            `
                            : ""
                    }

                </td>


                <td>

                    <span class="booking-event-name">
                        ${escapeHtml(
                            eventName
                        )}
                    </span>

                    <span class="booking-event-type">
                        ${escapeHtml(
                            eventType
                        )}
                    </span>

                </td>


                <td>

                    <span class="booking-date">
                        ${formatDate(
                            booking.event_date
                        )}
                    </span>

                </td>


                <td>

                    <span class="money-cell">
                        ${formatMoney(
                            agreed
                        )}
                    </span>

                </td>


                <td>

                    <span class="money-cell">
                        ${formatMoney(
                            received
                        )}
                    </span>

                </td>


                <td>

                    <span class="money-cell balance">
                        ${formatMoney(
                            balance
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="
                            booking-status
                            ${statusClass(
                                status
                            )}
                        "
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </td>


                <td>

                    <a
                        href="booking.html?id=${encodeURIComponent(
                            booking.id
                        )}"
                        class="booking-view"
                        title="View booking"
                    >
                        ↗
                    </a>

                </td>

            </tr>
        `;

    }


    /* =====================================================
       MOBILE CARD
    ===================================================== */

    function createMobileCard(booking) {

        const client =
            getClient(
                booking.client_id
            );


        const clientName =
            client?.full_name ||
            "Unknown client";


        const eventName =
            booking.event_name ||
            "Untitled event";


        const status =
            getEffectiveStatus(
                booking
            );


        const agreed =
            getAgreed(
                booking
            );


        const received =
            getReceived(
                booking.id
            );


        const balance =
            getBalance(
                booking
            );


        return `
            <article class="mobile-booking">


                <div class="mobile-booking-top">

                    <div>

                        <div class="mobile-booking-id">
                            ${escapeHtml(
                                booking.booking_id ||
                                "—"
                            )}
                        </div>

                        <div class="mobile-booking-client">
                            ${escapeHtml(
                                clientName
                            )}
                        </div>

                        <div class="mobile-booking-event">
                            ${escapeHtml(
                                eventName
                            )}
                            ·
                            ${formatDate(
                                booking.event_date
                            )}
                        </div>

                    </div>


                    <span
                        class="
                            booking-status
                            ${statusClass(
                                status
                            )}
                        "
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </div>


                <div class="mobile-booking-financials">


                    <div class="mobile-financial-item">

                        <span>
                            AGREED
                        </span>

                        <strong>
                            ${formatMoney(
                                agreed
                            )}
                        </strong>

                    </div>


                    <div class="mobile-financial-item">

                        <span>
                            RECEIVED
                        </span>

                        <strong>
                            ${formatMoney(
                                received
                            )}
                        </strong>

                    </div>


                    <div class="mobile-financial-item">

                        <span>
                            BALANCE
                        </span>

                        <strong>
                            ${formatMoney(
                                balance
                            )}
                        </strong>

                    </div>


                </div>


                <div class="mobile-booking-bottom">

                    <span class="booking-id">
                        ${escapeHtml(
                            booking.event_type ||
                            "Event"
                        )}
                    </span>


                    <a
                        href="booking.html?id=${encodeURIComponent(
                            booking.id
                        )}"
                        class="booking-view"
                        title="View booking"
                    >
                        ↗
                    </a>

                </div>


            </article>
        `;

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showTableError(message) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="table-loading"
                >
                    ${escapeHtml(
                        message
                    )}
                </td>
            </tr>
        `;


        mobileList.innerHTML = `
            <div class="table-loading">
                ${escapeHtml(
                    message
                )}
            </div>
        `;

    }


    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    searchInput?.addEventListener(
        "input",
        renderBookings
    );


    statusFilter?.addEventListener(
        "change",
        renderBookings
    );


    eventFilter?.addEventListener(
        "change",
        renderBookings
    );


    resetButton?.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            statusFilter.value = "all";

            eventFilter.value = "all";

            renderBookings();

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        updateDate();


        const authenticated =
            await checkAuthentication();


        if (!authenticated) {

            return;

        }


        try {

            await Promise.all([
                loadBookings(),
                loadClients(),
                loadPayments()
            ]);


            renderStats();

            renderBookings();

        }
        catch (error) {

            console.error(
                "Bookings initialization error:",
                error
            );

            showTableError(
                "Something went wrong while loading bookings."
            );

        }

    }


    initialize();

});