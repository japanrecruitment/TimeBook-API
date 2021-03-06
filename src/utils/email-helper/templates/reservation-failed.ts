import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ReservationFailedData = EmailData & {
    spaceId: string;
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
              <h1>こんにちは {{recipientName}}、</h1>
              <p>いつもtime bookをご利用いただき、誠にありがとうございます。</p>
              <p>
                残念ながら、スペース{{spaceId}}の予約に失敗しました
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ReservationFailedData>(template, "【time book】予約に失敗しました");
