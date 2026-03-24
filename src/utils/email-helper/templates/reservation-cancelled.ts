import { environment } from "@utils/environment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ReservationCancelledData = EmailData & {
    spaceId: string;
    spaceType?: "hotel" | "space"; // Add space type for dynamic content
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
                {{#if spaceType}}
                  {{#if (eq spaceType "hotel")}}
                    残念ながら、宿泊施 {{spaceId}} はキャンセルされました
                  {{else}}
                    残念ながら、予約スペース {{spaceId}} はキャンセルされました
                  {{/if}}
                {{else}}
                  残念ながら、予約スペース {{spaceId}} はキャンセルされました
                {{/if}}
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ReservationCancelledData>(
    template,
    `【${environment.APP_READABLE_NAME}】予約に失敗しました`,
);
