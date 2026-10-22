"use strict";

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const status = document.getElementById("contactFormStatus");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton.textContent;

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        status.className = "alert d-none mt-3 mb-0";
        status.textContent = "";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || (result.success !== true && result.success !== "true")) {
                throw new Error(result.message || "The message could not be sent.");
            }

            status.className = "alert alert-success mt-3 mb-0";
            status.textContent = "Thanks for reaching out. Your message has been sent.";
            contactForm.reset();
        } catch (error) {
            status.className = "alert alert-danger mt-3 mb-0";
            const detail = error instanceof Error ? ` ${error.message}` : "";
            status.textContent = `We couldn't send your message.${detail} Please try again or email infos@newsightt.com.`;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = defaultButtonText;
        }
    });
}