import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";
import { environment } from "@utils/environment";

export type ReservationReceivedData = EmailData & {
    spaceId: string;
    reservationId: string;
    spaceName: string;
    checkInDate: string;
    checkInTime: string;
    checkOutTime: string;
    planName: string;
    options: string;
    totalPrice: string;
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
              <h1>こんにちは {{recipientName}}様</h1>
              <p>いつも${environment.APP_READABLE_NAME}をご利用いただき、誠にありがとうございます。</p>
              <p>以下内容にて予約リクエストを受け付けました。</p>
              <p>内容をご確認いただき、管理画面より承認・非承認の操作を24時間以内に行って下さい。</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #333;">予約詳細</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">予約番号：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{reservationId}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">施設名：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{spaceName}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">ご利用日：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{checkInDate}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">ご利用時間：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{checkInTime}} ～ {{checkOutTime}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">プラン名：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{planName}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">オプション利用：</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">{{options}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">ご料金：</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #e74c3c;">¥{{totalPrice}}（税込）</td>
                  </tr>
                </table>
              </div>
              
              <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
              <p>引き続き${environment.APP_READABLE_NAME}をよろしくお願いいたします。</p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ReservationReceivedData>(
    template,
    `【${environment.APP_READABLE_NAME}】{{checkInDate}}「{{spaceName}}」：予約リクエストを受付ました。`,
);
