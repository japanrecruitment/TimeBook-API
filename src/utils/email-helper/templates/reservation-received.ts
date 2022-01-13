import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";
import { store } from "@utils/store";

export type ReservationReceivedData = EmailData & {
    spaceId: string;
    reservationId: string;
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
                スペース{{spaceId}}の予約リクエストを受け取りました。
              </p>
              <p>
                スペース: {{spaceId}}<br />
                予約番号: {{reservationId}}
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ReservationReceivedData>(template, "【time book】予約リクエストを受け取りました。");
