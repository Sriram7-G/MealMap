
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function testProviderRegistration() {
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
        console.log(" PROVIDER REGISTRATION TEST SUITE");
        console.log("==================================");

        // Helper: Open provider registration modal
        async function openProviderModal() {
            await driver.get("http://localhost:8085");

            const providerButton = await driver.wait(
                until.elementLocated(
                    By.xpath(
                        "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'provider')]"
                    )
                ),
                10000
            );

            await providerButton.click();

            const modal = await driver.wait(
                until.elementLocated(By.id("providerModal")),
                10000
            );

            await driver.wait(until.elementIsVisible(modal), 5000);
        }

        // Helper: Fill provider registration form
        async function fillProviderForm(data = {}) {
            const fields = {
                businessName: "businessName",
                ownerName: "ownerName",
                email: "providerEmail",
                phone: "providerPhone",
                password: "providerPassword",
                confirmPassword: "confirmPassword",
                businessType: "businessType",
                address: "providerAddress",
                city: "providerCity",
                description: "providerDescription"
            };

            const values = {
                businessName: "MealMap Test Catering",
                ownerName: "Test Provider",
                email: `provider.test.${Date.now()}@example.com`,
                phone: "9876543210",
                password: "Test@123456",
                confirmPassword: "Test@123456",
                businessType: "Caterer",
                address: "Kokapet",
                city: "Hyderabad",
                description: "Automated provider registration testing"
            };

            Object.assign(values, data);

            for (const [key, id] of Object.entries(fields)) {
                const element = await driver.findElement(By.id(id));

                if (key === "businessType") {
                    if (values[key]) {
                        await element.sendKeys(values[key]);
                    }
                } else if (values[key]) {
                    await element.clear();
                    await element.sendKeys(values[key]);
                }
            }

            return values;
        }

        // Helper: Submit form
        async function submitProviderForm() {
            await driver.findElement(
                By.css("#providerForm button[type='submit']")
            ).click();
        }

        // Helper: Read response
        async function getProviderResponse() {
            const message = await driver.findElement(
                By.id("providerMessage")
            );

            await driver.wait(async () => {
                return (await message.getText()).trim().length > 0;
            }, 10000);

            return await message.getText();
        }

        // TEST 1: Successful registration
        console.log("\nTEST 1: Successful Provider Registration");

        const validEmail = `provider.test.${Date.now()}@example.com`;

        await openProviderModal();

        await fillProviderForm({
            email: validEmail
        });

        await submitProviderForm();

        const successResponse = await getProviderResponse();

        if (successResponse.toLowerCase().includes("success")) {
            pass("Provider registered successfully.");
            console.log("Test email:", validEmail);
        } else {
            fail("Provider registration failed: " + successResponse);
        }

        // TEST 2: Duplicate email
        console.log("\nTEST 2: Duplicate Provider Email");

        await openProviderModal();

        await fillProviderForm({
            email: validEmail
        });

        await submitProviderForm();

        const duplicateResponse = await getProviderResponse();

        if (
            duplicateResponse.toLowerCase().includes("already exists") ||
            duplicateResponse.toLowerCase().includes("already registered")
        ) {
            pass("Duplicate provider email rejected.");
        } else {
            fail("Unexpected duplicate response: " + duplicateResponse);
        }

        // TEST 3: Invalid email
        console.log("\nTEST 3: Invalid Email Validation");

        await openProviderModal();

        await fillProviderForm({
            email: "not-an-email"
        });

        const emailField = await driver.findElement(
            By.id("providerEmail")
        );

        const emailValid = await driver.executeScript(
            "return arguments[0].checkValidity();",
            emailField
        );

        if (!emailValid) {
            const validation = await driver.executeScript(
                "return arguments[0].validationMessage;",
                emailField
            );

            pass("Invalid provider email rejected.");
            console.log("Validation:", validation);
        } else {
            fail("Invalid provider email was accepted.");
        }

        // TEST 4: Empty required fields
        console.log("\nTEST 4: Empty Required Fields");

        const requiredFields = [
            { id: "businessName", label: "Business Name" },
            { id: "ownerName", label: "Owner Name" },
            { id: "providerEmail", label: "Email" },
            { id: "providerPhone", label: "Phone" },
            { id: "providerPassword", label: "Password" },
            { id: "confirmPassword", label: "Confirm Password" },
            { id: "businessType", label: "Business Type" },
            { id: "providerAddress", label: "Address" },
            { id: "providerCity", label: "City" },
            { id: "providerDescription", label: "Description" }
        ];

        for (const fieldInfo of requiredFields) {
            await openProviderModal();

            await submitProviderForm();

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

        // TEST 5: Password length
        console.log("\nTEST 5: Password Length Validation");

        async function checkPassword(password, shouldPass) {
            await openProviderModal();

            await fillProviderForm({
                email: `provider.password.${Date.now()}.${password.length}@example.com`,
                password: password,
                confirmPassword: password
            });

            await submitProviderForm();

            const passwordField = await driver.findElement(
                By.id("providerPassword")
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
                const response = await getProviderResponse();

                if (response.toLowerCase().includes("success")) {
                    pass("Six-character password accepted.");
                } else {
                    fail("Six-character password rejected: " + response);
                }
            }
        }

        await checkPassword("abc", false);
        await checkPassword("abcde", false);
        await checkPassword("abcdef", true);

        // TEST 6: Password confirmation mismatch
        console.log("\nTEST 6: Password Confirmation Validation");

        await openProviderModal();

        await fillProviderForm({
            email: `provider.mismatch.${Date.now()}@example.com`,
            password: "Test@123456",
            confirmPassword: "Different@123"
        });

        await submitProviderForm();

        const mismatchResponse = await getProviderResponse();

        if (
            mismatchResponse.toLowerCase().includes("match") ||
            mismatchResponse.toLowerCase().includes("different")
        ) {
            pass("Password confirmation mismatch rejected.");
        } else {
            fail("Password mismatch was not correctly rejected: " + mismatchResponse);
        }

        // TEST 7: Browser console errors
        console.log("\nTEST 7: Browser Console Check");

        const browserLogs = await driver.manage().logs().get("browser");

        const unexpectedErrors = browserLogs.filter(log => {
            const message = log.message.toLowerCase();

            if (
                message.includes("/api/provider/register") &&
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
        console.log(" PROVIDER REGISTRATION SUMMARY");
        console.log("==================================");
        console.log(`Passed : ${passed}`);
        console.log(`Failed : ${failed}`);
        console.log(`Total  : ${passed + failed}`);
        console.log("==================================\n");

        if (failed > 0) {
            console.log("PROVIDER REGISTRATION TESTS FAILED!");
            process.exitCode = 1;
        } else {
            console.log("ALL PROVIDER REGISTRATION TESTS PASSED!");
        }
    }
}

testProviderRegistration();
