# Email Setup Guide (Nodemailer)

This application uses Nodemailer to send emails via SMTP. You can use any SMTP provider.

## Quick Setup Examples

### Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. **Add to `.env.local`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   FROM_EMAIL=BookYourSpa <your-email@gmail.com>
   ```

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
FROM_EMAIL=BookYourSpa <your-email@outlook.com>
```

### SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API Key in Settings > API Keys
3. Use SMTP credentials:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
   ```

### Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get SMTP credentials from Dashboard > Sending > SMTP
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-mailgun-username
   SMTP_PASSWORD=your-mailgun-password
   FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
   ```

### AWS SES

1. Set up AWS SES and verify your domain
2. Create SMTP credentials in AWS Console
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-aws-ses-smtp-username
   SMTP_PASSWORD=your-aws-ses-smtp-password
   FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
   ```
   Note: Replace `us-east-1` with your AWS region

### Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port (usually 587 or 465) | `587` |
| `SMTP_SECURE` | Use TLS/SSL (true for port 465, false for 587) | `false` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password or app password | `your-password` |
| `FROM_EMAIL` | Sender email address | `BookYourSpa <noreply@bookyourspa.com>` |

## Testing

### Test Email Configuration

Without SMTP configured, emails are mocked and logged to console. To test real emails:

1. Add SMTP credentials to `.env.local`
2. Restart your development server
3. Register a new account
4. Check your email inbox for verification email

### Troubleshooting

**Emails not sending:**
- Verify all SMTP variables are set correctly
- Check SMTP credentials (username/password)
- For Gmail: Use App Password, not regular password
- Check firewall/network allows SMTP connections
- Verify SMTP server allows connections from your IP

**Gmail specific:**
- Must enable 2-Step Verification
- Must use App Password (not regular password)
- "Less secure app access" is deprecated - use App Passwords

**Port issues:**
- Port 587: Usually for TLS (SMTP_SECURE=false)
- Port 465: Usually for SSL (SMTP_SECURE=true)
- Port 25: Often blocked by ISPs

## Production Recommendations

For production, consider:
- **SendGrid** or **Mailgun**: Reliable, good deliverability
- **AWS SES**: Very cost-effective at scale
- **Custom SMTP**: If you have your own mail server

Avoid using personal Gmail/Outlook accounts in production - use a dedicated email service.

