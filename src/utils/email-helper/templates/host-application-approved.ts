import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type HostApplicationApprovedEmailData = EmailData;

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
              <h1>お申込み承認のお知らせ</h1>
              <p>
                この度は、time bookへお申込みいただき誠にありがとうございます。登録審査が完了致しましたのでご連絡致します。
              </p>
              <p>
                これより、ご登録いただいた住所へ「time book利用規約」をお送りいたします。お手元に届きましたら内容をご確認の上、同意書にサインの上ご返送下さいますようお願い申し上げます。
              </p>
              <p>
                その後、ログインIDを発行させていただきます。
              </p>
              <p>
                ご不明点がございましたら、ご連絡下さい。
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<HostApplicationApprovedEmailData>(template, "【time book】お申込み承認のお知らせ");
