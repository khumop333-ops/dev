import { test, expect } from "@playwright/test";

test.describe("Highveld Herbal Co. — End-to-End Smoke Tests", () => {
  test("Public flow: Age gate -> Browse shop -> Product -> Cart -> Reservation Checkout", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Age gate appears and can be accepted
    const confirmAgeBtn = page.getByTestId("age-gate-confirm");
    await expect(confirmAgeBtn).toBeVisible();
    await confirmAgeBtn.click();
    await expect(confirmAgeBtn).toBeHidden();

    // 2. Navigate to shop and open a seeded product
    await page.getByTestId("hero-browse-cta").click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByText("Highveld Apricot Reserve")).toBeVisible();

    await page.getByRole("link", { name: "Highveld Apricot Reserve" }).first().click();
    await expect(page).toHaveURL(/\/products\/highveld-apricot-reserve/);

    // 3. Add to reservation cart
    await page.getByTestId("add-to-reservation-btn").click();
    await expect(page.getByTestId("added-to-cart-feedback")).toBeVisible();

    // 4. Open cart and change quantity
    await page.getByTestId("header-cart-link").click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId("cart-subtotal")).toContainText("R");

    // 5. Proceed to checkout and submit reservation
    await page.getByTestId("proceed-to-checkout-btn").click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.fill("#checkout-first-name", "Lerato");
    await page.fill("#checkout-last-name", "Mahlangu");
    await page.fill("#checkout-phone", "+27 82 555 1234");
    await page.fill("#checkout-email", "lerato.mahlangu@example.co.za");

    await page.getByTestId("checkout-age-checkbox").check();
    await page.getByTestId("checkout-terms-checkbox").check();
    await page.getByTestId("checkout-privacy-checkbox").check();

    await page.getByTestId("submit-reservation-btn").click();

    // Redirects to /order/HHC-XXXXXX
    await expect(page).toHaveURL(/\/order\/HHC-/);
    await expect(page.getByTestId("order-reference-code")).toContainText("HHC-");
    await expect(page.getByTestId("order-whatsapp-link")).toBeVisible();
  });

  test("Admin flow: Sign in -> Edit product -> View and update order", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.fill("#admin-email", "admin@highveldherbal.co.za");
    await page.fill("#admin-password", "ChangeMePretoria2026!");
    await page.getByTestId("admin-login-submit").click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("Dispensary Dashboard")).toBeVisible();

    // Edit a product
    await page.goto("/admin/products");
    await page.getByTestId("edit-product-highveld-apricot-reserve").click();
    await expect(page).toHaveURL(/\/admin\/products\//);
    await page.getByTestId("save-product-btn").click();
    await expect(page.getByTestId("product-saved-banner")).toBeVisible();

    // View and update an order
    await page.goto("/admin/orders");
    await page.getByTestId("manage-order-HHC-842K9P").click();
    await page.selectOption("#admin-order-status", "CONFIRMED");
    await page.getByTestId("save-order-status-btn").click();
    await expect(page.getByTestId("order-update-feedback")).toBeVisible();
  });
});
