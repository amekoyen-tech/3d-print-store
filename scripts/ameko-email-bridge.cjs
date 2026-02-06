const admin = require('firebase-admin');
const { execSync } = require('child_process');

// Initialize Firebase Admin (uses service account or default credentials)
// Since this is running on the agent machine, we'll assume it has access or use a dummy config
admin.initializeApp({
  projectId: "ddd-project-130e3"
});

const db = admin.firestore();

console.log("🕵️ Ameko Order Listener started. Monitoring for new orders...");

db.collection('orders').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const order = change.doc.data();
            const orderId = change.doc.id;
            
            // Only notify if it's a new order (createdAt within last minute to avoid spamming old orders)
            const now = Date.now();
            const createdAt = order.createdAt?.toMillis() || now;
            
            if (now - createdAt < 60000) {
                console.log(`🔔 New Order Detected: ${orderId}`);
                sendConfirmationEmail(order, orderId);
            }
        }
    });
});

function sendConfirmationEmail(order, orderId) {
    const customerEmail = order.customer?.contactMethod;
    if (!customerEmail || !customerEmail.includes('@')) {
        console.log(`⚠️ Invalid email for order ${orderId}: ${customerEmail}`);
        return;
    }

    const itemsList = order.items.map(i => `- ${i.name} x${i.quantity} ($${i.price})`).join('\n');
    const total = order.totalPrice + (order.shippingFee || 0);

    const subject = `【D*3 三滴工作室】訂單確認通知 - #${orderId.slice(-6)}`;
    const body = `
親愛的 ${order.customer.name} 您好，

感謝您的訂購！我們已收到您的 3D 列印訂製請求。

訂單編號：#${orderId}
總金額：$${total} TWD

訂購內容：
${itemsList}

💡 提醒：您可以使用此 Email (${customerEmail}) 至官網「查詢訂單」頁面隨時查看生產進度。

D*3 三滴工作室 敬上
    `.trim();

    try {
        console.log(`📧 Sending email to ${customerEmail}...`);
        // 使用 gog CLI 發送郵件
        const cmd = `gog gmail send --to "${customerEmail}" --subject "${subject}" --body-file -`;
        const child = require('child_process').spawn('gog', ['gmail', 'send', '--to', customerEmail, '--subject', subject, '--body-file', '-']);
        child.stdin.write(body);
        child.stdin.end();
        
        child.on('close', (code) => {
            if (code === 0) console.log(`✅ Email sent successfully to ${customerEmail}`);
            else console.error(`❌ gog exited with code ${code}`);
        });
    } catch (error) {
        console.error("❌ Failed to send email via gog:", error);
    }
}
