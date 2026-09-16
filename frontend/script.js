// =====================================
// SAKSHAM - FRONTEND JAVASCRIPT
// =====================================


// -------------------------------------
// REGISTER FORM
// -------------------------------------

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        // Page reload hone se rokna
        event.preventDefault();

        // Form values lena
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("registerRole").value;


        // Name check
        if (name === "") {
            alert("Please enter your full name.");
            return;
        }


        // Email check
        if (email === "") {
            alert("Please enter your email address.");
            return;
        }


        // Password length check
        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }


        // Password match check
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }


        // Role check
        if (role === "") {
            alert("Please select your role.");
            return;
        }


        // Send data to backend
        try {

            const response = await fetch(
                "https://saksham-backend-d0h9.onrender.com/api/students/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            // Registration successful
            if (response.ok) {

                localStorage.setItem("studentId", data.student.id);
                localStorage.setItem("token", data.token);

                alert(
                    "Registration successful! 🎉\n\n" +
                    "Welcome to SAKSHAM, " + name + "!"
                );

                registerForm.reset();

            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error("Registration error:", error);

            alert(
                "Unable to connect to SAKSHAM server.\n" +
                "Please make sure the backend server is running."
            );

        }

    });

}

// =====================================
// LOGIN FORM
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        // Page reload hone se rokna
        event.preventDefault();

        // Form values lena
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        // Email check
        if (email === "") {
            alert("Please enter your email address.");
            return;
        }

        // Password check
        if (password === "") {
            alert("Please enter your password.");
            return;
        }

        // Role check
        if (role === "") {
            alert("Please select your role.");
            return;
        }

        // Backend ko login request bhejna
        try {

            const response = await fetch(
                "https://saksham-backend-d0h9.onrender.com/api/students/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            // Login successful
            if (response.ok) {

    // Backend se account ka actual role
    const actualRole = data.student.role;

    // Login page ke roles ko backend roles se map karo
    const roleMap = {
        student: "student",
        company: "employer",
        college: "admin"
    };

    const selectedRole = roleMap[role];

    // Selected role aur account role match hona chahiye
    if (selectedRole !== actualRole) {

        alert(
            "Selected role does not match this account."
        );

        return;
    }

    // Login information save karo
    localStorage.setItem("studentId", data.student.id);
    localStorage.setItem("token", data.token);
    localStorage.setItem("studentName", data.student.name);
    localStorage.setItem("studentEmail", data.student.email);
    localStorage.setItem("userRole", actualRole);

    alert(
        "Login successful! 🎉\n\n" +
        "Welcome back, " + data.student.name + "!"
    );

    // Role ke according dashboard open karo
    if (actualRole === "student") {

        window.location.href = "student-dashboard.html";

    } else if (actualRole === "employer") {

        window.location.href = "company-dashboard.html";

    } else if (actualRole === "admin") {

        window.location.href = "admin-dashboard.html";
    }

            } else {

            alert(data.message);

            }

                

            

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to SAKSHAM server.\n" +
                "Please make sure the backend server is running."
            );
        }

    });
}

// =====================================
// LOGOUT STUDENT
// =====================================

function logoutStudent() {

    // Login session ki information remove karo
    localStorage.removeItem("studentId");
    localStorage.removeItem("token");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");

    // Login page par wapas bhejo
    window.location.href = "login.html";
}