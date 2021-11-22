import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type HostApplicationRejectedEmailData = EmailData;

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
              <h1>審査結果のご連絡につきまして</h1>
              <p>
                この度は、time bookへお申込みいただき誠にありがとうございます。
早速ではございますが、貴施設のお申し込みにつきまして検討させていただいた結果、誠に恐縮ながら今回はご登録をお見送りさせていただくことになりました。審査にあたりましては、入会申込書にご記載いただいたお客様の情報、弊社独自の審査基準により総合的に判断させていただいております。具体的な審査内容の詳細につきまして開示しておらず、お問合せを頂きましてもお答えすることは出来兼ねます。せっかくのお申し込みをいただきながら誠に恐縮に存じますが、何卒ご容赦賜りますようお願い申し上げます。
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<HostApplicationRejectedEmailData>(
    template,
    "【time book】審査結果のご連絡につきまして"
);
