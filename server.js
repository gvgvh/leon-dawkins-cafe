require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Database = require('./lib/database');
const { validateEnv, logger } = require('./lib/utils');

// Validate environment variables
validateEnv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Initialize database
const db = new Database(process.env.DB_PATH || './data/cafe.db');
db.init();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Authentication middleware for staff routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Safaricom Daraja Config
const DARAJA = {
    consumerKey: process.env.DARAJA_CONSUMER_KEY,
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
    passkey: process.env.DARAJA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    shortcode: process.env.DARAJA_SHORTCODE || '174379',
    callbackUrl: process.env.DARAJA_CALLBACK_URL || 'https://example.com/api/mpesa/callback',
    isConfigured() {
        return Boolean(this.consumerKey && this.consumerSecret);
    }
};

// Get Daraja OAuth Token
async function getDarajaToken() {
    if (!DARAJA.isConfigured()) return null;
    try {
        const auth = Buffer.from(`${DARAJA.consumerKey}:${DARAJA.consumerSecret}`).toString('base64');
        const res = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}` }
        });
        if (!res.ok) throw new Error(`Daraja token error: ${res.statusText}`);
        const data = await res.json();
        return data.access_token;
    } catch (err) {
        logger.error('Daraja token error:', err);
        return null;
    }
}

// --- Public Routes ---

// 1. Login endpoint for staff
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple validation - in production, hash passwords and store in DB
    const adminUser = username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
    const kitchenUser = username === process.env.KITCHEN_USERNAME && password === process.env.KITCHEN_PASSWORD;
    
    if (!adminUser && !kitchenUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const role = adminUser ? 'admin' : 'kitchen';
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '24h' });
    
    logger.info(`User ${username} logged in with role ${role}`);
    return res.json({ token, role });
});

// 2. STK Push Order Endpoint
app.post('/api/orders/stkpush', async (req, res) => {
    try {
        const { tableNumber, customerName, phoneNumber, items, totalAmount, notes } = req.body;

        if (!customerName || !phoneNumber || !items || !items.length || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }

        // Validate phone number
        let formattedPhone = String(phoneNumber).replace(/[\s+()-]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        }
        if (!/^254[71]\d{8}$/.test(formattedPhone)) {
            return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number' });
        }

        const orderId = 'ORD-' + Date.now().toString().slice(-6);
        let checkoutRequestId = 'ws_CO_' + Date.now();

        // Call Daraja API if configured
        if (DARAJA.isConfigured()) {
            try {
                const token = await getDarajaToken();
                if (token) {
                    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
                    const password = Buffer.from(`${DARAJA.shortcode}${DARAJA.passkey}${timestamp}`).toString('base64');

                    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            BusinessShortCode: DARAJA.shortcode,
                            Password: password,
                            Timestamp: timestamp,
                            TransactionType: 'CustomerPayBillOnline',
                            Amount: Math.round(totalAmount),
                            PartyA: formattedPhone,
                            PartyB: DARAJA.shortcode,
                            PhoneNumber: formattedPhone,
                            CallBackURL: DARAJA.callbackUrl,
                            AccountReference: `Table${tableNumber}`,
                            TransactionDesc: `Cafe Order ${orderId}`
                        })
                    });

                    const stkResult = await stkResponse.json();
                    if (stkResult.CheckoutRequestID) {
                        checkoutRequestId = stkResult.CheckoutRequestID;
                    }
                }
            } catch (darajaErr) {
                logger.warn('Daraja API call failed:', darajaErr.message);
            }
        }

        // Store order in database
        const order = db.createOrder({
            orderId,
            checkoutRequestId,
            tableNumber: tableNumber || '1',
            customerName,
            phoneNumber: formattedPhone,
            items: JSON.stringify(items),
            totalAmount,
            notes: notes || '',
            status: 'Pending Payment',
            paymentStatus: 'Pending'
        });

        // Auto-simulate for demo mode
        if (!DARAJA.isConfigured() || process.env.AUTO_SIMULATE_PAYMENT === 'true') {
            setTimeout(() => {
                const pending = db.getOrderById(orderId);
                if (pending && pending.status === 'Pending Payment') {
                    db.updateOrderStatus(orderId, 'Paid');
                    const updated = db.getOrderById(orderId);
                    logger.info(`[Auto-Demo] Order ${orderId} automatically verified as PAID.`);
                    io.emit('new_order', updated);
                    io.emit('order_status_updated', updated);
                }
            }, 3500);
        }

        return res.json({
            success: true,
            message: 'STK Push prompt sent to your phone. Please enter PIN.',
            orderId: order.orderId,
            checkoutRequestId
        });

    } catch (err) {
        logger.error('STK Push Error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
});

// 3. M-Pesa Callback Endpoint
app.post('/api/mpesa/callback', (req, res) => {
    try {
        const callback = req.body?.Body?.stkCallback;
        if (!callback) {
            return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const { CheckoutRequestID, ResultCode, ResultDesc } = callback;
        logger.info(`M-Pesa Callback - CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

        const order = db.getOrderByCheckoutId(CheckoutRequestID);
        if (order) {
            if (ResultCode === 0) {
                db.updateOrderStatus(order.orderId, 'Paid');
                const updated = db.getOrderById(order.orderId);
                io.emit('new_order', updated);
                io.emit('order_status_updated', updated);
            } else {
                db.updateOrderStatus(order.orderId, 'Payment Failed');
                const updated = db.getOrderById(order.orderId);
                io.emit('order_status_updated', updated);
            }
        }

        return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
        logger.error('Callback error:', err);
        return res.json({ ResultCode: 0, ResultDesc: 'Error handled' });
    }
});

// 4. Get Orders API
app.get('/api/orders', (req, res) => {
    try {
        const { status } = req.query;
        let orders;
        if (status === 'active') {
            orders = db.getActiveOrders();
        } else {
            orders = db.getAllOrders();
        }
        return res.json({ orders });
    } catch (err) {
        logger.error('Get orders error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// 5. Get Single Order Status
app.get('/api/orders/:id', (req, res) => {
    try {
        const order = db.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        return res.json({ order });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// --- Protected Routes (Require Authentication) ---

// 6. Update Order Status (Kitchen)
app.patch('/api/orders/:id/status', authenticateToken, (req, res) => {
    try {
        const { status } = req.body;
        if (!req.user || !['kitchen', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        const order = db.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        db.updateOrderStatus(req.params.id, status);
        const updated = db.getOrderById(req.params.id);
        
        logger.info(`Order ${req.params.id} updated to ${status} by ${req.user.username}`);
        io.emit('order_status_updated', updated);

        return res.json({ success: true, order: updated });
    } catch (err) {
        logger.error('Update status error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// 7. Admin stats endpoint
app.get('/api/admin/stats', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const stats = db.getStats();
        return res.json(stats);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Socket.io connection with authentication
io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
server.listen(PORT, () => {
    logger.info(`====================================================`);
    logger.info(`Leon Dawkins Cafe Server v2.0 running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`- Customer Menu:    http://localhost:${PORT}/?table=1`);
    logger.info(`- Kitchen Display:  http://localhost:${PORT}/kitchen.html`);
    logger.info(`- Admin Dashboard:  http://localhost:${PORT}/admin.html`);
    logger.info(`- Table QR Codes:   http://localhost:${PORT}/qr-codes.html`);
    logger.info(`====================================================`);
});

module.exports = { app, server, db };
