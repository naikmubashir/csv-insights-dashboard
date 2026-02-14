import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("renders the hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("CSV Insights Dashboard");
    await expect(page.getByText("AI-Powered Data Analysis")).toBeVisible();
  });

  test("has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /upload csv/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /view history/i })).toBeVisible();
  });

  test("navigates to upload page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /upload csv/i }).first().click();
    await expect(page).toHaveURL("/upload");
  });

  test("shows feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Upload CSV", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("AI Insights")).toBeVisible();
    await expect(page.getByText("Save Reports")).toBeVisible();
  });

  test("shows how it works section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How It Works")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navbar is present on all pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("CSV Insights").first()).toBeVisible();

    await page.goto("/upload");
    await expect(page.getByText("CSV Insights").first()).toBeVisible();

    await page.goto("/history");
    await expect(page.getByText("CSV Insights").first()).toBeVisible();

    await page.goto("/status");
    await expect(page.getByText("CSV Insights").first()).toBeVisible();
  });

  test("nav links work correctly", async ({ page }) => {
    await page.goto("/");

    // Navigate to Upload
    await page.getByRole("link", { name: /upload/i }).first().click();
    await expect(page).toHaveURL("/upload");

    // Navigate to History
    await page.getByRole("link", { name: /history/i }).first().click();
    await expect(page).toHaveURL("/history");

    // Navigate to Status
    await page.getByRole("link", { name: /status/i }).first().click();
    await expect(page).toHaveURL("/status");

    // Navigate Home
    await page.getByRole("link", { name: /home/i }).first().click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Upload Page", () => {
  test("shows upload area", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("Upload & Analyze")).toBeVisible();
    await expect(page.getByText("Drop your CSV file here")).toBeVisible();
  });

  test("shows file type restriction", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("Supports .csv files")).toBeVisible();
  });

  test("upload area accepts CSV files", async ({ page }) => {
    await page.goto("/upload");

    // Create a test CSV file
    const csvContent = "name,age,city\nJohn,30,NYC\nJane,25,LA\nBob,35,Chicago";
    const buffer = Buffer.from(csvContent);

    // Upload via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer,
    });

    // Should show data preview
    await expect(page.getByText("test.csv")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("3 rows")).toBeVisible();
  });
});

test.describe("History Page", () => {
  test("shows history page heading", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByText("Report History")).toBeVisible();
  });

  test("shows empty state or reports", async ({ page }) => {
    await page.goto("/history");
    // Either shows "No reports yet" or a list of reports
    const noReports = page.getByText("No reports yet");
    const newAnalysis = page.getByRole("link", { name: /new analysis/i });
    
    // One of these should be visible
    await expect(
      noReports.or(newAnalysis)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Status Page", () => {
  test("shows status page heading", async ({ page }) => {
    await page.goto("/status");
    await expect(page.getByText("System Status")).toBeVisible();
  });

  test("shows health check results", async ({ page }) => {
    await page.goto("/status");
    // Should show the three service checks (may take a moment to load)
    await expect(page.getByText("Backend Server")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Database/)).toBeVisible();
    await expect(page.getByText(/LLM|Gemini/)).toBeVisible();
  });

  test("shows connection status indicators", async ({ page }) => {
    await page.goto("/status");
    // Should show either Connected or Error for each service
    await page.waitForTimeout(3000);
    const statuses = page.getByText(/Connected|Error/);
    expect(await statuses.count()).toBeGreaterThanOrEqual(1);
  });
});
