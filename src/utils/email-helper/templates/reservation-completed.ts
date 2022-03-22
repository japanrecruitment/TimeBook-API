import { environment } from "@utils/environment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ReservationCompletedData = EmailData & {
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
              <p>いつも${environment.APP_READABLE_NAME}をご利用いただき、誠にありがとうございます。</p>
              <p>
                スペース{{spaceid}}のご予約が完了しましたことをお知らせいたします。
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

export default generateTemplate<ReservationCompletedData>(template, `【${environment.APP_READABLE_NAME}】予約完了`);
