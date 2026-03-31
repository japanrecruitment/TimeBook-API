import { environment } from "@utils/environment";

export default `
<tr>
    <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
        <!-- Pre footer content -->
        <tr>
            <td class="content-cell">
                <div class="f-fallback">
                    <p style="margin-bottom: 16px;">
                        予約の確認・変更・取消につきましては、マイページよりお手続きください。<br>
                        <a href="https://www.pocketseq.com" style="color: #007bff; text-decoration: none;">https://www.pocketseq.com</a>
                    </p>
                    <p style="margin-bottom: 8px;">
                        ※ご精算はクレジットカード決済にて承っております。
                    </p>
                    <p style="margin-bottom: 8px;">
                        キャンセルの場合は規定に基づいてキャンセル料を申し受けます。
                    </p>
                    <p style="margin-bottom: 8px;">
                        ※本メールは送信専用アドレスから送信しております。
                    </p>
                    <p style="margin-bottom: 8px;">
                        ※ご不明な点がございましたら、以下のページをご確認の上、ページ内にてご案内しておりますお問い合わせフォームよりお送りくださいますようお願いいたします。
                    </p>
                    <p style="margin-bottom: 16px;">
                        <strong>■ヘルプ・お問い合わせ■</strong><br>
                        <a href="https://www.pocketseq.com/contact" style="color: #007bff; text-decoration: none;">https://www.pocketseq.com/contact</a>
                    </p>
                    <p style="margin-bottom: 0;">
                        運営：株式会社シークエンス
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
                    <p class="f-fallback sub align-center" style="margin-bottom: 8px;">
                    &copy; 2023 All rights reserved.
                    </p>
                    <p class="f-fallback sub align-center" style="margin-bottom: 8px;">
                    <strong>${environment.APP_READABLE_NAME}</strong>
                    </p>
                    <p class="f-fallback sub align-center" style="margin-bottom: 0;">
                    <strong>株式会社シークエンス</strong><br>
                    〒143-0016 東京都大田区大森北 4－12－3 CASA K 2C<br>
                    メール: <a href="mailto:info@pocketseq.com" style="color: #007bff; text-decoration: none;">info@pocketseq.com</a><br>
                    お問い合わせ: <a href="tel:03-6404-8046" style="color: #007bff; text-decoration: none;">03-6404-8046</a>
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
