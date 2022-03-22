import { environment } from "@utils/environment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type PasswordChangeEmailData = EmailData;

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
              <h1>パスワード変更完了のお知らせ</h1>
              <p>
                パスワードの変更が完了致しました。
              </p>
              <p>
                新たなパスワードで、ログイン出来るかをご確認ください。<br /><br />
                ◆パスワードはお客様自身で管理いただきますよう、お願いいたします。<br />
                ◆パスワードや登録情報は、「アカウント設定」より変更することが出来ます。
            </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<PasswordChangeEmailData>(
    template,
    `【${environment.APP_READABLE_NAME}】パスワード変更完了のお知らせ`
);
