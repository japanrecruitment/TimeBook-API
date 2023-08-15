import { environment } from "@utils/environment";

export default `
<tr>
    <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
        <!-- Pre footer content -->
        <tr>
            <td class="content-cell">
                <div class="f-fallback">
                    <p>
                        ※本メールは送信専用の為、ご返信いただけません。<br />
                        お問い合わせは下記URLからお願いいたします。<br />
                        <a href="https://www.pocketseq.com/support">https://www.pocketseq.com/support</a><br />
                        運営会社: 株式会社シークエンス<br />
                        受付時間: 平日10:00～17:00
                    </p>
                </div>
            </td>
        </tr>
      </table>
    </td>
</tr>
<tr class="email-wrapper">
    <td>
        <table
            class="email-footer"
            align="center"
            width="570"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
        >
            <tr>
                <td class="content-cell" align="center">
                    <p class="f-fallback sub align-center">
                    &copy; 2023 All rights reserved.
                    </p>
                    <p class="f-fallback sub align-center">
                    <strong>${environment.APP_READABLE_NAME}</strong>
                    </p>
                    <p class="f-fallback sub align-center">
                    <strong
                        >株式会社シークエンス</strong
                    ><br />
                    〒143-0016 東京都大田区大森北 4－12－3 CASA K 2C<br />
                    メール:　info@pocketseq.com<br />
                    お問い合わせ:　03-6404-8046
                    </p>
                </td>
            </tr>
        </table>
    </td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
