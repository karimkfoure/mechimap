const {
  waitForUiSettled,
  assertNoRuntimeErrors,
  mockDefaultKml,
  expect,
  test
} = require("./helpers/e2e");

test.beforeEach(async ({ page }) => {
  await mockDefaultKml(page);
});

test("@quick smoke flujo base", async ({ page, diagnostics }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toHaveText("Bike & Coffee");
  await expect(page.locator("#status")).toContainText(/Cargando|Cargados/);
  await waitForUiSettled(page, { timeout: 30_000 });

  await page.locator("#mapBrightness").evaluate((element) => {
    element.value = "115";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const mapFilter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--map-filter")
  );
  expect(mapFilter).toContain("brightness(115%)");

  await page.click("#togglePanelBtn");
  await expect(page.locator("#appShell")).toHaveClass(/panel-hidden/);

  await waitForUiSettled(page);

  assertNoRuntimeErrors(diagnostics);
});
