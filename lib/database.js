const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logger } = require('./utils');

class Database {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }

    init() {
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                logger.error('Database connection error:', err);
            } else {
                logger.info(`Connected to SQLite database at ${this.dbPath}`);
                this.createTables();
            }
        });
    }

    createTables() {
        const ordersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                orderId TEXT PRIMARY KEY,
                checkoutRequestId TEXT,
                tableNumber TEXT,
                customerName TEXT NOT NULL,
                phoneNumber TEXT NOT NULL,
                items TEXT NOT NULL,
                totalAmount REAL NOT NULL,
                notes TEXT,
                status TEXT DEFAULT 'Pending Payment',
                paymentStatus TEXT DEFAULT 'Pending',
                mpesaReceipt TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                paidAt DATETIME
            )
        `;

        const auditTable = `
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                action TEXT NOT NULL,
                orderId TEXT,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(ordersTable, (err) => {
            if (err) logger.error('Error creating orders table:', err);
            else logger.info('Orders table initialized');
        });

        this.db.run(auditTable, (err) => {
            if (err) logger.error('Error creating audit log table:', err);
            else logger.info('Audit log table initialized');
        });
    }

    createOrder(orderData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO orders (orderId, checkoutRequestId, tableNumber, customerName, phoneNumber, items, totalAmount, notes, status, paymentStatus)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(
                sql,
                [orderData.orderId, orderData.checkoutRequestId, orderData.tableNumber, orderData.customerName, orderData.phoneNumber, orderData.items, orderData.totalAmount, orderData.notes, orderData.status, orderData.paymentStatus],
                function(err) {
                    if (err) reject(err);
                    else resolve({ orderId: orderData.orderId, ...orderData });
                }
            );
        });
    }

    getOrderById(orderId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM orders WHERE orderId = ?';
            this.db.get(sql, [orderId], (err, row) => {
                if (err) reject(err);
                else {
                    if (row) {
                        row.items = JSON.parse(row.items);
                    }
                    resolve(row);
                }
            });
        });
    }

    getOrderByCheckoutId(checkoutRequestId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM orders WHERE checkoutRequestId = ?';
            this.db.get(sql, [checkoutRequestId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    getAllOrders() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM orders ORDER BY createdAt DESC';
            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    rows.forEach(row => {
                        row.items = JSON.parse(row.items);
                    });
                    resolve(rows);
                }
            });
        });
    }

    getActiveOrders() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM orders WHERE status IN ('Paid', 'Preparing') ORDER BY createdAt DESC";
            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    rows.forEach(row => {
                        row.items = JSON.parse(row.items);
                    });
                    resolve(rows);
                }
            });
        });
    }

    updateOrderStatus(orderId, status) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE orderId = ?';
            this.db.run(sql, [status, orderId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    getStats() {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            const sql = `
                SELECT 
                    COUNT(*) as totalOrders,
                    SUM(CASE WHEN paymentStatus = 'Paid' THEN 1 ELSE 0 END) as paidOrders,
                    SUM(CASE WHEN paymentStatus = 'Paid' THEN totalAmount ELSE 0 END) as totalRevenue,
                    SUM(CASE WHEN status = 'Pending Payment' THEN 1 ELSE 0 END) as pendingPayments,
                    SUM(CASE WHEN status = 'Payment Failed' THEN 1 ELSE 0 END) as failedPayments
                FROM orders
                WHERE DATE(createdAt) = ?
            `;
            this.db.get(sql, [today], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }

    logAudit(username, action, orderId, details) {
        const sql = 'INSERT INTO audit_log (username, action, orderId, details) VALUES (?, ?, ?, ?)';
        this.db.run(sql, [username, action, orderId, details], (err) => {
            if (err) logger.error('Audit log error:', err);
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = Database;
