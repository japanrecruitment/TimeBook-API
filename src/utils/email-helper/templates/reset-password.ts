import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ResetPasswordData = EmailData & {
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
              <h1>{{recipientName}}様、</h1>
              <p>パスワードリセットとために下記の確認コードを利用してください。</p>
              <p class="verificationCode">{{verificationCode}}</p>
              <p>
                If you did not requset to reset your password, please ignore this email.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ResetPasswordData>(template, "【time book】パスワードリセットの確認");
