"use strict";

const faqAssistantForm = document.getElementById("faqAssistantForm");

if (faqAssistantForm) {
    const faqAssistantInput = document.getElementById("faqAssistantQuestion");
    const faqAssistantLog = document.getElementById("faqAssistantLog");
    const stopWords = new Set([
        "about", "and", "are", "can", "do", "does", "for", "from", "get", "how", "i", "is", "it",
        "me", "my", "of", "on", "our", "the", "this", "to", "we", "what", "when", "who", "with", "you",
    ]);
    const synonyms = {
        "apply": "start",
        "career": "training",
        "careers": "training",
        "company": "business",
        "companies": "business",
        "duration": "timeline",
        "experience": "practical",
        "learn": "training",
        "learning": "training",
        "long": "timeline",
        "mentor": "talent",
        "mentorship": "talent",
        "organization": "business",
        "organizations": "business",
        "platform": "digital",
        "platforms": "digital",
        "product": "digital",
        "products": "digital",
        "program": "training",
        "programs": "training",
        "solution": "digital",
        "solutions": "digital",
        "startup": "business",
        "startups": "business",
        "student": "training",
        "students": "training",
        "technology": "digital",
        "technologies": "digital",
        "train": "training",
        "trained": "training",
        "website": "digital",
        "websites": "digital",
        "young": "talent",
    };

    const normalizeTerms = (text) => text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length > 2 && !stopWords.has(term))
        .map((term) => synonyms[term] || term);

    const faqEntries = Array.from(document.querySelectorAll("#faqAccordion .accordion-item"))
        .map((item) => {
            const question = item.querySelector(".accordion-button")?.textContent
                .replace(/^Q\d+\.\s*/, "")
                .trim();
            const answer = item.querySelector(".accordion-body")?.textContent.trim();

            return question && answer
                ? {
                    question,
                    answer,
                    questionTerms: new Set(normalizeTerms(question)),
                    answerTerms: new Set(normalizeTerms(answer)),
                    keywordTerms: new Set(normalizeTerms(item.dataset.keywords || "")),
                }
                : null;
        })
        .filter(Boolean);

    const appendMessage = (message, sender) => {
        const bubble = document.createElement("div");
        const speaker = document.createElement("span");
        const text = document.createElement("p");

        bubble.className = `faq-assistant-message faq-assistant-${sender}`;
        speaker.className = "faq-assistant-speaker";
        speaker.textContent = sender === "user" ? "You" : "Assistant";
        text.textContent = message;
        bubble.append(speaker, text);
        faqAssistantLog.appendChild(bubble);
        faqAssistantLog.scrollTop = faqAssistantLog.scrollHeight;
    };

    const findAnswer = (question) => {
        const queryTerms = new Set(normalizeTerms(question));
        let bestMatch = null;

        for (const entry of faqEntries) {
            let score = 0;
            let matchedTerms = 0;

            for (const term of queryTerms) {
                let termScore = 0;
                if (entry.keywordTerms.has(term)) termScore += 3;
                if (entry.questionTerms.has(term)) termScore += 2;
                if (entry.answerTerms.has(term)) termScore += 1;

                if (termScore > 0) {
                    matchedTerms += 1;
                    score += termScore;
                }
            }

            const coverage = queryTerms.size ? matchedTerms / queryTerms.size : 0;
            if (!bestMatch || score > bestMatch.score) {
                bestMatch = { entry, score, coverage };
            }
        }

        if (!bestMatch || bestMatch.score < 3 || bestMatch.coverage < 0.3) {
            return "I couldn't find an answer to that in these FAQs. Please contact our team and we'll be happy to help.";
        }

        return `${bestMatch.entry.answer} (Related FAQ: ${bestMatch.entry.question})`;
    };

    faqAssistantForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const question = faqAssistantInput.value.trim();
        if (!question) return;

        appendMessage(question, "user");
        appendMessage(findAnswer(question), "reply");
        faqAssistantForm.reset();
        faqAssistantInput.focus();
    });
}