export class EmailTemplatesView {
  static orderConfirmation(orderNumber: string, customerName: string, total: number) {
    return {
      subject: `[SODAI] Order Confirmed #${orderNumber}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717;">
          <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; border-bottom: 1px solid #e5e5e5; padding-bottom: 16px;">
            SODAI / Order Confirmation
          </h1>
          <p style="font-size: 14px; line-height: 1.6;">Hello ${customerName},</p>
          <p style="font-size: 14px; line-height: 1.6;">
            Thank you for choosing SODAI. Your order <strong>#${orderNumber}</strong> has been received and is being prepared with precision at our Nordic atelier.
          </p>
          <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #737373;">Order Total</p>
            <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700;">$${total.toFixed(2)}</p>
          </div>
          <p style="font-size: 12px; color: #737373;">
            You will receive another update with a live tracking number once your package has been dispatched.
          </p>
        </div>
      `,
    };
  }

  static passwordReset(resetUrl: string) {
    return {
      subject: '[SODAI] Reset Your Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717;">
          <h1 style="font-size: 20px; font-weight: 700;">SODAI / Password Assistance</h1>
          <p style="font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password:
          </p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #171717; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #737373;">
            If you did not request this, please ignore this email. The link will expire in 1 hour.
          </p>
        </div>
      `,
    };
  }
}
