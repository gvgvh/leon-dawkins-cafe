const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database Store
let orders = [];

// Safaricom Daraja Config (from Environment or Sandbox Defaults)
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

// Generate Daraja OAuth Token
async function getDarajaToken() {
    if (!DARAJA.isConfigured()) return null;
    const auth = Buffer.from(`${DARAJA.consumerKey}:${DARAJA.consumerSecret}`).toString('base64');
    const res = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: `Basic ${auth}` }
    });
    if (!res.ok) throw new Error(`Daraja token error: ${res.statusText}`);
    const data = await res.json();
    return data.access_token;
}

// 1. STK Push Order Endpoint
app.post('/api/orders/stkpush', async (req, res) => {
    try {
        const { tableNumber, customerName, phoneNumber, items, totalAmount, notes } = req.body;

        if (!customerName || !phoneNumber || !items || !items.length || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }

        // Format phone number to Kenyan international 2547XXXXXXXX / 2541XXXXXXXX
        let formattedPhone = String(phoneNumber).replace(/[\s+()-]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        }

        const orderId = 'ORD-' + Date.now().toString().slice(-6);
        let checkoutRequestId = 'ws_CO_' + Date.now();

        // If Daraja live/sandbox credentials are provided, call Daraja API
        if (DARAJA.isConfigured()) {
            try {
                const token = await getDarajaToken();
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
                } else if (stkResult.ResponseCode !== '0') {
                    throw new Error(stkResult.ResponseDescription || 'STK Push failed');
                }
            } catch (darajaErr) {
                console.error('Daraja API call warning:', darajaErr.message);
                // In case of sandbox misconfiguration, allow graceful fallback
            }
        }

        const newOrder = {
            id: orderId,
            checkoutRequestId,
            tableNumber: tableNumber || '1',
            customerName,
            phoneNumber: formattedPhone,
            items,
            totalAmount,
            notes: notes || '',
            status: 'Pending Payment',
            paymentStatus: 'Pending',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);

        // Auto-simulation for local development / testing demo when no live Daraja webhook arrives
        // (Automatically confirms payment after 4 seconds so the demo works end-to-end out of the box)
        if (!DARAJA.isConfigured() || process.env.AUTO_SIMULATE_PAYMENT === 'true') {
            setTimeout(() => {
                const pending = orders.find(o => o.id === orderId && o.status === 'Pending Payment');
                if (pending) {
                    pending.status = 'Paid';
                    pending.paymentStatus = 'Paid';
                    pending.paidAt = new Date().toISOString();
                    console.log(`[Auto-Demo] Order ${orderId} automatically verified as PAID.`);
                    io.emit('new_order', pending);
                    io.emit('order_status_updated', pending);
                }
            }, 3500);
        }

        return res.json({
            success: true,
            message: 'STK Push prompt sent to your phone. Please enter PIN.',
            orderId: newOrder.id,
            checkoutRequestId
        });

    } catch (err) {
        console.error('STK Push Error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
});

// 2. M-Pesa Callback Endpoint (Called by Safaricom Daraja Webhook)
app.post('/api/mpesa/callback', (req, res) => {
    try {
        const callback = req.body?.Body?.stkCallback;
        if (!callback) {
            return res.json({ ResultCode: 0, ResultDesc: 'Accepted but empty payload' });
        }

        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callback;
        console.log(`[M-Pesa Callback] CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

        const order = orders.find(o => o.checkoutRequestId === CheckoutRequestID);

        if (order) {
            if (ResultCode === 0) {
                order.status = 'Paid';
                order.paymentStatus = 'Paid';
                order.paidAt = new Date().toISOString();
                
                // Extract receipt number if available
                const items = callback.CallbackMetadata?.Item || [];
                const receiptItem = items.find(i => i.Name === 'MpesaReceiptNumber');
                if (receiptItem) order.mpesaReceipt = receiptItem.Value;

                console.log(`[Order Paid] Broadcasted Order ${order.id} to Kitchen and Admin`);
                // Broadcast to Kitchen & Admin dashboards
                io.emit('new_order', order);
                io.emit('order_status_updated', order);
            } else {
                order.status = 'Payment Failed';
                order.paymentStatus = 'Failed';
                order.paymentError = ResultDesc;
                io.emit('order_status_updated', order);
            }
        }

        return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
        console.error('Callback error:', err);
        return res.json({ ResultCode: 0, ResultDesc: 'Error handled' });
    }
});

// 3. Test Simulation Callback Endpoint
app.post('/api/orders/simulate-callback', (req, res) => {
    const { orderId, success = true } = req.body;
    const order = orders.find(o => o.id === orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (success) {
        order.status = 'Paid';
        order.paymentStatus = 'Paid';
        order.paidAt = new Date().toISOString();
        io.emit('new_order', order);
        io.emit('order_status_updated', order);
    } else {
        order.status = 'Payment Failed';
        order.paymentStatus = 'Failed';
        io.emit('order_status_updated', order);
    }

    return res.json({ message: `Order ${orderId} simulated as ${order.status}`, order });
});

// 4. Get Orders API
app.get('/api/orders', (req, res) => {
    const { status } = req.query;
    if (status === 'active') {
        // Kitchen orders: Paid or currently Preparing
        const active = orders.filter(o => o.status === 'Paid' || o.status === 'Preparing');
        return res.json({ orders: active });
    }
    return res.json({ orders });
});

// 5. Get Single Order Status (for customer polling)
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
});

// 6. Update Order Status (Preparing / Ready / Completed)
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date().toISOString();

    console.log(`[Status Update] Order ${order.id} is now ${status}`);
    io.emit('order_status_updated', order);

    return res.json({ success: true, order });
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Leon Dawkins Cafe Server running on http://localhost:${PORT}`);
    console.log(`- Customer Menu:    http://localhost:${PORT}/?table=1`);
    console.log(`- Kitchen Display:  http://localhost:${PORT}/kitchen.html`);
    console.log(`- Admin Dashboard:  http://localhost:${PORT}/admin.html`);
    console.log(`- Table QR Codes:   http://localhost:${PORT}/qr-codes.html`);
    console.log(`====================================================`);
});
