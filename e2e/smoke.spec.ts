import { expect, test } from "@playwright/test";

test("boots to burns tab and tabs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /PERMA/ })).toBeVisible();
  // boot log resolves into the tab bar
  await expect(page.getByRole("button", { name: "[F2] METHODOLOGY" })).toBeVisible({
    timeout: 10_000,
  });
  // burns tab is honest about having no RPC — no numbers without evidence
  await expect(page.getByText(/no RPC endpoint configured/)).toBeVisible();
  await page.getByRole("button", { name: "[F2] METHODOLOGY" }).click();
  await expect(page.getByText(/LAYER 1 — MINT TRUTH/)).toBeVisible();
  await page.getByRole("button", { name: "[F3] CONFIG" }).click();
  await expect(page.getByPlaceholder(/your-rpc-provider/)).toBeVisible();
});
