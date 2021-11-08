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
              <h1>{{recipientName}}様、</h1>
              <p>time bookへようこそ！</p>
              <p>
                time bookにご登録頂きまして、誠にありがとうございます。
                本登録を完了するには下記の確認番号を利用してください。
              </p>
              <p class="verificationCode">{{verificationCode}}</p>
              <p>
                本メールは仮登録情報をお知らせするものです。特に返信の必要はございません。
万一このメールにお心当たりの無い場合は削除してくださいますようお願い致します。
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<EmailVerificationData>(template, "【time book】ご登録メールアドレスの確認");
