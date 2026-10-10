/* =========================================================
   BLOVEN ADMIN
   INDIVIDUAL BOOKING CONTROL
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

    const bookingLoading =
        document.getElementById("bookingLoading");

    const bookingContent =
        document.getElementById("bookingContent");

    const bookingTitle =
        document.getElementById("bookingTitle");

    const bookingReference =
        document.getElementById("bookingReference");

    const bookingStatus =
        document.getElementById("bookingStatus");

    const clientName =
        document.getElementById("clientName");

    const clientPhone =
        document.getElementById("clientPhone");

    const clientEmail =
        document.getElementById("clientEmail");

    const clientCompany =
        document.getElementById("clientCompany");

    const eventName =
        document.getElementById("eventName");

    const eventType =
        document.getElementById("eventType");

    const eventDate =
        document.getElementById("eventDate");

    const eventTime =
        document.getElementById("eventTime");

    const eventVenue =
        document.getElementById("eventVenue");

    const guestCount =
        document.getElementById("guestCount");

    const bookingId =
        document.getElementById("bookingId");

    const bookingCreated =
        document.getElementById("bookingCreated");

    /* =====================================================
       FINANCIAL ELEMENTS
    ===================================================== */

    const totalAgreed =
        document.getElementById("totalAgreed");

    const editTotalAgreedButton =
        document.getElementById("editTotalAgreedButton");

    const totalAgreedEditForm =
        document.getElementById("totalAgreedEditForm");

    const totalAgreedInput =
        document.getElementById("totalAgreedInput");

    const cancelTotalAgreedButton =
        document.getElementById(
            "cancelTotalAgreedButton"
        );

    const saveTotalAgreedButton =
        document.getElementById(
            "saveTotalAgreedButton"
        );

    const totalAgreedEditMessage =
        document.getElementById(
            "totalAgreedEditMessage"
        );

    const totalReceived =
        document.getElementById("totalReceived");

    const balanceAmount =
        document.getElementById("balanceAmount");

    const paymentPercentage =
        document.getElementById(
            "paymentPercentage"
        );

    const paymentProgressFill =
        document.getElementById(
            "paymentProgressFill"
        );


    /* =====================================================
       PAYMENT ELEMENTS
    ===================================================== */

    const paymentHistoryCount =
        document.getElementById(
            "paymentHistoryCount"
        );

    const paymentHistoryList =
        document.getElementById(
            "paymentHistoryList"
        );

    const paymentForm =
        document.getElementById("paymentForm");

    const paymentType =
        document.getElementById("paymentType");

    const paymentAmount =
        document.getElementById(
            "paymentAmount"
        );

    const paymentDate =
        document.getElementById("paymentDate");

    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );

    const paymentReference =
        document.getElementById(
            "paymentReference"
        );

    const paymentNotes =
        document.getElementById(
            "paymentNotes"
        );

    const paymentSubmit =
        document.getElementById(
            "paymentSubmit"
        );

    const paymentFormMessage =
        document.getElementById(
            "paymentFormMessage"
        );


    /* =====================================================
       BOOKING DETAILS
    ===================================================== */

    const bookingBudget =
        document.getElementById(
            "bookingBudget"
        );

    const bookingServices =
        document.getElementById(
            "bookingServices"
        );

    const bookingNotes =
        document.getElementById(
            "bookingNotes"
        );

    const printBookingButton =
        document.getElementById(
            "printBookingButton"
        );


    /* =====================================================
       RECEIPT ELEMENTS
    ===================================================== */

    const receiptModal =
        document.getElementById(
            "receiptModal"
        );

    const receiptPreview =
        document.getElementById(
            "receiptPreview"
        );

    const receiptClose =
        document.getElementById(
            "receiptClose"
        );

    const receiptCancel =
        document.getElementById(
            "receiptCancel"
        );

    const downloadReceiptButton =
        document.getElementById(
            "downloadReceiptButton"
        );


    /* =====================================================
       STATE
    ===================================================== */

    let booking = null;
    let client = null;
    let payments = [];
    let services = [];
    let selectedPayment = null;


    /* =====================================================
       URL
    ===================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const bookingDatabaseId =
        urlParams.get("id");


    /* =====================================================
       SIDEBAR
    ===================================================== */

    sidebarCollapse?.addEventListener(
        "click",
        (event) => {

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


    function todayInputValue() {

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

        return `${year}-${month}-${day}`;

    }


    function normalize(value) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase();

    }


    function getBookingTime() {

        return (
            booking?.event_time ||
            booking?.time ||
            booking?.eventTime ||
            ""
        );

    }


    function getLocation() {

        return (
            booking?.location ||
            booking?.venue ||
            ""
        );

    }


    function getGuestCount() {

        return (
            booking?.guest_count ??
            booking?.guests ??
            booking?.expected_guests ??
            ""
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
       LOAD BOOKING
    ===================================================== */

    async function loadBooking() {

        if (!bookingDatabaseId) {

            showPageError(
                "No booking was selected."
            );

            return;

        }

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("bookings")
                    .select("*")
                    .eq(
                        "id",
                        bookingDatabaseId
                    )
                    .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {

                throw new Error(
                    "The selected booking could not be found."
                );

            }

            booking = data;

            await loadRelatedData();

            renderBooking();

            if (bookingLoading) {
                bookingLoading.hidden = true;
            }

            if (bookingContent) {
                bookingContent.hidden = false;
            }

        } catch (error) {

            console.error(
                "Booking loading error:",
                error
            );

            showPageError(
                error.message ||
                "Unable to load this booking."
            );

        }

    }


    /* =====================================================
       LOAD RELATED DATA
    ===================================================== */

    async function loadRelatedData() {

        const [
            clientResponse,
            paymentsResponse,
            servicesResponse
        ] =
            await Promise.all([

                booking?.client_id

                    ? supabaseClient
                        .from("clients")
                        .select("*")
                        .eq(
                            "id",
                            booking.client_id
                        )
                        .maybeSingle()

                    : Promise.resolve({
                        data: null,
                        error: null
                    }),

                supabaseClient
                    .from("payments")
                    .select("*")
                    .eq(
                        "booking_id",
                        booking.id
                    )
                    .order(
                        "payment_date",
                        {
                            ascending: false
                        }
                    ),

                supabaseClient
                    .from("booking_services")
                    .select("*")
                    .eq(
                        "booking_id",
                        booking.id
                    )

            ]);


        if (clientResponse.error) {
            throw clientResponse.error;
        }

        if (paymentsResponse.error) {
            throw paymentsResponse.error;
        }

        if (servicesResponse.error) {
            throw servicesResponse.error;
        }


        client =
            clientResponse.data || null;

        payments =
            paymentsResponse.data || [];

        services =
            servicesResponse.data || [];

    }


    /* =====================================================
       RENDER BOOKING
    ===================================================== */

    function renderBooking() {

        const title =
            booking.event_name ||
            booking.event_type ||
            "Booking";

        const reference =
            booking.booking_id ||
            booking.id;


        if (bookingTitle) {

            bookingTitle.textContent =
                title + ".";

        }


        if (bookingReference) {

            bookingReference.textContent =
                reference;

        }


        if (bookingId) {

            bookingId.textContent =
                reference;

        }


        if (clientName) {

            clientName.textContent =
                client?.full_name ||
                "Unknown client";

        }


        if (clientPhone) {

            clientPhone.textContent =
                client?.phone ||
                "No phone number";

            clientPhone.href =
                client?.phone
                    ? `tel:${client.phone}`
                    : "#";

        }


        if (clientEmail) {

            clientEmail.textContent =
                client?.email ||
                "No email address";

            clientEmail.href =
                client?.email
                    ? `mailto:${client.email}`
                    : "#";

        }


        if (clientCompany) {

            clientCompany.textContent =
                client?.company ||
                "Private client";

        }


        if (eventName) {

            eventName.textContent =
                booking.event_name ||
                "Event";

        }


        if (eventType) {

            eventType.textContent =
                booking.event_type ||
                "Event type not specified";

        }


        if (eventDate) {

            eventDate.textContent =
                formatDate(
                    booking.event_date
                );

        }


        if (eventTime) {

            eventTime.textContent =
                getBookingTime() ||
                "Time not specified";

        }


        if (eventVenue) {

            eventVenue.textContent =
                getLocation() ||
                "Venue not specified";

        }


        if (guestCount) {

            const guests =
                getGuestCount();

            guestCount.textContent =
                guests
                    ? Number(
                        guests
                    ).toLocaleString(
                        "en-UG"
                    )
                    : "Not specified";

        }


        if (bookingCreated) {

            bookingCreated.textContent =
                formatDate(
                    booking.created_at
                );

        }


        if (bookingBudget) {

            bookingBudget.textContent =
                booking.budget ||
                "Not specified";

        }


        if (bookingNotes) {

            bookingNotes.textContent =
                booking.notes ||
                "No client brief was provided.";

        }


        renderServices();
        renderFinancials();
        renderStatus();
        renderPayments();

    }


    /* =====================================================
       SERVICES
    ===================================================== */

    function renderServices() {

        if (!bookingServices) {
            return;
        }

        if (!services.length) {

            bookingServices.textContent =
                "No services recorded";

            return;

        }


        const names =
            services
                .map(
                    service =>
                        service.service_name ||
                        service.name ||
                        ""
                )
                .filter(Boolean);


        bookingServices.textContent =
            names.length
                ? names.join(" · ")
                : "No services recorded";

    }


    /* =====================================================
       FINANCIALS
    ===================================================== */

    function getTotalAgreed() {

        return Number(
            booking?.total_amount || 0
        );

    }


    function getTotalReceived() {

        return payments.reduce(
            (
                sum,
                payment
            ) => {

                return (
                    sum +
                    Number(
                        payment.amount || 0
                    )
                );

            },
            0
        );

    }


    function getBalance() {

        return Math.max(
            getTotalAgreed() -
            getTotalReceived(),
            0
        );

    }


    function renderFinancials() {

        const agreed =
            getTotalAgreed();

        const received =
            getTotalReceived();

        const balance =
            getBalance();


        const percentage =
            agreed > 0
                ? Math.min(
                    (
                        received /
                        agreed
                    ) * 100,
                    100
                )
                : 0;


        if (totalAgreed) {

            totalAgreed.textContent =
                formatUGX(
                    agreed
                );

        }


        if (totalReceived) {

            totalReceived.textContent =
                formatUGX(
                    received
                );

        }


        if (balanceAmount) {

            balanceAmount.textContent =
                formatUGX(
                    balance
                );

        }


        if (paymentPercentage) {

            paymentPercentage.textContent =
                `${Math.round(
                    percentage
                )}%`;

        }


        if (paymentProgressFill) {

            paymentProgressFill.style.width =
                `${percentage}%`;

        }

    }


    /* =====================================================
       EDIT TOTAL AGREED
    ===================================================== */

    function openTotalAgreedEditor() {

        if (!totalAgreedEditForm) {
            return;
        }

        if (totalAgreedInput) {

            totalAgreedInput.value =
                Number(
                    booking?.total_amount || 0
                );

        }


        if (totalAgreedEditMessage) {

            totalAgreedEditMessage.textContent =
                "";

            totalAgreedEditMessage.className =
                "financial-edit-message";

        }


        totalAgreedEditForm.hidden =
            false;


        totalAgreedInput?.focus();
        totalAgreedInput?.select();

    }


    function closeTotalAgreedEditor() {

        if (totalAgreedEditForm) {

            totalAgreedEditForm.hidden =
                true;

        }


        if (totalAgreedEditMessage) {

            totalAgreedEditMessage.textContent =
                "";

            totalAgreedEditMessage.className =
                "financial-edit-message";

        }

    }


    async function saveTotalAgreed() {

        if (!booking) {
            return;
        }


        const amount =
            Number(
                totalAgreedInput?.value
            );


        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            if (totalAgreedEditMessage) {

                totalAgreedEditMessage.textContent =
                    "Enter a valid agreed amount.";

                totalAgreedEditMessage.className =
                    "financial-edit-message error";

            }

            return;

        }


        if (saveTotalAgreedButton) {

            saveTotalAgreedButton.disabled =
                true;

            saveTotalAgreedButton.textContent =
                "SAVING...";

        }


        try {

            /*
             * IMPORTANT:
             * We intentionally do NOT use .single()
             * here.
             *
             * Supabase can return zero rows after
             * an UPDATE when RLS/RETURNING behavior
             * prevents the updated row from being
             * returned.
             */

            const {
                error: updateError
            } =
                await supabaseClient
                    .from("bookings")
                    .update({
                        total_amount: amount
                    })
                    .eq(
                        "id",
                        booking.id
                    );


            if (updateError) {
                throw updateError;
            }


            /*
             * Re-fetch the booking separately.
             * This avoids the PostgREST single-object
             * coercion problem.
             */

            const {
                data: refreshedBooking,
                error: refreshError
            } =
                await supabaseClient
                    .from("bookings")
                    .select("*")
                    .eq(
                        "id",
                        booking.id
                    )
                    .maybeSingle();


            if (refreshError) {
                throw refreshError;
            }


            if (!refreshedBooking) {

                throw new Error(
                    "The amount was updated, but the booking could not be refreshed."
                );

            }


            booking =
                refreshedBooking;


            renderFinancials();
            renderStatus();


            if (totalAgreedEditForm) {

                totalAgreedEditForm.hidden =
                    true;

            }


            if (totalAgreedEditMessage) {

                totalAgreedEditMessage.textContent =
                    "Amount saved successfully.";

                totalAgreedEditMessage.className =
                    "financial-edit-message success";

            }


        } catch (error) {

            console.error(
                "Total agreed update error:",
                error
            );


            if (totalAgreedEditMessage) {

                totalAgreedEditMessage.textContent =
                    error.message ||
                    "Unable to save the agreed amount.";

                totalAgreedEditMessage.className =
                    "financial-edit-message error";

            }

        } finally {

            if (saveTotalAgreedButton) {

                saveTotalAgreedButton.disabled =
                    false;

                saveTotalAgreedButton.textContent =
                    "SAVE AMOUNT";

            }

        }

    }


    editTotalAgreedButton?.addEventListener(
        "click",
        openTotalAgreedEditor
    );


    cancelTotalAgreedButton?.addEventListener(
        "click",
        closeTotalAgreedEditor
    );


    saveTotalAgreedButton?.addEventListener(
        "click",
        saveTotalAgreed
    );


    totalAgreedInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                saveTotalAgreed();

            }


            if (
                event.key ===
                "Escape"
            ) {

                closeTotalAgreedEditor();

            }

        }
    );


    /* =====================================================
       STATUS
    ===================================================== */

    function renderStatus() {

        if (!bookingStatus) {
            return;
        }


        const originalStatus =
            booking.status ||
            "NEW";


        const normalized =
            normalize(
                originalStatus
            );


        let effectiveStatus =
            originalStatus;


        if (
            normalized ===
            "cancelled"
        ) {

            effectiveStatus =
                "CANCELLED";

        }

        else if (
            getTotalAgreed() > 0 &&
            getBalance() <= 0
        ) {

            effectiveStatus =
                "FULLY PAID";

        }

        else if (
            getTotalReceived() > 0
        ) {

            effectiveStatus =
                "PARTIALLY PAID";

        }

        else {

            effectiveStatus =
                String(
                    originalStatus
                ).toUpperCase();

        }


        bookingStatus.textContent =
            effectiveStatus;


        bookingStatus.className =
            "booking-status";


        if (
            effectiveStatus ===
            "FULLY PAID"
        ) {

            bookingStatus.classList.add(
                "paid"
            );

        }

        else if (
            effectiveStatus ===
            "PARTIALLY PAID"
        ) {

            bookingStatus.classList.add(
                "partial"
            );

        }

        else if (
            effectiveStatus ===
            "CONFIRMED"
        ) {

            bookingStatus.classList.add(
                "confirmed"
            );

        }

        else if (
            effectiveStatus ===
            "CANCELLED"
        ) {

            bookingStatus.classList.add(
                "cancelled"
            );

        }

    }


    /* =====================================================
       PAYMENT HISTORY
    ===================================================== */

    function renderPayments() {

        if (
            !paymentHistoryCount ||
            !paymentHistoryList
        ) {
            return;
        }


        const count =
            payments.length;


        paymentHistoryCount.textContent =
            `${count} ${
                count === 1
                    ? "payment"
                    : "payments"
            }`;


        if (!count) {

            paymentHistoryList.innerHTML = `
                <div class="payment-history-empty">
                    No payments have been recorded for this booking.
                </div>
            `;

            return;

        }


        paymentHistoryList.innerHTML =
            payments
                .map(
                    payment => `

                        <div
                            class="payment-history-row"
                            data-payment-id="${escapeHTML(
                                payment.id
                            )}"
                        >

                            <div class="history-date">
                                ${formatShortDate(
                                    payment.payment_date
                                )}
                            </div>

                            <div class="history-type">
                                ${escapeHTML(
                                    payment.payment_type ||
                                    "Other"
                                )}
                            </div>

                            <div class="history-method">
                                ${escapeHTML(
                                    payment.payment_method ||
                                    "—"
                                )}
                            </div>

                            <div class="history-reference">
                                ${escapeHTML(
                                    payment.reference ||
                                    "—"
                                )}
                            </div>

                            <div class="history-amount">
                                ${formatUGX(
                                    payment.amount
                                )}
                            </div>

                            <div>
                                <button
                                    type="button"
                                    class="history-delete"
                                    data-payment-id="${escapeHTML(
                                        payment.id
                                    )}"
                                >
                                    DELETE
                                </button>
                            </div>

                        </div>

                    `
                )
                .join("");


        document
            .querySelectorAll(
                ".history-delete"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deletePayment(
                                button.dataset
                                    .paymentId
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       ADD PAYMENT
    ===================================================== */

    if (paymentDate) {

        paymentDate.value =
            todayInputValue();

    }


    paymentForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await addPayment();

        }
    );


    async function addPayment() {

        clearFormMessage();


        if (!booking) {

            showFormMessage(
                "Booking information is not available.",
                "error"
            );

            return;

        }


        const type =
            paymentType?.value.trim() || "";


        const amount =
            Number(
                paymentAmount?.value
            );


        const date =
            paymentDate?.value || "";


        const method =
            paymentMethod?.value.trim() || "";


        const reference =
            paymentReference?.value.trim() || "";


        const notes =
            paymentNotes?.value.trim() || "";


        if (!type) {

            showFormMessage(
                "Select a payment type.",
                "error"
            );

            return;

        }


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showFormMessage(
                "Enter a valid payment amount.",
                "error"
            );

            return;

        }


        if (!date) {

            showFormMessage(
                "Select the payment date.",
                "error"
            );

            return;

        }


        if (!method) {

            showFormMessage(
                "Select the payment method.",
                "error"
            );

            return;

        }


        const balance =
            getBalance();


        if (
            balance > 0 &&
            amount > balance
        ) {

            const proceed =
                window.confirm(
                    `This payment is ${formatUGX(
                        amount - balance
                    )} more than the current balance. Continue?`
                );


            if (!proceed) {
                return;
            }

        }


        if (paymentSubmit) {

            paymentSubmit.disabled =
                true;

            const buttonText =
                paymentSubmit.querySelector(
                    "span:first-child"
                );

            if (buttonText) {

                buttonText.textContent =
                    "RECORDING...";

            }

        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("payments")
                    .insert({
                        booking_id:
                            booking.id,

                        payment_type:
                            type,

                        amount:
                            amount,

                        payment_date:
                            date,

                        payment_method:
                            method,

                        reference:
                            reference || null,

                        notes:
                            notes || null
                    })
                    .select();


            if (error) {
                throw error;
            }


            if (
                !data ||
                data.length === 0
            ) {

                throw new Error(
                    "Payment was saved, but Supabase did not return the payment record."
                );

            }


            const payment =
                data[0];


            showFormMessage(
                "Payment recorded successfully.",
                "success"
            );


            paymentForm?.reset();


            if (paymentDate) {

                paymentDate.value =
                    todayInputValue();

            }


            payments.unshift(
                payment
            );


            renderFinancials();
            renderStatus();
            renderPayments();


            selectedPayment =
                payment;


            openReceipt(
                payment
            );


        } catch (error) {

            console.error(
                "Payment insert error:",
                error
            );


            showFormMessage(
                error.message ||
                "Unable to record payment.",
                "error"
            );

        } finally {

            if (paymentSubmit) {

                paymentSubmit.disabled =
                    false;


                const buttonText =
                    paymentSubmit.querySelector(
                        "span:first-child"
                    );


                if (buttonText) {

                    buttonText.textContent =
                        "RECORD PAYMENT";

                }

            }

        }

    }


    /* =====================================================
       DELETE PAYMENT
    ===================================================== */

    async function deletePayment(
        paymentId
    ) {

        const payment =
            payments.find(
                item =>
                    String(item.id) ===
                    String(paymentId)
            );


        if (!payment) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete this ${formatUGX(
                    payment.amount
                )} payment record? This cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("payments")
                    .delete()
                    .eq(
                        "id",
                        paymentId
                    );


            if (error) {
                throw error;
            }


            payments =
                payments.filter(
                    item =>
                        String(item.id) !==
                        String(paymentId)
                );


            renderFinancials();
            renderStatus();
            renderPayments();


        } catch (error) {

            console.error(
                "Payment deletion error:",
                error
            );


            window.alert(
                error.message ||
                "Unable to delete this payment."
            );

        }

    }


    /* =====================================================
       FORM MESSAGES
    ===================================================== */

    function showFormMessage(
        message,
        type
    ) {

        if (!paymentFormMessage) {
            return;
        }


        paymentFormMessage.textContent =
            message;


        paymentFormMessage.className =
            "payment-form-message " +
            (type || "");

    }


    function clearFormMessage() {

        if (!paymentFormMessage) {
            return;
        }


        paymentFormMessage.textContent =
            "";


        paymentFormMessage.className =
            "payment-form-message";

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
       OPEN RECEIPT
    ===================================================== */

    function openReceipt(
        payment
    ) {

        if (
            !receiptModal ||
            !receiptPreview ||
            !booking
        ) {
            return;
        }


        selectedPayment =
            payment;


        const receiptNumber =
            generateReceiptNumber(
                payment
            );


        const agreed =
            getTotalAgreed();


        const received =
            getTotalReceived();


        const balance =
            getBalance();


        receiptPreview.innerHTML = `

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
                                receiptNumber
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
                                booking.booking_id ||
                                booking.id
                            )}
                        </strong>

                    </div>


                    <div class="receipt-detail">

                        <span>
                            EVENT
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking.event_name ||
                                booking.event_type ||
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
                                booking.event_date
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
                                received
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


        receiptModal.classList.add(
            "open"
        );


        receiptModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE RECEIPT
    ===================================================== */

    function closeReceipt() {

        if (!receiptModal) {
            return;
        }


        receiptModal.classList.remove(
            "open"
        );


        receiptModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    receiptClose?.addEventListener(
        "click",
        closeReceipt
    );


    receiptCancel?.addEventListener(
        "click",
        closeReceipt
    );


    receiptModal
        ?.querySelector(
            ".receipt-modal-backdrop"
        )
        ?.addEventListener(
            "click",
            closeReceipt
        );


    /* =====================================================
       DOWNLOAD RECEIPT PDF
    ===================================================== */

    downloadReceiptButton?.addEventListener(
        "click",
        () => {

            if (!selectedPayment) {
                return;
            }

            generatePDF(
                selectedPayment
            );

        }
    );


    /* =====================================================
       GENERATE PDF
    ===================================================== */

    function generatePDF(
        payment
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


        const agreed =
            getTotalAgreed();

        const received =
            getTotalReceived();

        const balance =
            getBalance();


        const receiptNumber =
            generateReceiptNumber(
                payment
            );


        let y = 22;


        /* =================================================
           BRAND
        ================================================= */

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


        /* =================================================
           TITLE
        ================================================= */

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


        /* =================================================
           PDF DETAIL HELPER
        ================================================= */

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
                label.toUpperCase(),
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


        /* =================================================
           CLIENT / BOOKING
        ================================================= */

        pdfLabel(
            "CLIENT",
            client?.full_name,
            20,
            y
        );


        pdfLabel(
            "BOOKING",
            booking.booking_id ||
            booking.id,
            105,
            y
        );


        y += 22;


        pdfLabel(
            "EVENT",
            booking.event_name ||
            booking.event_type,
            20,
            y
        );


        pdfLabel(
            "EVENT DATE",
            formatDate(
                booking.event_date
            ),
            105,
            y
        );


        y += 28;


        /* =================================================
           FINANCIAL TABLE
        ================================================= */

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


        /* =================================================
           FOOTER
        ================================================= */

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
       PRINT BOOKING
    ===================================================== */

    printBookingButton?.addEventListener(
        "click",
        () => {

            window.print();

        }
    );


    /* =====================================================
       ERROR PAGE
    ===================================================== */

    function showPageError(
        message
    ) {

        if (!bookingLoading) {
            return;
        }


        bookingLoading.innerHTML = `

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
                    Unable to load booking.
                </strong>


                <span>
                    ${escapeHTML(
                        message
                    )}
                </span>


                <br>
                <br>


                <a
                    href="bookings.html"
                    style="
                        color:var(--admin-black);
                        font-size:9px;
                        font-weight:700;
                        letter-spacing:.1em;
                        text-transform:uppercase;
                    "
                >
                    ← BACK TO BOOKINGS
                </a>

            </div>

        `;

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        if (paymentDate) {

            paymentDate.value =
                todayInputValue();

        }


        const authenticated =
            await checkAuthentication();


        if (!authenticated) {
            return;
        }


        await loadBooking();

    }


    initialize();

});