import { environment } from "@utils/environment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type AccountDeactivated = EmailData;

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
              <h1>${environment.APP_READABLE_NAME}アカウント退会手続き完了のお知らせ</h1>
              <p>
              ${environment.APP_READABLE_NAME}運営事務局です。
              </p>
              <p>
              ${environment.APP_READABLE_NAME}の退会手続きが完了したことをお知らせいたします。<br />
                これまでご利用いただきまして、誠にありがとうございました。
            </p>
            <p>
            なお、こちらの内容に心当たりの無い場合は、下記お問い合わせフォームまでお問い合わせください。
            </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<AccountDeactivated>(
    template,
    `【${environment.APP_READABLE_NAME}】退会手続き完了のお知らせ`
);
