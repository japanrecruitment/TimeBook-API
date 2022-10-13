import { environment } from "@utils/environment";
import generateTemplate, { EmailData } from "./generateTemplate";
import { footer, header } from "./share";

export type ContactFormData = EmailData & {
    customerType: string;
    email: string;
    inquiryType: string;
    subject: string;
    description: string;
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
              <h1>お問い合わせメール</h1>
                <p>
                    <br />
                    <strong>お客様種別:<strong/>
                    <br />
                    {{customerType}}
                    <br /><br />
                    <strong>メールアドレス:<strong/>
                    <br />
                    {{email}}
                    <br /><br />
                    <strong>問い合わせ種別:<strong/>
                    <br />
                    {{inquiryType}}
                    <br /><br />
                    <strong>件名:<strong/>
                    <br />
                    {{subject}}
                    <br /><br />
                    <strong>お問い合わせ内容:<strong/>
                    <br />
                    {{description}}
                </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${footer}
`;

export default generateTemplate<ContactFormData>(template, `【${environment.APP_READABLE_NAME}】お問合せ`);
