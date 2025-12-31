1. **Update** **`orderService.js`**:

   * Modify `createOrder` to iterate through `items` and fetch the corresponding `variant` (including price) from the database *before* processing.

   * Replace `item.unit_price` with `variant.price` (or `sale_price` if applicable) for all calculations.

   * Ensure the initial loop validates that every variant exists; throw an error if an ID is invalid.

2. **Update** **`inventoryService.js`**:

   * Review `reserveStock` to ensure it handles the `quantity_change` logic correctly (it currently seems to rely on an insert, which is generally safe, but we will verify the "available stock" calculation logic).

3. **Verify**:

   * Restart the backend server.

   * Create a test order (simulated) to ensure the logic flows correctly and prices are respected.

