import nodemailer from 'nodemailer';

let transporter;

// Create transporter helper that resolves Ethereal test accounts automatically if credentials are default placeholders
const getTransporter = async () => {
  if (transporter) return transporter;

  const isPlaceholder = 
    !process.env.SMTP_USER || 
    process.env.SMTP_USER === 'ethereal_user_placeholder' || 
    process.env.SMTP_USER === '';

  if (isPlaceholder) {
    try {
      console.log('[Email Service] Creating Ethereal SMTP test account for email previews...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service] Ethereal SMTP active. Account: ${testAccount.user}`);
      return transporter;
    } catch (error) {
      console.error('[Email Service] Failed to create Ethereal test account, trying default transport:', error.message);
    }
  }

  // Standard configured SMTP transport
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
};

// Send styled email utility
const sendEmail = async ({ to, subject, html }) => {
  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail({
      from: `"${process.env.FROM_EMAIL_NAME || 'PizzaVerse Delivery'}" <${process.env.FROM_EMAIL || 'pizzaverse@delivery.com'}>`,
      to,
      subject,
      html
    });

    console.log(`[Email Service] Email sent successfully. MessageID: ${info.messageId}`);
    
    // If Ethereal test account is used, display the browser preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n==========================================\n[Email Service Preview Link] Verify details:\n${previewUrl}\n==========================================\n`);
    }
    return info;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error.message);
    throw error;
  }
};

// Email templates generator (gorgeous dark/orange themed emails)
const wrapTemplate = (title, bodyHtml) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121214; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #1a1a1e; border: 1px solid #ff6b0833; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        .header { background: linear-gradient(135deg, #ff6b08, #ff8c3b); padding: 30px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px; font-weight: 800; }
        .content { padding: 30px; line-height: 1.6; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #ff6b08; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; text-align: center; }
        .footer { padding: 20px; text-align: center; background-color: #111113; color: #718096; font-size: 12px; border-top: 1px solid #2d3748; }
        a { color: #ff6b08; text-decoration: none; }
        .order-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .order-table th, .order-table td { padding: 10px; text-align: left; border-bottom: 1px solid #2d3748; }
        .order-table th { color: #ff8c3b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍕 PIZZAVERSE</h1>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>You are receiving this because you signed up on PizzaVerse.</p>
          <p>© 2026 PizzaVerse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 1. Verification email
export const sendVerificationEmail = async (email, name, token, clientUrl = 'http://localhost:5173') => {
  const verifyLink = `${clientUrl}/verify-email?token=${token}`;
  const html = wrapTemplate(
    'Verify your Email',
    `<h2>Welcome to the Verse, ${name}!</h2>
     <p>Thank you for registering on PizzaVerse. Please verify your email to unlock delicious pizza crafting and real-time tracking.</p>
     <p><a href="${verifyLink}" class="btn">Verify Email Address</a></p>
     <p>Or click this link directly: <br> <a href="${verifyLink}">${verifyLink}</a></p>
     <p>This verification link will expire in 24 hours.</p>`
  );
  return sendEmail({ to: email, subject: '🍕 Welcome to PizzaVerse - Verify Your Email', html });
};

// 2. Welcome email
export const sendWelcomeEmail = async (email, name) => {
  const html = wrapTemplate(
    'Welcome to PizzaVerse',
    `<h2>You're in, ${name}! 🎉</h2>
     <p>Your email has been verified. Welcome to PizzaVerse, the ultimate MERN Pizza Delivery App!</p>
     <p>Build your custom pizzas with our live topping simulator, or choose from our curated signature selections.</p>
     <p><a href="http://localhost:5173/menu" class="btn">Explore Pizza Menu</a></p>`
  );
  return sendEmail({ to: email, subject: '🍕 Email Verified - Welcome to PizzaVerse', html });
};

// 3. Password Reset email
export const sendPasswordResetEmail = async (email, token, clientUrl = 'http://localhost:5173') => {
  const resetLink = `${clientUrl}/reset-password?token=${token}`;
  const html = wrapTemplate(
    'Reset your Password',
    `<h2>Reset Your Password</h2>
     <p>You requested a password reset on PizzaVerse. Click the button below to update your password credentials.</p>
     <p><a href="${resetLink}" class="btn">Reset Password</a></p>
     <p>If you did not request this, you can safely ignore this email.</p>
     <p>The link will remain active for 1 hour.</p>`
  );
  return sendEmail({ to: email, subject: '🔑 PizzaVerse - Password Reset Request', html });
};

// 4. Order Confirmation email
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsRows = order.items.map(item => {
    const itemName = item.isCustom 
      ? `Custom Pizza (Crust: ${item.customPizzaDetails.base}, Sauce: ${item.customPizzaDetails.sauce})` 
      : item.pizza.name;
    return `
      <tr>
        <td>${itemName} [x${item.quantity}]</td>
        <td>${item.size}</td>
        <td>₹${item.price}</td>
      </tr>
    `;
  }).join('');

  const html = wrapTemplate(
    'Order Confirmed',
    `<h2>Order Confirmed! 🍕🔥</h2>
     <p>Hey ${name}, we have received your order! Our chefs are preparing your hand-tossed creation right now.</p>
     <h3>Order ID: #${order._id}</h3>
     <table class="order-table">
       <thead>
         <tr>
           <th>Pizza</th>
           <th>Size</th>
           <th>Price</th>
         </tr>
       </thead>
       <tbody>
         ${itemsRows}
         <tr>
           <td colspan="2" style="font-weight: bold; text-align: right; color: #ff8c3b;">Total Amount:</td>
           <td style="font-weight: bold; color: #ff8c3b;">₹${order.totalAmount}</td>
         </tr>
       </tbody>
     </table>
     <p>Delivery Address:<br>
     ${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.zipCode}</p>
     <p><a href="http://localhost:5173/track-order/${order._id}" class="btn">Track Order Real-time</a></p>`
  );
  return sendEmail({ to: email, subject: `🍕 Order Confirmed - PizzaVerse #${order._id.toString().slice(-6)}`, html });
};

// 5. Stock Alert email (sent to Admin)
export const sendStockAlertEmail = async (adminEmail, itemName, quantity, threshold) => {
  const html = wrapTemplate(
    'Low Stock Warning',
    `<h2 style="color: #e53e3e;">⚠️ LOW STOCK WARNING</h2>
     <p>The following topping/crust base has dropped below the safety threshold limit:</p>
     <p style="font-size: 18px;"><strong>Ingredient:</strong> <span style="color: #ff6b08;">${itemName}</span></p>
     <p style="font-size: 18px;"><strong>Current Quantity:</strong> <span style="color: #e53e3e;">${quantity} units</span></p>
     <p style="font-size: 18px;"><strong>Minimum Threshold:</strong> <span>${threshold} units</span></p>
     <p>Please restock this item soon in the PizzaVerse Admin Dashboard to prevent builder unavailability.</p>
     <p><a href="http://localhost:5174/inventory" class="btn" style="background-color: #e53e3e;">Go to Inventory Panel</a></p>`
  );
  return sendEmail({ to: adminEmail, subject: `⚠️ Low Stock Alert: ${itemName} on PizzaVerse`, html });
};
