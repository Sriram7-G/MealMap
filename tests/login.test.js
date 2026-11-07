
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const customerEmail = "mealmap.test.1794031282306@example.com";
const customerPassword = "Test@123456";

const providerEmail = "provider.test.1794031468614@example.com";
const providerPassword = "Test@123456";

let passed = 0;
let failed = 0;

async function createDriver() {
    const options = new chrome.Options();
    options.addArguments("--incognito");
    options.addArguments("--start-maximized");

    return await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
}

async function runTest(name, testFunction) {
    let driver;

    try {
        console.log(`\n${name}`);
        driver = await createDriver();

        await testFunction(driver);

        console.log("PASS");
        passed++;
    } catch (error) {
        console.log("FAIL:", error.message);
        failed++;
    } finally {
        if (driver) await driver.quit();
    }
}

async function openLogin(driver) {
    await driver.get("http://localhost:8085");

    const loginButton = await driver.wait(
        until.elementLocated(By.xpath(
            "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login')]"
        )),
        10000
    );

    await loginButton.click();

    await driver.wait(
        until.elementIsVisible(
            await driver.findElement(By.id("loginModal"))
        ),
        5000
    );
}

async function login(driver, email, password) {
    const emailField = await driver.findElement(
        By.css("#loginModal input[type='email']")
    );

    const passwordField = await driver.findElement(
        By.css("#loginModal input[type='password']")
    );

    await emailField.sendKeys(email);
    await passwordField.sendKeys(password);

    const submitButton = await driver.findElement(
        By.css("#loginModal button[type='submit']")
    );

    await submitButton.click();
}

async function checkLogin(driver, email, password, expectedRole) {
    await openLogin(driver);
    await login(driver, email, password);

    await driver.wait(async () => {
        return await driver.executeScript(
            "return !!localStorage.getItem('token')"
        );
    }, 10000, "Login failed: JWT token was not created.");

    const user = await driver.executeScript(
        "return JSON.parse(localStorage.getItem('user'))"
    );

    if (!user) {
        throw new Error("User details not stored in localStorage.");
    }

    if (user.role !== expectedRole) {
        throw new Error(
            `Expected role ${expectedRole}, received ${user.role}`
        );
    }

    console.log(`Logged in as: ${email}`);
    console.log(`Role: ${user.role}`);
}

async function main() {
    console.log("\n================================");
    console.log("      MEALMAP LOGIN TESTS");
    console.log("================================");

    await runTest("TEST 1: Customer Login", async (driver) => {
        await checkLogin(
            driver,
            customerEmail,
            customerPassword,
            "user"
        );
    });

    await runTest("TEST 2: Provider Login", async (driver) => {
        await checkLogin(
            driver,
            providerEmail,
            providerPassword,
            "provider"
        );
    });

    await runTest("TEST 3: Incorrect Password", async (driver) => {
        await openLogin(driver);
        await login(driver, customerEmail, "WrongPassword123");

        await driver.sleep(2000);

        const token = await driver.executeScript(
            "return localStorage.getItem('token')"
        );

        if (token) throw new Error("Incorrect password was accepted.");

        console.log("Incorrect password rejected.");
    });

    await runTest("TEST 4: Unregistered Email", async (driver) => {
        await openLogin(driver);
        await login(
            driver,
            "unknown.mealmap@example.com",
            "Test@123456"
        );

        await driver.sleep(2000);

        const token = await driver.executeScript(
            "return localStorage.getItem('token')"
        );

        if (token) throw new Error("Unregistered email was accepted.");

        console.log("Unregistered email rejected.");
    });

    await runTest("TEST 5: Empty Field Validation", async (driver) => {
        await openLogin(driver);

        const emailField = await driver.findElement(
            By.css("#loginModal input[type='email']")
        );

        const passwordField = await driver.findElement(
            By.css("#loginModal input[type='password']")
        );

        const emailValid = await emailField.getAttribute("required");
        const passwordValid = await passwordField.getAttribute("required");

        if (emailValid === null || passwordValid === null) {
            throw new Error("Required validation is missing.");
        }

        console.log("Both login fields have required validation.");
    });

    console.log("\n================================");
    console.log("       LOGIN TEST SUMMARY");
    console.log("================================");
    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log(`Total  : ${passed + failed}`);
    console.log("================================");

    if (failed > 0) {
        console.log("LOGIN TESTS FAILED!");
        process.exitCode = 1;
    } else {
        console.log("ALL LOGIN TESTS PASSED!");
    }
}

main();
