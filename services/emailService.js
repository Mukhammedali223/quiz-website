import nodemailer from 'nodemailer';

// Create transporter only if SMTP is configured
let transporter = null;

/**
 * Initialize email transporter
 */
export const initEmailService = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('Email service initialized');
    return true;
  } else {
    console.log('Email service not configured');
    return false;
  }
};

/**
 * Send an email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log('Email not sent (service not configured):', { to, subject });
    return false;
  }

  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Quiz Website'}" <${process.env.EMAIL_FROM || 'noreply@quizapp.com'}>`,
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Quiz Website!';

  const text = `
Hello ${user.username}!

Welcome to Quiz Website! We're excited to have you join our community.

With your new account, you can:
- Create your own quizzes
- Challenge yourself with quizzes from other users
- Track your scores and progress

Get started by logging in and creating your first quiz!

Best regards,
The Quiz Website Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .features { margin: 20px 0; }
    .features li { margin: 10px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Quiz Website!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${user.username}</strong>!</p>
      <p>Welcome to Quiz Website! We're excited to have you join our community.</p>
      
      <p>With your new account, you can:</p>
      <ul class="features">
        <li>Create your own quizzes</li>
        <li>Challenge yourself with quizzes from other users</li>
        <li>Track your scores and progress</li>
      </ul>
      
      <p>Get started by logging in and creating your first quiz!</p>
      
      <div class="footer">
        <p>Best regards,<br>The Quiz Website Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

/**
 * Send quiz created notification
 */
export const sendQuizCreatedEmail = async (user, quiz) => {
  const subject = `Quiz Created: ${quiz.title}`;

  const text = `
Hello ${user.username}!

Your quiz "${quiz.title}" has been created successfully!

Quiz Details:
- Title: ${quiz.title}
- Description: ${quiz.description || 'No description'}
- Questions: ${quiz.questions.length}
- Visibility: ${quiz.isPublic ? 'Public' : 'Private'}

You can manage your quiz from your dashboard.

Best regards,
The Quiz Website Team
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    text
  });
};
