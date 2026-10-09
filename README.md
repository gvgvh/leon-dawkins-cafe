# Leon Dawkins Cafe: Production-Ready QR Menu & M-Pesa Ordering System

A full-stack Node.js/Express application featuring a QR-accessed restaurant menu, Safaricom Daraja M-Pesa STK Push payments, real-time kitchen display system (KDS), SQLite database persistence, JWT authentication, admin financial dashboard, and printable table QR codes.

## Features - Version 2.0

### Core Features
- Customer menu accessible via QR codes with `?table=N` table assignment
- Responsive grid layout for all screen sizes
- Real-time cart and checkout with M-Pesa integration
- Safaricom Daraja STK Push payment requests (backend-only credentials)
- M-Pesa callback webhook handler for payment confirmation
- Real-time order notifications via Socket.io

### Kitchen Display System (KDS)
- Live paid order tickets with table/food/quantity/notes
- Order status controls: Preparing → Ready → Complete
- Audio notification chime on new orders
- Real-time order updates via WebSocket

### Admin Dashboard
- Real-time financial dashboard with today's revenue metrics
- Order history with payment status tracking
- Live M-Pesa payment confirmations
- Printable QR code placards for tables 1-10

### Security & Database (v2.0)
- **SQLite3 database** for persistent order storage
- **JWT authentication** for admin and kitchen staff
- **Role-based access control** (admin, kitchen)
- **Environment variable validation** for production safety
- **Audit logging** for staff actions
- **CORS configuration** with origin whitelisting
- **Password hashing** ready (bcryptjs dependency included)

## Installation

### Prerequisites
- Node.js 18+
- npm
- Safaricom Daraja sandbox account (optional for demo)

### Setup

1. **Clone and install**
```bash
git clone https://github.com/gvgvh/leon-dawkins-cafe.git
cd leon-dawkins-cafe
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Daraja credentials and staff passwords
```

3. **Start the server**
```bash
npm start
```

4. **Access the application**
- **Customer Menu**: http://localhost:3000/?table=1
- **Staff Login**: http://localhost:3000/auth.html
- **Kitchen Display**: http://localhost:3000/kitchen.html (requires login)
- **Admin Dashboard**: http://localhost:3000/admin.html (requires login)
- **QR Codes**: http://localhost:3000/qr-codes.html

## Environment Configuration

Key variables in `.env`:

```env
# Daraja M-Pesa Configuration
DARAJA_CONSUMER_KEY=your_key
DARAJA_CONSUMER_SECRET=your_secret
DARJA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

# Database
DB_PATH=./data/cafe.db

# Authentication
JWT_SECRET=super-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong-password-here
KITCHEN_USERNAME=kitchen
KITCHEN_PASSWORD=strong-password-here

# Environment
NODE_ENV=production
AUTO_SIMULATE_PAYMENT=false
```

## API Endpoints

### Public
- `POST /api/auth/login` - Staff login (returns JWT token)
- `POST /api/orders/stkpush` - Create M-Pesa payment request
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order status
- `POST /api/mpesa/callback` - M-Pesa webhook callback

### Protected (Requires JWT Token)
- `PATCH /api/orders/:id/status` - Update order status (kitchen/admin)
- `GET /api/admin/stats` - Admin dashboard stats (admin only)

## Database Schema

### orders table
- `orderId` (TEXT, PRIMARY KEY)
- `checkoutRequestId` (TEXT)
- `tableNumber` (TEXT)
- `customerName` (TEXT)
- `phoneNumber` (TEXT)
- `items` (TEXT/JSON)
- `totalAmount` (REAL)
- `status` (TEXT)
- `paymentStatus` (TEXT)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)
- `paidAt` (DATETIME)

### audit_log table
- Tracks all staff actions on orders
- Username, action, timestamp logged

## Security Best Practices (Production)

✅ **Implemented in v2.0:**
- JWT authentication for staff routes
- Environment variable validation
- Database persistence (no data loss on restart)
- Audit logging of staff actions
- CORS configuration
- Password secrets stored server-side only

⚠️ **Still Needed:**
- HTTPS/TLS in production
- Password hashing with bcryptjs (code ready, needs activation)
- Database backups and disaster recovery
- Rate limiting on API endpoints
- Input validation and sanitization
- CSRF protection if adding forms
- Admin authentication for sensitive operations

## M-Pesa Configuration

### Sandbox (Development)
1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create an app and note credentials
3. Add to `.env`:
   - `DARAJA_CONSUMER_KEY`
   - `DARAJA_CONSUMER_SECRET`
   - `DARAJA_SHORTCODE` (default: 174379)
   - `DARAJA_PASSKEY` (provided by Safaricom)

### Production
1. Request production credentials from Safaricom
2. Update API endpoint from sandbox to production
3. Configure publicly accessible callback URL (HTTPS required)
4. Store credentials securely in `.env` (never commit)

## Demo Mode

Without Daraja credentials or with `AUTO_SIMULATE_PAYMENT=true`, the system automatically confirms payments after 3.5 seconds for testing:

```bash
AUTO_SIMULATE_PAYMENT=true npm start
```

**Note:** This is development-only and simulates real payments. Disable in production.

## Deployment

### Heroku
```bash
git push heroku main
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production Checklist)
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `ADMIN_PASSWORD` and `KITCHEN_PASSWORD`
- [ ] Set `NODE_ENV=production`
- [ ] Set `AUTO_SIMULATE_PAYMENT=false`
- [ ] Configure real Daraja credentials
- [ ] Use HTTPS with valid SSL certificate
- [ ] Enable database backups
- [ ] Configure monitoring and error tracking

## File Structure

```
leon-dawkins-cafe/
├── server.js                 # Main Express server
├── package.json              # Dependencies
├── .env.example              # Environment template
├── lib/
│   ├── database.js          # SQLite3 wrapper
│   └── utils.js             # Logger & validation
├── public/
│   ├── index.html           # Customer menu
│   ├── kitchen.html         # KDS display
│   ├── admin.html           # Admin dashboard
│   ├── qr-codes.html        # QR placards
│   ├── auth.html            # Staff login
│   ├── script.js            # Customer JS
│   ├── auth-utils.js        # Auth helpers
│   └── style.css            # Shared styles
└── data/
    └── cafe.db              # SQLite database (auto-created)
```

## Support & Troubleshooting

### Database Issues
- Check `DB_PATH` is writable
- Ensure `/data` directory exists
- Clear `cafe.db` to reset and recreate tables

### M-Pesa Not Working
- Verify Daraja credentials in `.env`
- Check callback URL is publicly accessible (HTTPS)
- Enable `AUTO_SIMULATE_PAYMENT=true` for demo

### Authentication Errors
- Clear browser localStorage: `localStorage.clear()`
- Verify credentials match `.env` values
- Check JWT_SECRET is set and consistent

## License
ISC

## Author
Leon Dawkins Cafe
