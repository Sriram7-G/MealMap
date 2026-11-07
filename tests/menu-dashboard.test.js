
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function testMenuDashboard() {
    let driver;

    try {
        const options = new chrome.Options();
        options.addArguments("--incognito");
        options.addArguments("--start-maximized");

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();

        await driver.get("http://localhost:8085/provider-dashboard.html");

        await driver.sleep(5000);

        console.log("Current URL:", await driver.getCurrentUrl());
        console.log("Page title:", await driver.getTitle());

        const elements = [
            "menuForm",
            "providerMenuList",
            "menuName",
            "menuSubmitButton",
            "menusMessage"
        ];

        for (const id of elements) {
            const found = await driver.findElements(By.id(id));

            if (found.length > 0) {
                console.log(
                    `${id}: Found | Visible: ${await found[0].isDisplayed()}`
                );
            } else {
                console.log(`${id}: NOT FOUND`);
            }
        }

        console.log("\nDashboard diagnostic completed.");

    } catch (error) {
        console.error("FAIL:", error.message);
        process.exitCode = 1;

    } finally {
        if (driver) await driver.quit();
    }
}

testMenuDashboard();
