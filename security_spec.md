# Security Specification & Threat Model: Khan Enterprise Agro E-Commerce

## 1. Data Invariants
1. **Global Default Deny**: Any unmatched paths are completely locked against read and write.
2. **Product Catalog Protection**: Anyone can view products, but modifications (add, edit, remove) require administrative credentials.
3. **Order Integrity**: Anyone (farmers placing orders) can submit a valid order adhering strictly to the `Order` blueprint, but cannot inject arbitrary fields, oversize strings, negative amounts, or forge non-pending statuses without admin authorization.
4. **Advice Request Integrity**: Farmers can submit consultation questions adhering to `AdviceRequest` blueprint with valid phone numbers and descriptions, but cannot tamper with existing requests or overwrite statuses without admin privileges.
5. **Settings Protection**: Settings can be read by public visitors for hotline, whatsapp, and notices, but can only be updated with administrative credentials.
6. **ID Hardening**: All document path keys must conform to `^[a-zA-Z0-9_\-]+$` and not exceed 128 characters.

---

## 2. The "Dirty Dozen" Payloads (Must be Denied)

1. **Junk/Overflow ID Attack**: Order creation with 10KB junk-character document ID.
2. **Ghost Field Injection**: Order creation with unauthorized shadow field `isAdminDiscount: true`.
3. **Negative Grand Total**: Order with `grandTotal: -5000` attempting negative charge exploits.
4. **Forged Completed Status**: Guest order creation with `status: "delivered"` skipping the order lifecycle.
5. **Huge Payload Denial of Wallet**: Product creation or update with 5MB description string.
6. **Client Setting Hijack**: Unauthorized client writing arbitrary URLs to `googleSheetWebhookUrl` in `/settings/general`.
7. **Malicious Script in Phone**: Submitting `<script>alert(1)</script>` in customer phone field exceeding length bounds.
8. **Direct Product Deletion**: Unauthenticated user issuing delete request on `/products/score-250ec`.
9. **Direct Order Wiping**: Unauthenticated attacker issuing batch delete on all orders.
10. **Order Tampering**: Unauthenticated client updating customer name or address on an existing order.
11. **Advice Request Status Tampering**: Unauthenticated client changing advice status from `pending` to `resolved`.
12. **Root Document Escalation**: Writing to unspecified collections like `/users` or `/roles`.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)
Each dirty payload submitted above is verified to be rejected with `PERMISSION_DENIED`.
