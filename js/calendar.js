/* =========================================================
   BLOVEN CONTROL
   CALENDAR
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

    const sidebarCollapse =
        document.getElementById("sidebarCollapse");

    const signOutButton =
        document.getElementById("signOutButton");

    const calendarDate =
        document.getElementById("calendarDate");

    const previousMonth =
        document.getElementById("previousMonth");

    const nextMonth =
        document.getElementById("nextMonth");

    const todayButton =
        document.getElementById("todayButton");

    const calendarMonth =
        document.getElementById("calendarMonth");

    const calendarYear =
        document.getElementById("calendarYear");

    const calendarGrid =
        document.getElementById("calendarGrid");

    const selectedDate =
        document.getElementById("selectedDate");

    const selectedEvents =
        document.getElementById("selectedEvents");

    const upcomingEvents =
        document.getElementById("upcomingEvents");


    /* =====================================================
       STATE
    ===================================================== */

    let bookings = [];
    let clients = [];
    let payments = [];

    let currentDate = new Date();

    let selectedDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
    );


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebarCollapse && sidebar) {

        sidebarCollapse.addEventListener("click", () => {

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
       CURRENT DATE
    ===================================================== */

    function updateCurrentDate() {

        if (!calendarDate) {
            return;
        }

        const now = new Date();

        calendarDate.textContent =
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
       AUTH CHECK
    ===================================================== */

    async function checkAuthentication() {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        if (!session) {

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
                "event_date",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Bookings error:",
                error
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
                amount,
                payment_date,
                payment_type,
                payment_method
            `);


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
       CLIENT LOOKUP
    ===================================================== */

    function getClient(booking) {

        return clients.find(
            client =>
                String(client.id) ===
                String(booking.client_id)
        ) || null;

    }


    /* =====================================================
       PAYMENT TOTAL
    ===================================================== */

    function getReceivedAmount(booking) {

        return payments
            .filter(
                payment =>
                    String(payment.booking_id) ===
                    String(booking.id)
            )
            .reduce(
                (total, payment) =>
                    total + Number(payment.amount || 0),
                0
            );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function getEffectiveStatus(booking) {

        const received =
            getReceivedAmount(booking);

        const total =
            Number(booking.total_amount || 0);

        const rawStatus =
            String(
                booking.status || "NEW"
            )
            .trim()
            .toUpperCase();


        if (
            total > 0 &&
            received >= total
        ) {

            return "FULLY PAID";

        }


        if (
            received > 0 &&
            rawStatus === "CONFIRMED"
        ) {

            return "PARTIALLY PAID";

        }


        return rawStatus || "NEW";

    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        const value =
            String(status)
                .toUpperCase();


        if (value === "FULLY PAID") {
            return "paid";
        }

        if (
            value === "CONFIRMED" ||
            value === "PARTIALLY PAID"
        ) {
            return "confirmed";
        }

        if (value === "NEW") {
            return "new";
        }

        return "other";

    }


    /* =====================================================
       DATE KEY
    ===================================================== */

    function dateKey(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    /* =====================================================
       BOOKING DATE
    ===================================================== */

    function bookingDateKey(booking) {

        if (!booking.event_date) {
            return null;
        }

        const raw =
            String(booking.event_date);

        return raw.slice(0, 10);

    }


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(amount) {

        const value =
            Number(amount || 0);

        return "UGX " +
            value.toLocaleString("en-UG");

    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(time) {

        if (!time) {
            return "Time not set";
        }


        const parts =
            String(time).split(":");

        if (parts.length < 2) {
            return time;
        }


        let hour =
            Number(parts[0]);

        const minute =
            parts[1];

        const suffix =
            hour >= 12
                ? "PM"
                : "AM";


        hour =
            hour % 12 || 12;


        return `${hour}:${minute} ${suffix}`;

    }


    /* =====================================================
       FORMAT SELECTED DATE
    ===================================================== */

    function formatSelectedDate(date) {

        return date.toLocaleDateString(
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
       RENDER CALENDAR
    ===================================================== */

    function renderCalendar() {

        if (!calendarGrid) {
            return;
        }


        calendarGrid.innerHTML = "";


        const year =
            currentDate.getFullYear();

        const month =
            currentDate.getMonth();


        calendarMonth.textContent =
            currentDate.toLocaleDateString(
                "en-UG",
                {
                    month: "long"
                }
            );


        calendarYear.textContent =
            year;


        /*
         * Monday-first calendar
         */

        const firstDay =
            new Date(
                year,
                month,
                1
            );


        let startingDay =
            firstDay.getDay();


        startingDay =
            startingDay === 0
                ? 6
                : startingDay - 1;


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        const previousMonthDays =
            new Date(
                year,
                month,
                0
            ).getDate();


        /*
         * Previous month
         */

        for (
            let i = startingDay - 1;
            i >= 0;
            i--
        ) {

            const day =
                previousMonthDays - i;


            const cellDate =
                new Date(
                    year,
                    month - 1,
                    day
                );


            createCalendarDay(
                cellDate,
                true
            );

        }


        /*
         * Current month
         */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const cellDate =
                new Date(
                    year,
                    month,
                    day
                );


            createCalendarDay(
                cellDate,
                false
            );

        }


        /*
         * Next month
         */

        const totalCells =
            calendarGrid.children.length;


        const remaining =
            totalCells % 7 === 0
                ? 0
                : 7 - (totalCells % 7);


        for (
            let day = 1;
            day <= remaining;
            day++
        ) {

            const cellDate =
                new Date(
                    year,
                    month + 1,
                    day
                );


            createCalendarDay(
                cellDate,
                true
            );

        }


        /*
         * Make sure we show
         * the selected day.
         */

        renderSelectedDay();

    }


    /* =====================================================
       CREATE CALENDAR DAY
    ===================================================== */

    function createCalendarDay(
        date,
        otherMonth
    ) {

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        if (otherMonth) {
            cell.classList.add(
                "other-month"
            );
        }


        const today =
            new Date();


        if (
            dateKey(date) ===
            dateKey(today)
        ) {

            cell.classList.add(
                "today"
            );

        }


        if (
            dateKey(date) ===
            dateKey(selectedDay)
        ) {

            cell.classList.add(
                "selected"
            );

        }


        /*
         * Number
         */

        const number =
            document.createElement("div");

        number.className =
            "day-number";

        number.textContent =
            date.getDate();


        cell.appendChild(number);


        /*
         * Events
         */

        const events =
            bookings.filter(
                booking =>
                    bookingDateKey(booking) ===
                    dateKey(date)
            );


        if (events.length) {

            const eventsContainer =
                document.createElement("div");

            eventsContainer.className =
                "day-events";


            const visibleEvents =
                events.slice(0, 3);


            visibleEvents.forEach(
                booking => {

                    const event =
                        document.createElement("div");

                    const status =
                        getEffectiveStatus(
                            booking
                        );


                    const statusClass =
                        getStatusClass(
                            status
                        );


                    event.className =
                        `calendar-event event-${statusClass}`;


                    const dot =
                        document.createElement("span");

                    dot.className =
                        "calendar-event-dot";


                    const title =
                        document.createElement("span");

                    title.className =
                        "calendar-event-title";


                    title.textContent =
                        booking.event_name ||
                        booking.event_type ||
                        "Event";


                    event.appendChild(dot);
                    event.appendChild(title);

                    eventsContainer.appendChild(
                        event
                    );

                }
            );


            if (events.length > 3) {

                const more =
                    document.createElement("div");

                more.className =
                    "more-events";

                more.textContent =
                    `+${events.length - 3} more`;

                eventsContainer.appendChild(
                    more
                );

            }


            cell.appendChild(
                eventsContainer
            );

        }


        /*
         * Click
         */

        cell.addEventListener(
            "click",
            () => {

                selectedDay =
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );


                /*
                 * If clicking a
                 * neighbouring month,
                 * move calendar there.
                 */

                if (otherMonth) {

                    currentDate =
                        new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            1
                        );

                    renderCalendar();

                } else {

                    renderSelectedDay();

                }

            }
        );


        calendarGrid.appendChild(
            cell
        );

    }


    /* =====================================================
       RENDER SELECTED DAY
    ===================================================== */

    function renderSelectedDay() {

        if (!selectedEvents) {
            return;
        }


        selectedDate.textContent =
            formatSelectedDate(
                selectedDay
            );


        const key =
            dateKey(selectedDay);


        const events =
            bookings.filter(
                booking =>
                    bookingDateKey(booking) ===
                    key
            );


        selectedEvents.innerHTML = "";


        if (!events.length) {

            selectedEvents.innerHTML = `
                <div class="calendar-empty">

                    <div class="calendar-empty-mark">
                        —
                    </div>

                    <p>
                        There are no events scheduled
                        for this day.
                    </p>

                </div>
            `;

            return;

        }


        events.forEach(
            booking => {

                const client =
                    getClient(booking);


                const clientName =
                    client?.full_name ||
                    "Client not assigned";


                const status =
                    getEffectiveStatus(
                        booking
                    );


                const statusClass =
                    getStatusClass(
                        status
                    );


                const received =
                    getReceivedAmount(
                        booking
                    );


                const total =
                    Number(
                        booking.total_amount || 0
                    );


                const card =
                    document.createElement("article");


                card.className =
                    "selected-event";


                card.innerHTML = `

                    <div class="selected-event-status">

                        <span
                            class="selected-event-status-dot ${statusClass}"
                        ></span>

                        <span>
                            ${escapeHTML(status)}
                        </span>

                    </div>


                    <h4>
                        ${escapeHTML(
                            booking.event_name ||
                            booking.event_type ||
                            "Untitled Event"
                        )}
                    </h4>


                    <div class="selected-event-client">
                        ${escapeHTML(clientName)}
                    </div>


                    <div class="selected-event-info">

                        <div class="selected-event-info-row">

                            <span>
                                Time
                            </span>

                            <span>
                                ${escapeHTML(
                                    formatTime(
                                        booking.event_time
                                    )
                                )}
                            </span>

                        </div>


                        <div class="selected-event-info-row">

                            <span>
                                Venue
                            </span>

                            <span>
                                ${escapeHTML(
                                    booking.venue ||
                                    "Not set"
                                )}
                            </span>

                        </div>


                        <div class="selected-event-info-row">

                            <span>
                                Guests
                            </span>

                            <span>
                                ${escapeHTML(
                                    booking.guest_count ||
                                    "Not set"
                                )}
                            </span>

                        </div>


                        <div class="selected-event-info-row">

                            <span>
                                Balance
                            </span>

                            <span>
                                ${formatMoney(
                                    Math.max(
                                        0,
                                        total - received
                                    )
                                )}
                            </span>

                        </div>

                    </div>


                    <a
                        href="booking.html?id=${encodeURIComponent(
                            booking.id
                        )}"
                        class="selected-event-link"
                    >

                        <span>
                            Open booking
                        </span>

                        <span>
                            ↗
                        </span>

                    </a>

                `;


                selectedEvents.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       UPCOMING EVENTS
    ===================================================== */

    function renderUpcomingEvents() {

        if (!upcomingEvents) {
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
                            !booking.event_date
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
                    (a, b) =>
                        new Date(
                            a.event_date
                        ) -
                        new Date(
                            b.event_date
                        )
                )
                .slice(
                    0,
                    8
                );


        upcomingEvents.innerHTML = "";


        if (!upcoming.length) {

            upcomingEvents.innerHTML = `
                <div class="calendar-loading">
                    No upcoming events found.
                </div>
            `;

            return;

        }


        upcoming.forEach(
            booking => {

                const client =
                    getClient(booking);


                const status =
                    getEffectiveStatus(
                        booking
                    );


                const statusClass =
                    getStatusClass(
                        status
                    );


                const eventDate =
                    new Date(
                        `${booking.event_date}T00:00:00`
                    );


                const day =
                    eventDate.getDate();


                const month =
                    eventDate
                        .toLocaleDateString(
                            "en-UG",
                            {
                                month: "short"
                            }
                        )
                        .toUpperCase();


                const row =
                    document.createElement("div");


                row.className =
                    "upcoming-event-row";


                row.innerHTML = `

                    <div class="upcoming-date">

                        <span class="upcoming-date-day">
                            ${day}
                        </span>

                        <span class="upcoming-date-month">
                            ${month}
                        </span>

                    </div>


                    <div class="upcoming-main">

                        <div class="upcoming-event-name">
                            ${escapeHTML(
                                booking.event_name ||
                                booking.event_type ||
                                "Untitled Event"
                            )}
                        </div>

                        <div class="upcoming-client">
                            ${escapeHTML(
                                client?.full_name ||
                                "Client not assigned"
                            )}
                        </div>

                    </div>


                    <div class="upcoming-detail">

                        ${escapeHTML(
                            booking.venue ||
                            "Venue not set"
                        )}

                    </div>


                    <div class="upcoming-status ${statusClass}">

                        ${escapeHTML(status)}

                    </div>


                    <div class="upcoming-action">

                        <a
                            href="booking.html?id=${encodeURIComponent(
                                booking.id
                            )}"
                        >

                            View booking

                            <span>↗</span>

                        </a>

                    </div>

                `;


                upcomingEvents.appendChild(
                    row
                );

            }
        );

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
       MONTH NAVIGATION
    ===================================================== */

    previousMonth?.addEventListener(
        "click",
        () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                );


            renderCalendar();

        }
    );


    nextMonth?.addEventListener(
        "click",
        () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                );


            renderCalendar();

        }
    );


    todayButton?.addEventListener(
        "click",
        () => {

            const today =
                new Date();


            currentDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );


            selectedDay =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );


            renderCalendar();

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        updateCurrentDate();


        const authenticated =
            await checkAuthentication();


        if (!authenticated) {
            return;
        }


        await Promise.all([
            loadBookings(),
            loadClients(),
            loadPayments()
        ]);


        renderCalendar();

        renderUpcomingEvents();

    }


    initialize();

});