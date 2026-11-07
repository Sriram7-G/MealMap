
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const testDirectory = __dirname;

const testFiles = fs.readdirSync(testDirectory)
    .filter(file => file.endsWith(".test.js"))
    .sort();

let passed = 0;
let failed = 0;

const testResults = [];

console.log("\n==================================");
console.log("       MEALMAP TEST SUITE");
console.log("==================================\n");

for (const file of testFiles) {
    console.log(`\nRunning: ${file}`);
    console.log("----------------------------------");

    const startTime = Date.now();

    const result = spawnSync(
        process.execPath,
        [path.join(testDirectory, file)],
        { stdio: "inherit" }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(3);

    const success = result.status === 0 && !result.error;

    if (success) {
        console.log(`PASS: ${file}`);
        passed++;
    } else {
        console.log(`FAIL: ${file}`);
        failed++;
    }

    testResults.push({
        name: file,
        duration,
        success,
        error: result.error
            ? result.error.message
            : `Process exited with status ${result.status}`
    });
}

// Generate JUnit XML report
function escapeXML(value) {
    return String(value).replace(/[<>&'"]/g, char => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;"
    })[char]);
}

const testCases = testResults.map(test => {
    let testcase = `  <testcase classname="MealMap" name="${escapeXML(test.name)}" time="${test.duration}">`;

    if (!test.success) {
        testcase += `\n    <failure message="${escapeXML(test.error)}"/>`;
    }

    testcase += "\n  </testcase>";
    return testcase;
}).join("\n");

const totalTime = testResults.reduce(
    (sum, test) => sum + Number(test.duration), 0
).toFixed(3);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="MealMap Selenium Tests"
           tests="${testFiles.length}"
           failures="${failed}"
           errors="0"
           skipped="0"
           time="${totalTime}">
${testCases}
</testsuite>`;

const reportPath = path.join(testDirectory, "test-results.xml");

fs.writeFileSync(reportPath, xml, "utf8");

console.log("\n==================================");
console.log("       FINAL TEST SUMMARY");
console.log("==================================");
console.log(`Total Tests : ${testFiles.length}`);
console.log(`Passed      : ${passed}`);
console.log(`Failed      : ${failed}`);
console.log(`JUnit Report: ${reportPath}`);
console.log("==================================\n");

if (failed > 0) {
    console.log("TEST SUITE FAILED!");
    process.exitCode = 1;
} else {
    console.log("ALL TESTS PASSED!");
    process.exitCode = 0;
}
