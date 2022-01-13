import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ProfileUpdateEmailData = EmailData;

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
              <h1>ご登録情報変更のお知らせ</h1>
              <p>
                いつもtime bookをご利用いただき、誠にありがとうございます。サービス情報の変更が完了致しましたので、お知らせいたします。
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ProfileUpdateEmailData>(template, "【time book】ご登録情報変更のお知らせ");
