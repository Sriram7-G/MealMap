
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function testCustomerRegistration() {
    let driver;

    let passed = 0;
    let failed = 0;

    function pass(message) {
        console.log(`PASS: ${message}`);
        passed++;
    }

    function fail(message) {
        console.error(`FAIL: ${message}`);
        failed++;
    }

    try {
        const options = new chrome.Options();
        options.addArguments("--incognito");
        options.addArguments("--start-maximized");

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();

        console.log("\n==================================");
        console.log(" CUSTOMER REGISTRATION TEST SUITE");
        console.log("==================================");

        // Helper: Open registration modal
        async function openRegistrationModal() {
            await driver.get("http://localhost:8085");

            const registerButton = await driver.wait(
                until.elementLocated(
                    By.xpath(
                        "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'get started')]"
                    )
                ),
                10000
            );

            await registerButton.click();

            const modal = await driver.wait(
                until.elementLocated(By.id("registerModal")),
                10000
            );

            await driver.wait(until.elementIsVisible(modal), 5000);
        }

        // Helper: Fill registration form
        async function fillRegistration(name, email, password) {
            const nameField = await driver.findElement(By.id("registerName"));
            const emailField = await driver.findElement(By.id("registerEmail"));
            const passwordField = await driver.findElement(By.id("registerPassword"));

            await nameField.clear();
            await emailField.clear();
            await passwordField.clear();

            if (name) await nameField.sendKeys(name);
            if (email) await emailField.sendKeys(email);
            if (password) await passwordField.sendKeys(password);
        }

        // Helper: Submit registration
        async function submitRegistration() {
            await driver.findElement(
                By.css("#registerForm button[type='submit']")
            ).click();
        }

        // Helper: Read application response
        async function getResponse() {
            const message = await driver.findElement(
                By.id("registerMessage")
            );

            await driver.wait(async () => {
                return (await message.getText()).trim().length > 0;
            }, 10000);

            return await message.getText();
        }

        // TEST 1: Successful registration
        console.log("\nTEST 1: Successful Registration");

        const validEmail = `mealmap.test.${Date.now()}@example.com`;

        await openRegistrationModal();

        await fillRegistration(
            "MealMap Test User",
            validEmail,
            "Test@123456"
        );

        await submitRegistration();

        const successResponse = await getResponse();

        if (successResponse.toLowerCase().includes("success")) {
            pass("Customer registered successfully.");
            console.log("Test email:", validEmail);
        } else {
            fail("Valid registration failed: " + successResponse);
        }

        // TEST 2: Duplicate email registration
        console.log("\nTEST 2: Duplicate Email Registration");

        await openRegistrationModal();

        await fillRegistration(
            "MealMap Duplicate User",
            validEmail,
            "Test@123456"
        );

        await submitRegistration();

        const duplicateResponse = await getResponse();

        if (
            duplicateResponse.toLowerCase().includes("already exists") ||
            duplicateResponse.toLowerCase().includes("already registered")
        ) {
            pass("Duplicate email registration rejected.");
        } else {
            fail("Unexpected duplicate registration response: " + duplicateResponse);
        }

        // TEST 3: Invalid email validation
        console.log("\nTEST 3: Invalid Email Validation");

        await openRegistrationModal();

        await fillRegistration(
            "Invalid Email User",
            "not-an-email",
            "Test@123456"
        );

        const emailField = await driver.findElement(
            By.id("registerEmail")
        );

        const isValidEmail = await driver.executeScript(
            "return arguments[0].checkValidity();",
            emailField
        );

        if (!isValidEmail) {
            const validation = await driver.executeScript(
                "return arguments[0].validationMessage;",
                emailField
            );

            pass("Invalid email rejected by browser validation.");
            console.log("Validation:", validation);
        } else {
            fail("Invalid email was accepted by browser validation.");
        }

        // TEST 4: Empty field validation
        console.log("\nTEST 4: Empty Field Validation");

        const fields = [
            { id: "registerName", label: "Name" },
            { id: "registerEmail", label: "Email" },
            { id: "registerPassword", label: "Password" }
        ];

        for (const fieldInfo of fields) {
            await openRegistrationModal();

            await submitRegistration();

            const field = await driver.findElement(
                By.id(fieldInfo.id)
            );

            const validation = await driver.executeScript(
                "return arguments[0].validationMessage;",
                field
            );

            if (validation) {
                pass(`Empty ${fieldInfo.label} rejected.`);
            } else {
                fail(`Empty ${fieldInfo.label} was not rejected.`);
            }
        }

        // TEST 5: Password length validation
        console.log("\nTEST 5: Password Length Validation");

        async function checkPassword(password, shouldPass) {
            await openRegistrationModal();

            const email = `password.test.${Date.now()}.${password.length}@example.com`;

            await fillRegistration(
                "Password Test User",
                email,
                password
            );

            await submitRegistration();

            const passwordField = await driver.findElement(
                By.id("registerPassword")
            );

            if (!shouldPass) {
                const validation = await driver.executeScript(
                    "return arguments[0].validationMessage;",
                    passwordField
                );

                if (validation) {
                    pass(`${password.length}-character password rejected.`);
                    console.log("Validation:", validation);
                } else {
                    fail(`${password.length}-character password was not rejected.`);
                }
            } else {
                const response = await getResponse();

                if (response.toLowerCase().includes("success")) {
                    pass(`${password.length}-character password accepted.`);
                } else {
                    fail("Six-character password rejected: " + response);
                }
            }
        }

        await checkPassword("abc", false);
        await checkPassword("abcde", false);
        await checkPassword("abcdef", true);

        // TEST 6: Browser console errors
        console.log("\nTEST 6: Browser Console Check");

        const browserLogs = await driver.manage().logs().get("browser");

        const unexpectedErrors = browserLogs.filter(log => {
            const message = log.message.toLowerCase();

            // Ignore expected duplicate-email API response.
            if (
                message.includes("/api/auth/register") &&
                message.includes("409 (conflict)")
            ) {
                return false;
            }

            return log.level.name === "SEVERE";
        });

        if (unexpectedErrors.length === 0) {
            pass("No unexpected severe browser errors detected.");
        } else {
            fail(`${unexpectedErrors.length} unexpected browser errors detected.`);

            unexpectedErrors.forEach(error => {
                console.log(error.message);
            });
        }

    } catch (error) {
        console.error("\nUNEXPECTED TEST ERROR:", error.message);
        failed++;

    } finally {
        if (driver) {
            await driver.quit();
        }

        console.log("\n==================================");
        console.log(" CUSTOMER REGISTRATION SUMMARY");
        console.log("==================================");
        console.log(`Passed : ${passed}`);
        console.log(`Failed : ${failed}`);
        console.log(`Total  : ${passed + failed}`);
        console.log("==================================\n");

        if (failed > 0) {
            console.log("CUSTOMER REGISTRATION TESTS FAILED!");
            process.exitCode = 1;
        } else {
            console.log("ALL CUSTOMER REGISTRATION TESTS PASSED!");
        }
    }
}

testCustomerRegistration();
