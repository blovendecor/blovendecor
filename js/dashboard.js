/* =========================================================
   BLOVEN DECOR
   PRIVATE CONTROL
   DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

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

    const sidebarCollapse =
        document.getElementById("sidebarCollapse");

    const signOutButton =
        document.getElementById("signOutButton");


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebarCollapse) {

        sidebarCollapse.addEventListener(
            "click",
            (event) => {

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

                signOutButton.disabled = true;

                const navText =
                    signOutButton.querySelector(".nav-text");

                if (navText) {
                    navText.textContent = "Signing out...";
                }

                await supabaseClient.auth.signOut();

                window.location.href =
                    "index.html";

            }
        );

    }


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    async function checkAuthentication() {

        const {
            data: {
                session
            },
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Authentication error:",
                error
            );

            window.location.href =
                "index.html";

            return false;

        }


        if (!session) {

            window.location.href =
                "index.html";

            return false;

        }


        return true;

    }


    const authenticated =
        await checkAuthentication();


    if (!authenticated) {
        return;
    }


    /* =====================================================
       DATE
    ===================================================== */

    function updateDate() {

        const dateElement =
            document.getElementById(
                "dashboardDate"
            );


        if (!dateElement) {
            return;
        }


        const now =
            new Date();


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


    updateDate();


    /* =====================================================
       CURRENCY
    ===================================================== */

    function formatCurrency(amount) {

        return "UGX " +
            Number(amount || 0)
                .toLocaleString(
                    "en-UG",
                    {
                        maximumFractionDigits: 0
                    }
                );

    }


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatEventDate(dateString) {

        if (!dateString) {
            return "—";
        }


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        return date.toLocaleDateString(
            "en-UG",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       FETCH BOOKINGS
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
                "BOOKINGS ERROR:",
                error
            );

            throw error;

        }


        console.log(
            "BLOVEN BOOKINGS:",
            data
        );


        return data || [];

    }


    /* =====================================================
       FETCH CLIENTS
       Separate query — no nested Supabase relationship
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
                "CLIENTS ERROR:",
                error
            );

            /*
             * Clients should not stop the dashboard.
             * Bookings can still load without them.
             */

            return [];

        }


        return data || [];

    }


    /* =====================================================
       FETCH PAYMENTS
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
            `);


        if (error) {

            console.error(
                "PAYMENTS ERROR:",
                error
            );

            /*
             * Do not destroy the dashboard if payments
             * are not yet available.
             */

            return [];

        }


        return data || [];

    }


    /* =====================================================
       MAP CLIENTS
    ===================================================== */

    function attachClients(
        bookings,
        clients
    ) {

        const clientMap =
            new Map(
                clients.map(
                    client => [
                        client.id,
                        client
                    ]
                )
            );


        return bookings.map(
            booking => {

                return {
                    ...booking,

                    client:
                        clientMap.get(
                            booking.client_id
                        ) || null

                };

            }
        );

    }


    /* =====================================================
       CALCULATE FINANCIALS
    ===================================================== */

    function calculateFinancials(
        bookings,
        payments
    ) {

        let totalAgreed = 0;
        let totalReceived = 0;


        bookings.forEach(
            booking => {

                totalAgreed +=
                    Number(
                        booking.total_amount || 0
                    );

            }
        );


        payments.forEach(
            payment => {

                totalReceived +=
                    Number(
                        payment.amount || 0
                    );

            }
        );


        const totalBalance =
            Math.max(
                totalAgreed -
                totalReceived,
                0
            );


        return {
            totalAgreed,
            totalReceived,
            totalBalance
        };

    }


    /* =====================================================
       UPDATE OVERVIEW
    ===================================================== */

    function updateOverview(
        bookings,
        financials
    ) {

        const totalBookings =
            bookings.length;


        const totalAgreed =
            financials.totalAgreed;


        const totalReceived =
            financials.totalReceived;


        const totalBalance =
            financials.totalBalance;


        const totalBookingsElement =
            document.getElementById(
                "totalBookings"
            );


        const totalAgreedElement =
            document.getElementById(
                "totalAgreed"
            );


        const totalReceivedElement =
            document.getElementById(
                "totalReceived"
            );


        const totalBalanceElement =
            document.getElementById(
                "totalBalance"
            );


        if (totalBookingsElement) {

            totalBookingsElement.textContent =
                totalBookings;

        }


        if (totalAgreedElement) {

            totalAgreedElement.textContent =
                formatCurrency(
                    totalAgreed
                );

        }


        if (totalReceivedElement) {

            totalReceivedElement.textContent =
                formatCurrency(
                    totalReceived
                );

        }


        if (totalBalanceElement) {

            totalBalanceElement.textContent =
                formatCurrency(
                    totalBalance
                );

        }


        const financialAgreed =
            document.getElementById(
                "financialAgreed"
            );


        const financialReceived =
            document.getElementById(
                "financialReceived"
            );


        const financialBalance =
            document.getElementById(
                "financialBalance"
            );


        if (financialAgreed) {

            financialAgreed.textContent =
                formatCurrency(
                    totalAgreed
                );

        }


        if (financialReceived) {

            financialReceived.textContent =
                formatCurrency(
                    totalReceived
                );

        }


        if (financialBalance) {

            financialBalance.textContent =
                formatCurrency(
                    totalBalance
                );

        }


        const paymentRate =
            totalAgreed > 0
                ? Math.round(
                    (
                        totalReceived /
                        totalAgreed
                    ) * 100
                )
                : 0;


        const paymentRateElement =
            document.getElementById(
                "paymentRate"
            );


        if (paymentRateElement) {

            paymentRateElement.textContent =
                `${paymentRate}%`;

        }

    }


    /* =====================================================
       RECENT BOOKINGS
    ===================================================== */

    function renderRecentBookings(
        bookings
    ) {

        const container =
            document.getElementById(
                "recentBookings"
            );


        if (!container) {
            return;
        }


        const recent =
            bookings.slice(
                0,
                6
            );


        const recentCount =
            document.getElementById(
                "recentCount"
            );


        if (recentCount) {

            recentCount.textContent =
                recent.length;

        }


        if (!recent.length) {

            container.innerHTML = `
                <div class="dashboard-loading">
                    No bookings yet.
                </div>
            `;

            return;

        }


        container.innerHTML =
            recent.map(
                booking => {

                    const client =
                        booking.client
                            ?.full_name ||
                        "Unknown client";


                    const event =
                        booking.event_name ||
                        booking.event_type ||
                        "Event";


                    return `
                        <a
                            href="booking.html?id=${encodeURIComponent(
                                booking.id
                            )}"
                            class="booking-row"
                        >

                            <div class="booking-row-id">
                                ${escapeHtml(
                                    booking.booking_id ||
                                    "—"
                                )}
                            </div>

                            <div>

                                <div class="booking-row-client">
                                    ${escapeHtml(
                                        client
                                    )}
                                </div>

                                <div class="booking-row-event">
                                    ${escapeHtml(
                                        event
                                    )}
                                </div>

                            </div>

                            <div class="booking-row-date">
                                ${formatEventDate(
                                    booking.event_date
                                )}
                            </div>

                        </a>
                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       UPCOMING EVENTS
    ===================================================== */

    function renderUpcomingEvents(
        bookings
    ) {

        const container =
            document.getElementById(
                "upcomingEvents"
            );


        if (!container) {
            return;
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const upcoming =
            bookings

                .filter(
                    booking => {

                        if (
                            !booking.event_date ||
                            String(
                                booking.status
                            ).toUpperCase() ===
                                "CANCELLED"
                        ) {

                            return false;

                        }


                        const date =
                            new Date(
                                `${booking.event_date}T00:00:00`
                            );


                        return date >= today;

                    }
                )

                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            `${a.event_date}T00:00:00`
                        ) -
                        new Date(
                            `${b.event_date}T00:00:00`
                        )
                )

                .slice(
                    0,
                    5
                );


        if (!upcoming.length) {

            container.innerHTML = `
                <div class="dashboard-loading">
                    No upcoming events.
                </div>
            `;

            return;

        }


        container.innerHTML =
            upcoming.map(
                booking => {

                    const date =
                        new Date(
                            `${booking.event_date}T00:00:00`
                        );


                    const client =
                        booking.client
                            ?.full_name ||
                        "Unknown client";


                    const event =
                        booking.event_name ||
                        booking.event_type ||
                        "Event";


                    return `
                        <a
                            href="booking.html?id=${encodeURIComponent(
                                booking.id
                            )}"
                            class="upcoming-event"
                            style="
                                text-decoration:none;
                                color:inherit;
                            "
                        >

                            <div class="upcoming-date">

                                <strong>
                                    ${date.getDate()}
                                </strong>

                                <span>
                                    ${date
                                        .toLocaleDateString(
                                            "en-UG",
                                            {
                                                month: "short"
                                            }
                                        )
                                        .toUpperCase()}
                                </span>

                            </div>


                            <div class="upcoming-info">

                                <strong>
                                    ${escapeHtml(
                                        event
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        client
                                    )}
                                    ·
                                    ${escapeHtml(
                                        booking.venue ||
                                        "Venue TBC"
                                    )}
                                </span>

                            </div>

                        </a>
                    `;

                }
            )
            .join("");

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
       LOAD DASHBOARD
    ===================================================== */

    try {

        const [
            bookings,
            clients,
            payments
        ] = await Promise.all([
            loadBookings(),
            loadClients(),
            loadPayments()
        ]);


        const bookingsWithClients =
            attachClients(
                bookings,
                clients
            );


        const financials =
            calculateFinancials(
                bookingsWithClients,
                payments
            );


        updateOverview(
            bookingsWithClients,
            financials
        );


        renderRecentBookings(
            bookingsWithClients
        );


        renderUpcomingEvents(
            bookingsWithClients
        );


        console.log(
            "BLOVEN DASHBOARD READY",
            {
                bookings:
                    bookingsWithClients.length,

                clients:
                    clients.length,

                payments:
                    payments.length,

                financials
            }
        );


    } catch (error) {

        console.error(
            "DASHBOARD FAILED:",
            error
        );


        const recent =
            document.getElementById(
                "recentBookings"
            );


        const upcoming =
            document.getElementById(
                "upcomingEvents"
            );


        if (recent) {

            recent.innerHTML = `
                <div class="dashboard-loading">
                    Unable to load bookings.
                    <br>
                    <small>
                        Check the browser console for details.
                    </small>
                </div>
            `;

        }


        if (upcoming) {

            upcoming.innerHTML = `
                <div class="dashboard-loading">
                    Unable to load events.
                    <br>
                    <small>
                        Check the browser console for details.
                    </small>
                </div>
            `;

        }

    }

});