# Leon Dawkins Cafe: QR Menu, M-Pesa & Live Order Management

A full-stack Node.js/Express and Socket.io application with a QR-accessed restaurant menu, M-Pesa STK Push payments, live kitchen tickets, an admin financial dashboard, and printable table QR codes.

## Features

- Customer menu with `?table=N` table assignment, responsive grid, cart and checkout.
- M-Pesa phone field and validation (`07...` or `2547...`).
- Safaricom Daraja STK Push request through the backend. Daraja secrets stay server-side.
- M-Pesa callback updates payment state and broadcasts successfully paid orders.
- Kitchen display with real-time paid tickets, table/food/quantity/notes, Preparing and Ready controls, plus sound on new orders.
- Admin dashboard with all order/payment records, today's paid revenue, order counts and statuses.
- Printable QR placards for tables 1–10.
- Local demo mode automatically simulates payment when Daraja credentials aren't configured.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in Daraja sandbox credentials if available.
4. Run `npm start`.
5. Open `http://localhost:3000/?table=1`.

Staff pages: `/kitchen.html`, `/admin.html`, `/qr-codes.html`.

## M-Pesa configuration

Set `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_SHORTCODE`, `DARAJA_PASSKEY`, and `DARAJA_CALLBACK_URL` as environment variables. The callback must be a publicly reachable HTTPS URL; localhost cannot receive Safaricom webhooks. For local development, use a tunnel or test the explicit simulation endpoint.

The included integration targets the Daraja sandbox endpoint. For production, change the Safaricom API base URL to the production Daraja host after obtaining production credentials and completing Safaricom configuration.

## Demo mode

With no Daraja credentials, the app simulates a payment confirmation after a short delay so you can test the customer, kitchen and admin flows end-to-end. This is strictly for development; it is not a real payment. Set `AUTO_SIMULATE_PAYMENT=false` in production and configure Daraja credentials.

## Persistence and security notes

This sample stores orders in memory. They are lost whenever the server restarts, so the admin dashboard is not a durable financial ledger. Before real restaurant use, connect a persistent database, add staff authentication and authorization for `/admin.html`, `/kitchen.html`, and status-update routes, use HTTPS, validate catalog prices and totals on the server, add webhook signature/verification measures and idempotency, and configure backups/monitoring. Never put Daraja credentials in client-side code or commit `.env`.
