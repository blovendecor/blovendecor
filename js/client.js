/* =========================================================
   BLOVEN DECOR
   PRIVATE CONTROL
   CLIENTS
========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://drlecysiiyvvikjcpbby.supabase.co";

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

    const sidebarCollapse =
        document.getElementById("sidebarCollapse");

    const signOutButton =
        document.getElementById("signOutButton");


    const clientsDate =
        document.getElementById("clientsDate");


    const totalClients =
        document.getElementById("totalClients");

    const activeClients =
        document.getElementById("activeClients");

    const totalAgreed =
        document.getElementById("totalAgreed");

    const totalReceived =
        document.getElementById("totalReceived");


    const clientSearch =
        document.getElementById("clientSearch");

    const resetClientSearch =
        document.getElementById("resetClientSearch");


    const clientsTableBody =
        document.getElementById("clientsTableBody");

    const clientsMobileList =
        document.getElementById("clientsMobileList");


    const clientDirectoryCount =
        document.getElementById(
            "clientDirectoryCount"
        );


    const returningClients =
        document.getElementById("returningClients");

    const clientOutstanding =
        document.getElementById("clientOutstanding");

    const latestClient =
        document.getElementById("latestClient");

    const latestClientDate =
        document.getElementById("latestClientDate");


    /* =====================================================
       STATE
    ===================================================== */

    let clients = [];

    let bookings = [];

    let payments = [];

    let filteredClients = [];


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebar && sidebarCollapse) {

        sidebarCollapse.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

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

                window.location.href =
                    "index.html";

            }
        );

    }


    /* =====================================================
       DATE
    ===================================================== */

    function updateDate() {

        if (!clientsDate) {
            return;
        }


        const now = new Date();


        clientsDate.textContent =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ).format(now);

    }


    updateDate();


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    async function checkAuthentication() {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


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
       FORMAT CURRENCY
    ===================================================== */

    function formatCurrency(
        amount
    ) {

        const value =
            Number(amount) || 0;


        return (
            "UGX " +
            new Intl.NumberFormat(
                "en-UG",
                {
                    maximumFractionDigits: 0
                }
            ).format(value)
        );

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(
        date
    ) {

        if (!date) {
            return "—";
        }


        const parsed =
            new Date(
                `${date}T00:00:00`
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return date;

        }


        return new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(parsed);

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

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
       LOAD DATA
    ===================================================== */

    async function loadClients() {

        clientsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="clients-loading"
                >
                    Loading clients...
                </td>
            </tr>
        `;


        clientsMobileList.innerHTML = `
            <div class="clients-loading">
                Loading clients...
            </div>
        `;


        try {


            const [
                clientsResult,
                bookingsResult,
                paymentsResult
            ] =
                await Promise.all([

                    supabaseClient
                        .from("clients")
                        .select(`
                            id,
                            full_name,
                            phone,
                            email,
                            company,
                            created_at
                        `)
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        ),


                    supabaseClient
                        .from("bookings")
                        .select(`
                            id,
                            booking_id,
                            client_id,
                            event_type,
                            event_name,
                            event_date,
                            status,
                            total_amount,
                            created_at
                        `)
                        .order(
                            "event_date",
                            {
                                ascending: true
                            }
                        ),


                    supabaseClient
                        .from("payments")
                        .select(`
                            id,
                            booking_id,
                            amount,
                            payment_date
                        `)

                ]);


            if (clientsResult.error) {
                throw clientsResult.error;
            }


            if (bookingsResult.error) {
                throw bookingsResult.error;
            }


            if (paymentsResult.error) {
                throw paymentsResult.error;
            }


            clients =
                clientsResult.data || [];


            bookings =
                bookingsResult.data || [];


            payments =
                paymentsResult.data || [];


            buildClientRecords();

            updateOverview();

            renderClients();

        }

        catch (error) {

            console.error(
                "Clients loading error:",
                error
            );


            clientsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="clients-loading"
                    >
                        Unable to load clients.
                    </td>
                </tr>
            `;


            clientsMobileList.innerHTML = `
                <div class="clients-empty">

                    <div class="clients-empty-mark">
                        !
                    </div>

                    <p>
                        Unable to load client data.
                    </p>

                </div>
            `;

        }

    }


    /* =====================================================
       BUILD CLIENT RECORDS
    ===================================================== */

    function buildClientRecords() {

        clients =
            clients.map(
                (client) => {


                    const clientBookings =
                        bookings.filter(
                            booking =>
                                String(
                                    booking.client_id
                                ) ===
                                String(
                                    client.id
                                )
                        );


                    const bookingIds =
                        clientBookings.map(
                            booking =>
                                booking.id
                        );


                    const clientPayments =
                        payments.filter(
                            payment =>
                                bookingIds.some(
                                    id =>
                                        String(id) ===
                                        String(
                                            payment.booking_id
                                        )
                                )
                        );


                    const agreed =
                        clientBookings.reduce(
                            (
                                total,
                                booking
                            ) =>
                                total +
                                (
                                    Number(
                                        booking.total_amount
                                    ) || 0
                                ),
                            0
                        );


                    const received =
                        clientPayments.reduce(
                            (
                                total,
                                payment
                            ) =>
                                total +
                                (
                                    Number(
                                        payment.amount
                                    ) || 0
                                ),
                            0
                        );


                    const balance =
                        Math.max(
                            agreed -
                            received,
                            0
                        );


                    const today =
                        new Date();


                    today.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    const upcomingBookings =
                        clientBookings.filter(
                            booking => {

                                if (
                                    !booking.event_date
                                ) {

                                    return false;

                                }


                                const eventDate =
                                    new Date(
                                        `${booking.event_date}T00:00:00`
                                    );


                                return (
                                    eventDate >=
                                    today &&
                                    booking.status !==
                                    "CANCELLED"
                                );

                            }
                        );


                    return {

                        ...client,

                        clientBookings,

                        clientPayments,

                        bookingCount:
                            clientBookings.length,

                        agreed,

                        received,

                        balance,

                        upcomingCount:
                            upcomingBookings.length

                    };

                }
            );

    }


    /* =====================================================
       OVERVIEW
    ===================================================== */

    function updateOverview() {

        const total =
            clients.length;


        const active =
            clients.filter(
                client =>
                    client.upcomingCount > 0
            ).length;


        const agreed =
            clients.reduce(
                (
                    total,
                    client
                ) =>
                    total +
                    client.agreed,
                0
            );


        const received =
            clients.reduce(
                (
                    total,
                    client
                ) =>
                    total +
                    client.received,
                0
            );


        const outstanding =
            clients.reduce(
                (
                    total,
                    client
                ) =>
                    total +
                    client.balance,
                0
            );


        const returning =
            clients.filter(
                client =>
                    client.bookingCount > 1
            ).length;


        totalClients.textContent =
            total;


        activeClients.textContent =
            active;


        totalAgreed.textContent =
            formatCurrency(
                agreed
            );


        totalReceived.textContent =
            formatCurrency(
                received
            );


        returningClients.textContent =
            returning;


        clientOutstanding.textContent =
            formatCurrency(
                outstanding
            );


        if (clients.length) {

            const newest =
                [...clients].sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b.created_at
                        ) -
                        new Date(
                            a.created_at
                        )
                )[0];


            latestClient.textContent =
                newest.full_name ||
                "Unnamed client";


            latestClientDate.textContent =
                `Added ${formatDate(
                    newest.created_at
                        ?.split("T")[0]
                )}`;

        }

        else {

            latestClient.textContent =
                "—";

            latestClientDate.textContent =
                "No clients yet.";

        }

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function getClientStatus(
        client
    ) {

        if (
            client.upcomingCount > 0 &&
            client.bookingCount > 1
        ) {

            return {
                label: "Returning",
                className:
                    "client-status-returning"
            };

        }


        if (
            client.upcomingCount > 0
        ) {

            return {
                label: "Active",
                className:
                    "client-status-active"
            };

        }


        return {
            label: "Past",
            className:
                "client-status-complete"
        };

    }


    /* =====================================================
       RENDER CLIENTS
    ===================================================== */

    function renderClients() {

        const query =
            (
                clientSearch.value ||
                ""
            )
                .trim()
                .toLowerCase();


        filteredClients =
            clients.filter(
                client => {

                    if (!query) {
                        return true;
                    }


                    const searchable = [

                        client.full_name,

                        client.phone,

                        client.email,

                        client.company

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        query
                    );

                }
            );


        clientDirectoryCount.textContent =
            `${filteredClients.length} ${
                filteredClients.length === 1
                    ? "client"
                    : "clients"
            }`;


        renderDesktopClients();

        renderMobileClients();

    }


    /* =====================================================
       DESKTOP TABLE
    ===================================================== */

    function renderDesktopClients() {

        if (
            !filteredClients.length
        ) {

            clientsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="clients-loading"
                    >
                        No clients found.
                    </td>
                </tr>
            `;

            return;

        }


        clientsTableBody.innerHTML =
            filteredClients
                .map(
                    client => {

                        const status =
                            getClientStatus(
                                client
                            );


                        return `

                            <tr>

                                <td
                                    class="client-name-cell"
                                >

                                    <span
                                        class="client-name"
                                    >
                                        ${escapeHTML(
                                            client.full_name ||
                                            "Unnamed client"
                                        )}
                                    </span>

                                    ${
                                        client.company
                                            ? `
                                                <span
                                                    class="client-company"
                                                >
                                                    ${escapeHTML(
                                                        client.company
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }

                                </td>


                                <td>

                                    <div
                                        class="client-contact"
                                    >

                                        ${
                                            client.phone
                                                ? `
                                                    <strong>
                                                        ${escapeHTML(
                                                            client.phone
                                                        )}
                                                    </strong>
                                                `
                                                : `
                                                    <strong>
                                                        —
                                                    </strong>
                                                `
                                        }

                                        ${
                                            client.email
                                                ? `
                                                    <span>
                                                        ${escapeHTML(
                                                            client.email
                                                        )}
                                                    </span>
                                                `
                                                : ""
                                        }

                                    </div>

                                </td>


                                <td>

                                    <span
                                        class="client-booking-count"
                                    >
                                        ${client.bookingCount}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="client-money"
                                    >
                                        ${formatCurrency(
                                            client.agreed
                                        )}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="client-money client-paid"
                                    >
                                        ${formatCurrency(
                                            client.received
                                        )}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="client-money ${
                                            client.balance > 0
                                                ? "client-balance"
                                                : "client-paid"
                                        }"
                                    >
                                        ${formatCurrency(
                                            client.balance
                                        )}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="client-status ${
                                            status.className
                                        }"
                                    >

                                        <span
                                            class="client-status-dot"
                                        ></span>

                                        ${status.label}

                                    </span>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       MOBILE CLIENTS
    ===================================================== */

    function renderMobileClients() {

        if (
            !filteredClients.length
        ) {

            clientsMobileList.innerHTML = `
                <div class="clients-empty">

                    <div class="clients-empty-mark">
                        —
                    </div>

                    <p>
                        No clients found.
                    </p>

                </div>
            `;

            return;

        }


        clientsMobileList.innerHTML =
            filteredClients
                .map(
                    client => {

                        const status =
                            getClientStatus(
                                client
                            );


                        return `

                            <article
                                class="mobile-client-card"
                            >


                                <div
                                    class="mobile-client-top"
                                >

                                    <div>

                                        <div
                                            class="mobile-client-name"
                                        >
                                            ${escapeHTML(
                                                client.full_name ||
                                                "Unnamed client"
                                            )}
                                        </div>

                                        ${
                                            client.company
                                                ? `
                                                    <div
                                                        class="mobile-client-company"
                                                    >
                                                        ${escapeHTML(
                                                            client.company
                                                        )}
                                                    </div>
                                                `
                                                : ""
                                        }

                                    </div>


                                    <div
                                        class="mobile-client-status"
                                    >

                                        ${status.label}

                                    </div>

                                </div>


                                <div
                                    class="mobile-client-contact"
                                >

                                    ${
                                        client.phone
                                            ? `
                                                <span>
                                                    ${escapeHTML(
                                                        client.phone
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }

                                    ${
                                        client.email
                                            ? `
                                                <span>
                                                    ${escapeHTML(
                                                        client.email
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>


                                <div
                                    class="mobile-client-financials"
                                >


                                    <div
                                        class="mobile-client-financial"
                                    >

                                        <span>
                                            BOOKINGS
                                        </span>

                                        <strong>
                                            ${client.bookingCount}
                                        </strong>

                                    </div>


                                    <div
                                        class="mobile-client-financial"
                                    >

                                        <span>
                                            RECEIVED
                                        </span>

                                        <strong>
                                            ${formatCurrency(
                                                client.received
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="mobile-client-financial"
                                    >

                                        <span>
                                            BALANCE
                                        </span>

                                        <strong>
                                            ${formatCurrency(
                                                client.balance
                                            )}
                                        </strong>

                                    </div>


                                </div>


                            </article>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (clientSearch) {

        clientSearch.addEventListener(
            "input",
            renderClients
        );

    }


    /* =====================================================
       RESET
    ===================================================== */

    if (resetClientSearch) {

        resetClientSearch.addEventListener(
            "click",
            () => {

                clientSearch.value = "";

                renderClients();

                clientSearch.focus();

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    async function init() {

        const authenticated =
            await checkAuthentication();


        if (!authenticated) {
            return;
        }


        await loadClients();

    }


    init();

});