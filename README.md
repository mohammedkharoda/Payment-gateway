# Payment Form - Assignment

A client-side payment form built with Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, and Zustand.

## What This Includes

- Responsive payment form with card formatting and field-level validation
- Live card preview that flips when the CVV field is focused
- Simulated payment processing with success, failure, timeout, retry, and cancel flows
- Toast feedback plus a dedicated status screen for terminal states
- Persisted transaction history with hydration skeletons and row animations
- Transaction detail view for previously submitted payments

## Setup

### Requirements

- Node.js 20.9+ recommended for Next.js 16
- npm 9+

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Production build check

```bash
npm run build
```

## Test Card Numbers

Use any future expiry month and year.

Use CVV `123` for Visa, Mastercard, and Discover.

Use CVV `1234` for Amex.

Supported test numbers that pass the current validator:

- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`
- Discover: `6011 1111 1111 1117`

Notes:

- The mock API still returns randomized outcomes, so a valid card can succeed, fail, or timeout.
- Amount must be greater than `0` and less than or equal to `1,000,000`.
- Cardholder name must contain letters only, with spaces, apostrophes, or hyphens allowed.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand 5 with `persist` middleware |
| Icons | Lucide React |

## Assumptions

### Payment processing is mocked

`/api/pay` is a simulated Route Handler, not a real payment gateway. It validates the payload and returns typed JSON responses that represent success, failure, validation errors, or timeouts.

### Client timeout is intentional

The client aborts a payment request after 6 seconds using `AbortController`. This is separate from whatever delay the mock server may take and is used to exercise timeout handling in the UI.

### Retries belong to one logical transaction

A transaction ID is created on the first submit and reused across retries. That lets retry attempts update the same history item instead of creating duplicates.

### Retry limit is capped

The flow allows up to 3 retry attempts before switching to a final "start over" state. This is enforced in the payment hook and reflected in the status UI.

### Only history is persisted

Only `transactionHistory` is saved to `localStorage`. Form values, CVV, current processing state, and in-flight request state are treated as transient and are not persisted.

### Card and CVV rules are card-type-aware

Card number formatting and validation are based on detected card type. Amex is treated differently from the other supported card types for number length and CVV length.

### Currency selection is display-only

The currency selector changes labels and formatting context only. There is no currency conversion or exchange-rate logic.

## Notes On Current UX

- Submitting works with the button and with `Enter`
- The live card preview remains visible without an extra wrapper panel
- History shows a skeleton on first hydration to reduce layout shift
- History rows animate on insert and retry-driven updates
- Toasts are shown for success, failure, and timeout so feedback is still visible on mobile when the preview area is off-screen

## Improvements Given More Time

### Testing

- Add unit tests for validators and card utility helpers
- Add integration tests for the `/api/pay` route outcome branches
- Add UI tests for retry, cancel, timeout, toast behavior, and history updates

### Accessibility

- Run a full axe/Lighthouse audit
- Refine screen reader announcements across status screen and toast regions to avoid duplicate or out-of-order messaging
- Add more explicit keyboard flow testing for the form, detail view, and history interactions

### Real backend integration

- Replace the mock API with a real payment provider integration such as Stripe
- Move transaction storage to a server-side datastore instead of browser-only persistence
- Add webhook-based confirmation for async payment states

### Security and privacy

- Reduce or remove personally identifiable data stored in local history
- Add rate limiting and request abuse protection around `/api/pay`
- Add server-side audit logging with redacted metadata only

### Product polish

- Add filtering or pagination for longer transaction histories
- Improve mobile spacing and density further with device-specific UX tuning
- Add empty, retry, and success analytics events for observability
