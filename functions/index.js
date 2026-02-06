const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// 這裡我們預設使用一個基本的 SMTP 設定，Alex 需要填入他的密碼或是 API Key
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amekoyen@gmail.com', // 這裡可以改成 Alex 的，或是用 Ameko 的
    pass: 'YOUR_APP_PASSWORD' // 這需要產生一個 App Password
  }
});

exports.sendOrderConfirmation = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        const customer = order.customer;

        // 檢查是否為 Email 格式
        const isEmail = customer.contactMethod && customer.contactMethod.includes('@');
        if (!isEmail) {
            console.log('Contact method is not an email. Skipping confirmation email.');
            return null;
        }

        const mailOptions = {
            from: '"D*3 三滴工作室" <amekoyen@gmail.com>',
            to: customer.contactMethod,
            subject: `【D*3 三滴工作室】訂單確認通知 - #${snap.id.slice(-6)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #FF5722; border-bottom: 2px solid #FF5722; padding-bottom: 10px;">感謝您的訂購！</h2>
                    <p>親愛的 ${customer.name} 您好，</p>
                    <p>我們已收到您的 3D 列印訂製請求。以下是您的訂單摘要：</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>訂單編號：</strong> #${snap.id}</p>
                        <p><strong>訂單狀態：</strong> 待處理 (Pending)</p>
                        <p><strong>總金額：</strong> $${order.totalPrice + (order.shippingFee || 0)} TWD</p>
                    </div>

                    <h3>訂購內容：</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${order.items.map(item => `
                            <li style="border-bottom: 1px solid #eee; padding: 10px 0;">
                                <strong>${item.name}</strong> x ${item.quantity} 
                                <br><small style="color: #666;">價格: $${item.price}</small>
                            </li>
                        `).join('')}
                    </ul>

                    <p style="margin-top: 30px;"><strong>💡 提醒：</strong> 您可以隨時至官網「查詢訂單」頁面，使用您的 Email <strong>${customer.contactMethod}</strong> 查看生產進度。</p>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                        © 2026 D*3 三滴工作室 | Professional 3D Manufacturing
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', customer.contactMethod);
        } catch (error) {
            console.error('Error sending email:', error);
        }

        return null;
    });
