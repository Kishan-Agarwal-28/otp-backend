import { APPNAME, APPURL } from "../constants.js";

export const generateEmailTemplates = (username, token, email = "", reason = "") => {
            let link = `${APPURL}/auth/verify/?token=${token}`;
            let html = `
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="600px" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center">
                            <h2 style="color: #333;">Verify Your ${APPNAME} Account</h2>
                            <p style="color: #555;">Hello ${username},</p>
                            <p>Thank you for signing up! Please verify your email by clicking the button below.</p>
                            <a href="${link}" style="display: inline-block; background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                            <p>If the button does not work, copy and paste this link into your browser:</p>
                            <p><a href="${link}" style="color: #007bff;">${link}</a></p>
                            <p>If you didn't create an account, please ignore this email.</p>
                            <p style="color: #777;">- The ${APPNAME} Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`;
    return html;
};
