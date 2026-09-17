// ========================================
// SAKSHAM AI ASSISTANT
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // Create chatbot button
    const chatbotButton = document.createElement("button");

    chatbotButton.id = "sakshamChatbotButton";
    chatbotButton.innerHTML = "🤖";
    chatbotButton.title = "Ask SAKSHAM AI";


    // Create chatbot window
    const chatbotWindow = document.createElement("div");

    chatbotWindow.id = "sakshamChatbotWindow";

    chatbotWindow.innerHTML = `
        <div class="chatbot-header">

            <div>
                <strong>🤖 SAKSHAM AI Assistant</strong>
                <small>Smart Student Support</small>
            </div>

            <button id="closeChatbot">×</button>

        </div>


        <div id="chatbotMessages" class="chatbot-messages">

    <div class="bot-message">
        👋 Hi! I'm SAKSHAM AI Assistant.
        <br><br>
        I can help you with profiles, skills,
        internships, Skill Passport and
        SAKSHAM features.
    </div>

    <div class="quick-questions">

        <div class="quick-title">
            ⚡ Quick Questions
        </div>

        <button class="quick-question">
            How can I build my profile?
        </button>

        <button class="quick-question">
            How can I find internships?
        </button>

        <button class="quick-question">
            What is Skill Passport?
        </button>

        <button class="quick-question">
            How does Skill Match work?
        </button>

        <button class="quick-question">
            How can I track my applications?
        </button>

    </div>

</div>


        <div class="chatbot-input-area">

            <input
                type="text"
                id="chatbotInput"
                placeholder="Ask something..."
            >

            <button id="chatbotSend">
                ➤
            </button>

        </div>
    `;


    // Add chatbot to page
    document.body.appendChild(chatbotButton);
    document.body.appendChild(chatbotWindow);


    // Open chatbot
    chatbotButton.addEventListener("click", function () {

        chatbotWindow.classList.add("active");

    });


    // Close chatbot
    document
        .getElementById("closeChatbot")
        .addEventListener("click", function () {

            chatbotWindow.classList.remove("active");

        });


    // Send button
    document
        .getElementById("chatbotSend")
        .addEventListener("click", sendMessage);


    // Enter key
    document
        .getElementById("chatbotInput")
        .addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                sendMessage();

            }

        });

        // ========================================
// QUICK QUESTIONS
// ========================================

document
    .querySelectorAll(".quick-question")
    .forEach(function (questionButton) {

        questionButton.addEventListener(
            "click",
            function () {

                const input =
                    document.getElementById(
                        "chatbotInput"
                    );

                input.value =
                    this.textContent.trim();

                sendMessage();

            }
        );

    });


    // ========================================
    // SMART RESPONSE SYSTEM
    // ========================================

    function getBotResponse(message) {

        const text =
            message.toLowerCase();


        // Profile
        if (
            text.includes("profile") ||
            text.includes("प्रोफ़ाइल") ||
            text.includes("प्रोफाइल")
        ) {

            return (
                "You can build and update your professional profile " +
                "from the Student Profile section."
            );

        }


        // Skills
        if (
            text.includes("skill") ||
            text.includes("skills") ||
            text.includes("स्किल")
        ) {

            return (
                "You can add your professional skills from " +
                "Student Skills. SAKSHAM can also help you " +
                "identify skill gaps."
            );

        }


        // Internship
        if (
            text.includes("internship") ||
            text.includes("internships") ||
            text.includes("इंटर्नशिप")
        ) {

            return (
                "Open the Opportunities section to explore " +
                "available internships and career opportunities."
            );

        }


        // Skill Passport
        if (
            text.includes("passport") ||
            text.includes("skill passport") ||
            text.includes("पासपोर्ट")
        ) {

            return (
                "Your Digital Skill Passport organizes your " +
                "academic and professional skill information " +
                "in one digital profile."
            );

        }


        // Skill Match
        if (
            text.includes("match") ||
            text.includes("skill match") ||
            text.includes("मैच")
        ) {

            return (
                "Skill Match compares your skills with the " +
                "skills required for an opportunity and shows " +
                "how closely your profile matches."
            );

        }


        // Applications
        if (
            text.includes("application") ||
            text.includes("applications") ||
            text.includes("आवेदन")
        ) {

            return (
                "You can track your internship and opportunity " +
                "applications from the My Applications section."
            );

        }


        // Recommendations
        if (
            text.includes("recommendation") ||
            text.includes("recommendations") ||
            text.includes("सुझाव")
        ) {

            return (
                "The Recommendations section helps you discover " +
                "opportunities that may match your skills and profile."
            );

        }


        // AYUSH
        if (
            text.includes("ayush") ||
            text.includes("ayurveda") ||
            text.includes("homeopathy") ||
            text.includes("yoga") ||
            text.includes("unani") ||
            text.includes("siddha")
        ) {

            return (
                "SAKSHAM supports students across AYUSH disciplines " +
                "including Ayurveda, Homeopathy, Yoga & Naturopathy, " +
                "Unani and Siddha."
            );

        }


        // Login
        if (
            text.includes("login") ||
            text.includes("log in") ||
            text.includes("लॉगिन")
        ) {

            return (
                "Use the Login option on the SAKSHAM website " +
                "to access your student account."
            );

        }


        // Greeting
        if (
            text.includes("hello") ||
            text.includes("hi") ||
            text.includes("hey") ||
            text.includes("नमस्ते")
        ) {

            return (
                "Hello! 👋 How can I help you with SAKSHAM today?"
            );

        }


        // Default response
        return (
            "I'm here to help with SAKSHAM. You can ask me " +
            "about profiles, skills, internships, Skill Passport, " +
            "Skill Match, applications or recommendations."
        );

    }


    // ========================================
    // SEND MESSAGE
    // ========================================

    function sendMessage() {

        const input =
            document.getElementById("chatbotInput");

        const message =
            input.value.trim();


        if (!message) {

            return;

        }


        const messages =
            document.getElementById("chatbotMessages");


        // User message
        const userMessage =
            document.createElement("div");

        userMessage.className =
            "user-message";

        userMessage.textContent =
            message;

        messages.appendChild(userMessage);


        // Clear input
        input.value = "";


        // Bot response
        setTimeout(function () {

            const botMessage =
                document.createElement("div");

            botMessage.className =
                "bot-message";

            botMessage.textContent =
                getBotResponse(message);

            messages.appendChild(botMessage);


            // Scroll to latest message
            messages.scrollTop =
                messages.scrollHeight;

        }, 400);


        messages.scrollTop =
            messages.scrollHeight;

    }

});