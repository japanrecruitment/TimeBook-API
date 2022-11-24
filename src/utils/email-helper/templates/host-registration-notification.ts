import { environment } from "@utils/environment";
import moment from "moment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type HostRegisterNotificationData = EmailData & {
    customerType: string;
    email: string;
    name: string;
};

const currentDate = moment(new Date()).format("YYYY年MM月DD日 HH:mm");

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
              <h1>新規ホスト登録のお知らせ</h1>
            </div>
                <p>
                    <strong>お客様種別:</strong>
                    <br />
                    {{customerType}}
                    <br /><br />
                    <strong>メールアドレス:</strong>
                    <br />
                    {{email}}
                    <br /><br />
                    <strong>ホスト名:</strong>
                    <br />
                    {{name}}
                    <br /><br />
                    <strong>日付時刻:</strong>
                    <br />
                    ${currentDate}
                </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<HostRegisterNotificationData>(
    template,
    `【${environment.APP_READABLE_NAME}】新規ホスト登録のお知らせ - ${currentDate}`
);
