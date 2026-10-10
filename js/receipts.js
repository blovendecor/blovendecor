/* =========================================================
   BLOVEN ADMIN
   RECEIPTS CONTROL
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

    const receiptsLoading =
        document.getElementById("receiptsLoading");

    const receiptsContent =
        document.getElementById("receiptsContent");

    const refreshReceiptsButton =
        document.getElementById(
            "refreshReceiptsButton"
        );


    /* SUMMARY */

    const totalReceipts =
        document.getElementById(
            "totalReceipts"
        );

    const todayReceipts =
        document.getElementById(
            "todayReceipts"
        );

    const totalReceived =
        document.getElementById(
            "totalReceived"
        );

    const monthReceived =
        document.getElementById(
            "monthReceived"
        );


    /* FILTERS */

    const receiptSearch =
        document.getElementById(
            "receiptSearch"
        );

    const receiptTypeFilter =
        document.getElementById(
            "receiptTypeFilter"
        );

    const receiptMethodFilter =
        document.getElementById(
            "receiptMethodFilter"
        );

    const clearReceiptFilters =
        document.getElementById(
            "clearReceiptFilters"
        );

    const receiptResultCount =
        document.getElementById(
            "receiptResultCount"
        );

    const receiptTableList =
        document.getElementById(
            "receiptTableList"
        );


    /* RECENT */

    const recentReceiptWrapper =
        document.getElementById(
            "recentReceiptWrapper"
        );


    /* MODAL */

    const receiptViewModal =
        document.getElementById(
            "receiptViewModal"
        );

    const receiptViewBackdrop =
        document.getElementById(
            "receiptViewBackdrop"
        );

    const receiptViewClose =
        document.getElementById(
            "receiptViewClose"
        );

    const receiptViewCloseButton =
        document.getElementById(
            "receiptViewCloseButton"
        );

    const receiptViewPreview =
        document.getElementById(
            "receiptViewPreview"
        );

    const printReceiptButton =
        document.getElementById(
            "printReceiptButton"
        );

    const downloadReceiptButton =
        document.getElementById(
            "downloadReceiptButton"
        );


    /* =====================================================
       STATE
    ===================================================== */

    let receipts = [];

    let selectedReceipt = null;


    /* =====================================================
       SIDEBAR
    ===================================================== */

    sidebarCollapse?.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            sidebar?.classList.toggle(
                "expanded"
            );

        }
    );


    /* =====================================================
       SIGN OUT
    ===================================================== */

    signOutButton?.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "index.html";

        }
    );


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }


    function formatUGX(amount) {

        return (
            "UGX " +
            Number(amount || 0)
                .toLocaleString(
                    "en-UG",
                    {
                        maximumFractionDigits: 0
                    }
                )
        );

    }


    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

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
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatShortDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

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


    function getTodayString() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day}`
        );

    }


    function getMonthStart() {

        const now =
            new Date();

        return new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

    }


    /* =====================================================
       RECEIPT NUMBER
    ===================================================== */

    function generateReceiptNumber(
        payment
    ) {

        const date =
            new Date(
                payment.created_at ||
                payment.payment_date ||
                Date.now()
            );

        const year =
            date.getFullYear();

        const paymentId =
            String(
                payment.id || ""
            )
                .replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                )
                .slice(-6)
                .toUpperCase();

        return (
            `BLV-R-${year}-` +
            `${paymentId || "000001"}`
        );

    }


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    async function checkAuthentication() {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();

        if (
            error ||
            !data?.session
        ) {

            window.location.href =
                "index.html";

            return false;

        }

        return true;

    }


    /* =====================================================
       LOAD RECEIPTS
    ===================================================== */

    async function loadReceipts() {

        try {

            const {
                data: paymentData,
                error: paymentError
            } =
                await supabaseClient
                    .from("payments")
                    .select("*")
                    .order(
                        "payment_date",
                        {
                            ascending: false
                        }
                    );


            if (paymentError) {
                throw paymentError;
            }


            const payments =
                paymentData || [];


            if (!payments.length) {

                receipts = [];

                renderAll();

                return;

            }


            const bookingIds =
                [
                    ...new Set(
                        payments
                            .map(
                                payment =>
                                    payment.booking_id
                            )
                            .filter(Boolean)
                    )
                ];


            let bookings = [];


            if (bookingIds.length) {

                const {
                    data: bookingData,
                    error: bookingError
                } =
                    await supabaseClient
                        .from("bookings")
                        .select("*")
                        .in(
                            "id",
                            bookingIds
                        );


                if (bookingError) {
                    throw bookingError;
                }


                bookings =
                    bookingData || [];

            }


            const clientIds =
                [
                    ...new Set(
                        bookings
                            .map(
                                booking =>
                                    booking.client_id
                            )
                            .filter(Boolean)
                    )
                ];


            let clients = [];


            if (clientIds.length) {

                const {
                    data: clientData,
                    error: clientError
                } =
                    await supabaseClient
                        .from("clients")
                        .select("*")
                        .in(
                            "id",
                            clientIds
                        );


                if (clientError) {
                    throw clientError;
                }


                clients =
                    clientData || [];

            }


            const bookingMap =
                new Map(
                    bookings.map(
                        booking => [
                            String(
                                booking.id
                            ),
                            booking
                        ]
                    )
                );


            const clientMap =
                new Map(
                    clients.map(
                        client => [
                            String(
                                client.id
                            ),
                            client
                        ]
                    )
                );


            receipts =
                payments.map(
                    payment => {

                        const booking =
                            bookingMap.get(
                                String(
                                    payment.booking_id
                                )
                            ) || null;


                        const client =
                            booking?.client_id
                                ? clientMap.get(
                                    String(
                                        booking.client_id
                                    )
                                ) || null
                                : null;


                        return {

                            payment,

                            booking,

                            client,

                            receiptNumber:
                                generateReceiptNumber(
                                    payment
                                )

                        };

                    }
                );


            renderAll();


        } catch (error) {

            console.error(
                "Receipt loading error:",
                error
            );


            showLoadError(
                error.message ||
                "Unable to load receipts."
            );

        }

    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function renderSummary() {

        const total =
            receipts.length;


        const today =
            getTodayString();


        const monthStart =
            getMonthStart();


        let todayCount = 0;

        let totalAmount = 0;

        let monthAmount = 0;


        receipts.forEach(
            receipt => {

                const payment =
                    receipt.payment;


                const amount =
                    Number(
                        payment.amount || 0
                    );


                totalAmount += amount;


                const paymentDate =
                    payment.payment_date
                        ? new Date(
                            payment.payment_date
                        )
                        : null;


                if (
                    payment.payment_date ===
                    today
                ) {

                    todayCount++;

                }


                if (
                    paymentDate &&
                    !Number.isNaN(
                        paymentDate.getTime()
                    ) &&
                    paymentDate >=
                    monthStart
                ) {

                    monthAmount +=
                        amount;

                }

            }
        );


        if (totalReceipts) {

            totalReceipts.textContent =
                total.toLocaleString(
                    "en-UG"
                );

        }


        if (todayReceipts) {

            todayReceipts.textContent =
                todayCount.toLocaleString(
                    "en-UG"
                );

        }


        if (totalReceived) {

            totalReceived.textContent =
                formatUGX(
                    totalAmount
                );

        }


        if (monthReceived) {

            monthReceived.textContent =
                formatUGX(
                    monthAmount
                );

        }

    }


    /* =====================================================
       FILTERING
    ===================================================== */

    function getFilteredReceipts() {

        const search =
            normalize(
                receiptSearch?.value
            );


        const type =
            normalize(
                receiptTypeFilter?.value
            );


        const method =
            normalize(
                receiptMethodFilter?.value
            );


        return receipts.filter(
            receipt => {

                const payment =
                    receipt.payment;

                const booking =
                    receipt.booking;

                const client =
                    receipt.client;


                const searchable =
                    [

                        receipt.receiptNumber,

                        client?.full_name,

                        client?.phone,

                        client?.email,

                        booking?.booking_id,

                        booking?.event_name,

                        booking?.event_type,

                        payment?.reference

                    ]
                        .filter(Boolean)
                        .join(" ");


                const matchesSearch =
                    !search ||
                    normalize(
                        searchable
                    ).includes(
                        search
                    );


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

            }
        );

    }


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderTable() {

        if (!receiptTableList) {
            return;
        }


        const filtered =
            getFilteredReceipts();


        if (receiptResultCount) {

            receiptResultCount.textContent =
                `${filtered.length} ${
                    filtered.length === 1
                        ? "receipt"
                        : "receipts"
                }`;

        }


        if (!filtered.length) {

            receiptTableList.innerHTML = `

                <div class="receipt-table-empty">

                    ${
                        receipts.length
                            ? "No receipts match your current filters."
                            : "No payment receipts have been generated yet."
                    }

                </div>

            `;

            return;

        }


        receiptTableList.innerHTML =
            filtered
                .map(
                    receipt => {

                        const payment =
                            receipt.payment;

                        const booking =
                            receipt.booking;

                        const client =
                            receipt.client;


                        return `

                            <div
                                class="receipt-table-row"
                            >

                                <div class="receipt-number-cell">
                                    ${escapeHTML(
                                        receipt.receiptNumber
                                    )}
                                </div>


                                <div class="receipt-client-cell">
                                    ${escapeHTML(
                                        client?.full_name ||
                                        "Unknown client"
                                    )}
                                </div>


                                <div class="receipt-booking-cell">
                                    ${escapeHTML(
                                        booking?.booking_id ||
                                        booking?.event_name ||
                                        "—"
                                    )}
                                </div>


                                <div class="receipt-date-cell">
                                    ${formatShortDate(
                                        payment.payment_date
                                    )}
                                </div>


                                <div class="receipt-type-cell">
                                    ${escapeHTML(
                                        payment.payment_type ||
                                        "Other"
                                    )}
                                </div>


                                <div class="receipt-amount-cell">
                                    ${formatUGX(
                                        payment.amount
                                    )}
                                </div>


                                <div>

                                    <button
                                        type="button"
                                        class="receipt-view-button"
                                        data-payment-id="${escapeHTML(
                                            payment.id
                                        )}"
                                    >
                                        VIEW
                                    </button>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


        receiptTableList
            .querySelectorAll(
                ".receipt-view-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const receipt =
                                receipts.find(
                                    item =>
                                        String(
                                            item.payment.id
                                        ) ===
                                        String(
                                            button.dataset
                                                .paymentId
                                        )
                                );


                            if (receipt) {

                                openReceipt(
                                    receipt
                                );

                            }

                        }
                    );

                }
            );

    }


    /* =====================================================
       RECENT RECEIPT
    ===================================================== */

    function renderRecentReceipt() {

        if (!recentReceiptWrapper) {
            return;
        }


        if (!receipts.length) {

            recentReceiptWrapper.innerHTML = `

                <div class="recent-receipt-empty">
                    No receipts have been generated yet.
                </div>

            `;

            return;

        }


        const receipt =
            receipts[0];


        const payment =
            receipt.payment;

        const client =
            receipt.client;

        const booking =
            receipt.booking;


        recentReceiptWrapper.innerHTML = `

            <div class="recent-receipt-card">

                <div class="recent-receipt-card-info">

                    <span class="recent-receipt-card-label">
                        MOST RECENT RECEIPT
                    </span>

                    <h3 class="recent-receipt-card-title">
                        ${escapeHTML(
                            receipt.receiptNumber
                        )}
                    </h3>

                    <div class="recent-receipt-card-meta">

                        ${escapeHTML(
                            client?.full_name ||
                            "Unknown client"
                        )}

                        <br>

                        ${escapeHTML(
                            booking?.event_name ||
                            booking?.event_type ||
                            "Booking"
                        )}

                        <br>

                        ${formatDate(
                            payment.payment_date
                        )}

                    </div>

                </div>


                <div class="recent-receipt-card-amount">

                    <span>
                        PAYMENT RECEIVED
                    </span>

                    <strong>
                        ${formatUGX(
                            payment.amount
                        )}
                    </strong>

                </div>

            </div>

        `;

    }


    /* =====================================================
       OPEN RECEIPT
    ===================================================== */

    function openReceipt(
        receipt
    ) {

        if (
            !receiptViewModal ||
            !receiptViewPreview
        ) {
            return;
        }


        selectedReceipt =
            receipt;


        const payment =
            receipt.payment;

        const booking =
            receipt.booking;

        const client =
            receipt.client;


        const agreed =
            Number(
                booking?.total_amount || 0
            );


        /*
         * The archive page contains all payments.
         * To calculate the total received to date,
         * we calculate from the loaded receipts belonging
         * to the same booking.
         */

        const bookingPayments =
            receipts
                .filter(
                    item =>
                        String(
                            item.payment.booking_id
                        ) ===
                        String(
                            payment.booking_id
                        )
                )
                .reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            Number(
                                item.payment.amount ||
                                0
                            )
                        );

                    },
                    0
                );


        const balance =
            Math.max(
                agreed -
                bookingPayments,
                0
            );


        receiptViewPreview.innerHTML = `

            <div class="receipt-paper">

                <div class="receipt-brand">

                    <div>

                        <div class="receipt-brand-name">
                            BLOVEN DECOR
                        </div>

                        <div class="receipt-brand-subtitle">
                            EVENT STYLING & DESIGN
                        </div>

                    </div>


                    <div class="receipt-number">

                        <strong>
                            ${escapeHTML(
                                receipt.receiptNumber
                            )}
                        </strong>

                        <span>
                            ${formatDate(
                                payment.payment_date
                            )}
                        </span>

                    </div>

                </div>


                <div class="receipt-title">
                    Payment Receipt
                </div>


                <div class="receipt-client-grid">

                    <div class="receipt-detail">

                        <span>
                            CLIENT
                        </span>

                        <strong>
                            ${escapeHTML(
                                client?.full_name ||
                                "Client"
                            )}
                        </strong>

                    </div>


                    <div class="receipt-detail">

                        <span>
                            BOOKING
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking?.booking_id ||
                                booking?.id ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="receipt-detail">

                        <span>
                            EVENT
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking?.event_name ||
                                booking?.event_type ||
                                "Event"
                            )}
                        </strong>

                    </div>


                    <div class="receipt-detail">

                        <span>
                            EVENT DATE
                        </span>

                        <strong>
                            ${formatDate(
                                booking?.event_date
                            )}
                        </strong>

                    </div>

                </div>


                <div class="receipt-financials">

                    <div class="receipt-financial-row">

                        <span>
                            Total Agreed
                        </span>

                        <strong>
                            ${formatUGX(
                                agreed
                            )}
                        </strong>

                    </div>


                    <div class="receipt-financial-row receipt-highlight">

                        <span>
                            Payment Received
                        </span>

                        <strong>
                            ${formatUGX(
                                payment.amount
                            )}
                        </strong>

                    </div>


                    <div class="receipt-financial-row">

                        <span>
                            Payment Type
                        </span>

                        <strong>
                            ${escapeHTML(
                                payment.payment_type ||
                                "Other"
                            )}
                        </strong>

                    </div>


                    <div class="receipt-financial-row">

                        <span>
                            Payment Method
                        </span>

                        <strong>
                            ${escapeHTML(
                                payment.payment_method ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="receipt-financial-row">

                        <span>
                            Total Received To Date
                        </span>

                        <strong>
                            ${formatUGX(
                                bookingPayments
                            )}
                        </strong>

                    </div>


                    <div class="receipt-financial-row">

                        <span>
                            Balance After Payment
                        </span>

                        <strong>
                            ${formatUGX(
                                balance
                            )}
                        </strong>

                    </div>

                </div>


                ${
                    payment.reference
                        ? `

                            <div
                                class="receipt-detail"
                                style="margin-top:25px;"
                            >

                                <span>
                                    PAYMENT REFERENCE
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        payment.reference
                                    )}
                                </strong>

                            </div>

                        `
                        : ""
                }


                ${
                    payment.notes
                        ? `

                            <div
                                class="receipt-detail"
                                style="margin-top:25px;"
                            >

                                <span>
                                    NOTES
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        payment.notes
                                    )}
                                </strong>

                            </div>

                        `
                        : ""
                }


                <div class="receipt-footer">

                    Thank you for choosing Bloven Decor.

                    <br>

                    Mabirizi Complex, Kampala Road,
                    Level 3, Room 22, Kampala

                    <br>

                    0782 809 699 · 0782 278 880

                </div>

            </div>

        `;


        receiptViewModal.classList.add(
            "open"
        );


        receiptViewModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE RECEIPT
    ===================================================== */

    function closeReceipt() {

        if (!receiptViewModal) {
            return;
        }


        receiptViewModal.classList.remove(
            "open"
        );


        receiptViewModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    receiptViewClose?.addEventListener(
        "click",
        closeReceipt
    );


    receiptViewCloseButton?.addEventListener(
        "click",
        closeReceipt
    );


    receiptViewBackdrop?.addEventListener(
        "click",
        closeReceipt
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                receiptViewModal?.classList.contains(
                    "open"
                )
            ) {

                closeReceipt();

            }

        }
    );


    /* =====================================================
       DOWNLOAD PDF
    ===================================================== */

    downloadReceiptButton?.addEventListener(
        "click",
        () => {

            if (!selectedReceipt) {
                return;
            }

            generatePDF(
                selectedReceipt
            );

        }
    );


    /* =====================================================
       PRINT RECEIPT
    ===================================================== */

    printReceiptButton?.addEventListener(
        "click",
        () => {

            if (!selectedReceipt) {
                return;
            }

            window.print();

        }
    );


    /* =====================================================
       GENERATE PDF
    ===================================================== */

    function generatePDF(
        receipt
    ) {

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            window.alert(
                "PDF generator is not available."
            );

            return;

        }


        const {
            jsPDF
        } = window.jspdf;


        const payment =
            receipt.payment;

        const booking =
            receipt.booking;

        const client =
            receipt.client;


        const agreed =
            Number(
                booking?.total_amount || 0
            );


        const received =
            receipts
                .filter(
                    item =>
                        String(
                            item.payment.booking_id
                        ) ===
                        String(
                            payment.booking_id
                        )
                )
                .reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            Number(
                                item.payment.amount ||
                                0
                            )
                        );

                    },
                    0
                );


        const balance =
            Math.max(
                agreed -
                received,
                0
            );


        const doc =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        const burgundy =
            [113, 59, 61];

        const black =
            [16, 16, 15];

        const grey =
            [110, 105, 98];


        const receiptNumber =
            receipt.receiptNumber;


        let y = 22;


        /* BRAND */

        doc.setTextColor(
            ...black
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            20
        );

        doc.text(
            "BLOVEN DECOR",
            20,
            y
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(
            7
        );

        doc.setTextColor(
            ...grey
        );

        doc.text(
            "EVENT STYLING & DESIGN",
            20,
            y + 6
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            8
        );

        doc.setTextColor(
            ...black
        );

        doc.text(
            receiptNumber,
            190,
            y,
            {
                align: "right"
            }
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setTextColor(
            ...grey
        );

        doc.text(
            formatDate(
                payment.payment_date
            ),
            190,
            y + 6,
            {
                align: "right"
            }
        );


        y += 25;


        doc.setDrawColor(
            210,
            205,
            198
        );

        doc.line(
            20,
            y,
            190,
            y
        );


        y += 18;


        /* TITLE */

        doc.setTextColor(
            ...black
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            23
        );

        doc.text(
            "PAYMENT RECEIPT",
            20,
            y
        );


        y += 18;


        function pdfLabel(
            label,
            value,
            x,
            currentY
        ) {

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                6.5
            );

            doc.setTextColor(
                ...grey
            );

            doc.text(
                String(
                    label || ""
                ).toUpperCase(),
                x,
                currentY
            );


            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                9
            );

            doc.setTextColor(
                ...black
            );

            doc.text(
                String(
                    value ||
                    "—"
                ),
                x,
                currentY + 6
            );

        }


        pdfLabel(
            "CLIENT",
            client?.full_name,
            20,
            y
        );


        pdfLabel(
            "BOOKING",
            booking?.booking_id ||
            booking?.id,
            105,
            y
        );


        y += 22;


        pdfLabel(
            "EVENT",
            booking?.event_name ||
            booking?.event_type,
            20,
            y
        );


        pdfLabel(
            "EVENT DATE",
            formatDate(
                booking?.event_date
            ),
            105,
            y
        );


        y += 28;


        /* FINANCIALS */

        doc.setDrawColor(
            210,
            205,
            198
        );

        doc.line(
            20,
            y,
            190,
            y
        );


        y += 10;


        function financialRow(
            label,
            value,
            highlight = false
        ) {

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                9
            );

            doc.setTextColor(
                ...(
                    highlight
                        ? burgundy
                        : grey
                )
            );

            doc.text(
                label,
                20,
                y
            );


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setTextColor(
                ...(
                    highlight
                        ? burgundy
                        : black
                )
            );

            doc.text(
                formatUGX(
                    value
                ),
                190,
                y,
                {
                    align: "right"
                }
            );


            y += 12;


            doc.setDrawColor(
                225,
                220,
                214
            );

            doc.line(
                20,
                y - 5,
                190,
                y - 5
            );

        }


        financialRow(
            "Total Agreed",
            agreed
        );


        financialRow(
            "Payment Received",
            Number(
                payment.amount || 0
            ),
            true
        );


        financialRow(
            "Total Received To Date",
            received
        );


        financialRow(
            "Balance After Payment",
            balance
        );


        y += 5;


        pdfLabel(
            "PAYMENT TYPE",
            payment.payment_type,
            20,
            y
        );


        pdfLabel(
            "PAYMENT METHOD",
            payment.payment_method,
            105,
            y
        );


        y += 25;


        if (payment.reference) {

            pdfLabel(
                "PAYMENT REFERENCE",
                payment.reference,
                20,
                y
            );

            y += 20;

        }


        if (payment.notes) {

            pdfLabel(
                "NOTES",
                payment.notes,
                20,
                y
            );

            y += 20;

        }


        /* FOOTER */

        const footerY =
            270;


        doc.setDrawColor(
            210,
            205,
            198
        );

        doc.line(
            20,
            footerY - 10,
            190,
            footerY - 10
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(
            7
        );

        doc.setTextColor(
            ...grey
        );


        doc.text(
            "Thank you for choosing Bloven Decor.",
            20,
            footerY
        );


        doc.text(
            "Mabirizi Complex, Kampala Road, Level 3, Room 22, Kampala",
            20,
            footerY + 5
        );


        doc.text(
            "0782 809 699 · 0782 278 880",
            20,
            footerY + 10
        );


        doc.save(
            `${receiptNumber}.pdf`
        );

    }


    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    receiptSearch?.addEventListener(
        "input",
        renderTable
    );


    receiptTypeFilter?.addEventListener(
        "change",
        renderTable
    );


    receiptMethodFilter?.addEventListener(
        "change",
        renderTable
    );


    clearReceiptFilters?.addEventListener(
        "click",
        () => {

            if (receiptSearch) {
                receiptSearch.value = "";
            }

            if (receiptTypeFilter) {
                receiptTypeFilter.value = "";
            }

            if (receiptMethodFilter) {
                receiptMethodFilter.value = "";
            }

            renderTable();

        }
    );


    refreshReceiptsButton?.addEventListener(
        "click",
        async () => {

            refreshReceiptsButton.disabled =
                true;

            refreshReceiptsButton.textContent =
                "LOADING...";

            await loadReceipts();

            refreshReceiptsButton.disabled =
                false;

            refreshReceiptsButton.textContent =
                "REFRESH";

        }
    );


    /* =====================================================
       RENDER ALL
    ===================================================== */

    function renderAll() {

        renderSummary();

        renderTable();

        renderRecentReceipt();

        if (receiptsLoading) {
            receiptsLoading.hidden = true;
        }

        if (receiptsContent) {
            receiptsContent.hidden = false;
        }

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showLoadError(
        message
    ) {

        if (!receiptsLoading) {
            return;
        }


        receiptsLoading.innerHTML = `

            <div
                style="
                    text-align:center;
                    max-width:420px;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:10px;
                        color:var(--admin-black);
                        font-family:'Calistoga',serif;
                        font-size:24px;
                        font-weight:400;
                    "
                >
                    Unable to load receipts.
                </strong>


                <span>
                    ${escapeHTML(
                        message
                    )}
                </span>


                <br>
                <br>


                <button
                    type="button"
                    id="receiptRetryButton"
                    style="
                        border:1px solid var(--admin-black);
                        background:var(--admin-black);
                        color:var(--admin-cream);
                        padding:12px 17px;
                        font-family:'DM Sans',sans-serif;
                        font-size:8px;
                        font-weight:700;
                        letter-spacing:.1em;
                        cursor:pointer;
                    "
                >
                    TRY AGAIN
                </button>

            </div>

        `;


        document
            .getElementById(
                "receiptRetryButton"
            )
            ?.addEventListener(
                "click",
                async () => {

                    receiptsLoading.innerHTML = `

                        <div class="receipts-spinner"></div>

                        <span>
                            Loading receipts...
                        </span>

                    `;

                    await loadReceipts();

                }
            );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        const authenticated =
            await checkAuthentication();


        if (!authenticated) {
            return;
        }


        await loadReceipts();

    }


    initialize();

});
