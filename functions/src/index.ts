import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();

export const sendEmail = functions
    .runWith({ secrets: ["RESEND_API_KEY"] })
    .https.onCall(async (data: any, context: functions.https.CallableContext) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { name, email, message, toEmail } = data;

        if (!name || !email || !message || !toEmail) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing required fields"
            );
        }

        const htmlBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" />
    <style>
        body{font-family:Georgia,serif;background:#0a0a0a;color:#e8e0d0;margin:0;padding:0}
        .c{max-width:580px;margin:32px auto;background:#111;border:1px solid #c9a84c33;border-radius:4px;overflow:hidden}
        .h{background:#1a1a1a;padding:28px 36px;border-bottom:1px solid #c9a84c44}
        .h h1{margin:0;font-size:20px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase}
        .h p{margin:4px 0 0;font-size:11px;color:#e8e0d055;letter-spacing:1px;text-transform:uppercase}
        .b{padding:32px 36px}
        .lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;margin-bottom:6px}
        .val{font-size:15px;color:#e8e0d0;line-height:1.6;border-left:2px solid #c9a84c44;padding-left:14px;margin-bottom:24px}
        .val a{color:#c9a84c;text-decoration:none}
        .f{padding:20px 36px;background:#0a0a0a;border-top:1px solid #c9a84c22;font-size:11px;color:#e8e0d030;text-align:center;letter-spacing:1px}
    </style>
    </head>
    <body>
    <div class="c">
        <div class="h">
        <h1>Nuevo Mensaje</h1>
        <p>Formulario de Contacto — diegocarriong.com</p>
        </div>
        <div class="b">
        <div class="lbl">Nombre</div>
        <div class="val">${name}</div>
        <div class="lbl">Correo</div>
        <div class="val"><a href="mailto:${email}">${email}</a></div>
        <div class="lbl">Mensaje</div>
        <div class="val">${message.replace(/\n/g, '<br/>')}</div>
        </div>
        <div class="f">diegocarriong.com &mdash; Panel de Administración</div>
    </div>
    </body>
    </html>
  `;

        try {
            await resend.emails.send({
                from: 'Portafolio Maestro Carrión <noreply@diegocarriong.com>',
                to: [toEmail],
                subject: `✉️ Nuevo mensaje de ${name}`,
                html: htmlBody,
                reply_to: email,
            });

            return { success: true };
        } catch (error) {
            console.error("Error sending email via Resend:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Failed to send email notification"
            );
        }
    });
