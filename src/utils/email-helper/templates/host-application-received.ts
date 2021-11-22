import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type HostApplicationReceivedEmailData = EmailData;

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
              <h1>へのお申込みありがとうございます</h1>
              <p>
                この度は、time bookにお申込みいただき、誠にありがとうございます。ご入力いただきました内容に基づき、弊社所定の審査を行わせていただきます。審査結果に関しまして、通常約〇日間ほどで、こちらのアドレスに返信致します。審査完了までしばらくお待ちください。
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<HostApplicationReceivedEmailData>(
    template,
    "【time book】へのお申込みありがとうございます"
);
