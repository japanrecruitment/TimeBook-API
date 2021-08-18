import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type EmailVerificationData = EmailData & {
    verificationCode: number;
};

const template = `
  ${header}
  <!-- Email Body -->
  <tr>
    <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
        <!-- Body content -->
        <tr>
          <td class="content-cell">
            <div class="f-fallback">
              <h1>Hi, {{recipientName}}</h1>
              <p>Thank you for choosing Timebook.</p>
              <p>
                Please confirm that
                <strong>{{recipientEmail}}</strong> is your e-mail address by completing the email verification process.
              </p>
              <p>
                To complete email verification, please use the code below.
              </p>
              <p class="verificationCode">{{verificationCode}}</p>
              <p>
                If you did not create an account using this address, please ignore this email.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<EmailVerificationData>(template, "Please verify your email address");
