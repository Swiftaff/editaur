import { devices } from "@playwright/test";

const config = {
    testDir: "./tests",
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    //retries: process.env.CI ? 2 : 0,
    //workers: process.env.CI ? 1 : undefined,
    //reporter: "html",
    use: {
        actionTimeout: 0,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
            },
        },
    ],
    webServer: {
        command: "npm run dev",
        port: 1420,
    },
};

export default config;
