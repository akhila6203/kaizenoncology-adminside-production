
const nodemailer = require("nodemailer");
require("dotenv").config();

// =========================================
// SMTP CONFIGURATION
// =========================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    minVersion: "TLSv1.2",
    servername: process.env.SMTP_HOST || "smtp.gmail.com",
  },
});

// =========================================
// HTML ESCAPE
// =========================================

const escapeHtml = (value) =>
  String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// =========================================
// SEND HEALTH LIBRARY ENQUIRY EMAIL
// =========================================

exports.sendHealthEnquiryEmail = async ({ type, data }) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is missing in .env");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS is missing in .env");
  }

  const formNames = {
    estimate: "Book Appointment",
    contact: "Contact Form",
    callback: "Request a Call",
  };

  const formName = formNames[type] || "Website Enquiry";

  const fields = [
    ["Patient Name", data.patient_name],
    ["Phone", data.phone],
    ["Email", data.email],
    ["City / Country", data.country],
    ["Preferred Location", data.preferred_location],
    ["Age", data.age],
    ["Gender", data.gender],
    ["Previous Visit", data.visited_before],
    ["Appointment Date", data.appointment_date],
    ["Preferred Time", data.preferred_time],
    ["Department", data.department],
    ["Preferred Doctor", data.preferred_doctor],
    ["Subject", data.subject],
    ["Message", data.message],
  ].filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;font-weight:600;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:10px;border:1px solid #e5e7eb;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `
    )
    .join("");

  return transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Kaizen Oncology"}" <${
      process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER
    }>`,
    to: adminEmail,
    replyTo: data.email || undefined,
    subject: `New ${formName} Submission`,

    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:25px;background:#f4f8f8;font-family:Arial,sans-serif;">

        <div style="max-width:650px;margin:auto;background:#ffffff;padding:25px;border-radius:12px;">

          <h2 style="color:#304b3c;">
            New ${escapeHtml(formName)} Submission
          </h2>

          <p style="color:#4f6061;">
            A user has submitted a new form on your website.
          </p>

          <table style="width:100%;border-collapse:collapse;color:#304b3c;">
            ${rows}
          </table>

          <p style="margin-top:20px;color:#7b898a;font-size:12px;">
            This is an automated notification from your website.
          </p>

        </div>

      </body>
      </html>
    `,
  });
};

















// const nodemailer =
//   require("nodemailer");

// require("dotenv").config();


// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",

//   port: Number(process.env.SMTP_PORT || 587),

//   secure: String(process.env.SMTP_SECURE) === "true",

//   requireTLS: true,

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },

//   tls: {
//     minVersion: "TLSv1.2",
//     servername: process.env.SMTP_HOST || "smtp.gmail.com",
//   },
// });



// function emailTemplate({
//   name,
//   heading,
//   description,
//   buttonText,
//   actionUrl,
// }) {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0"
//   />
// </head>

// <body
//   style="
//     margin:0;
//     padding:0;
//     background:#f4f8f8;
//     font-family:Arial,Helvetica,sans-serif;
//   "
// >

// <table
//   width="100%"
//   cellspacing="0"
//   cellpadding="0"
//   style="padding:35px 15px;"
// >
// <tr>
// <td align="center">

// <table
//   width="100%"
//   cellspacing="0"
//   cellpadding="0"
//   style="
//     max-width:600px;
//     background:#ffffff;
//     border-radius:12px;
//     overflow:hidden;
//     border:1px solid #e1ebea;
//   "
// >

//   <!-- HEADER -->

//   <tr>
//     <td
//       align="center"
//       style="
//         padding:28px 30px 22px;
//         border-bottom:3px solid #C8942E;
//       "
//     >

//       <div
//         style="
//           font-size:24px;
//           font-weight:700;
//           color:#064B50;
//         "
//       >
//         Akeso Global
//         <span style="color:#C8942E;">
//           Medical Services
//         </span>
//       </div>

//       <div
//         style="
//           margin-top:7px;
//           font-size:12px;
//           color:#708283;
//         "
//       >
//         Healing Beyond Borders
//       </div>

//     </td>
//   </tr>


//   <!-- BODY -->

//   <tr>
//     <td
//       style="
//         padding:38px 38px 35px;
//       "
//     >

//       <h2
//         style="
//           margin:0;
//           color:#064B50;
//           font-size:23px;
//           line-height:1.4;
//         "
//       >
//         ${heading}
//       </h2>


//       <p
//         style="
//           margin:18px 0 0;
//           color:#4f6061;
//           font-size:15px;
//           line-height:1.8;
//         "
//       >
//         Hello <strong>${name}</strong>,
//       </p>


//       <p
//         style="
//           margin:10px 0 0;
//           color:#4f6061;
//           font-size:15px;
//           line-height:1.8;
//         "
//       >
//         ${description}
//       </p>


//       <table
//         cellspacing="0"
//         cellpadding="0"
//         style="margin-top:27px;"
//       >
//         <tr>
//           <td
//             bgcolor="#C8942E"
//             style="
//               border-radius:8px;
//             "
//           >

//             <a
//               href="${actionUrl}"
//               style="
//                 display:inline-block;
//                 padding:15px 25px;
//                 color:#ffffff;
//                 font-size:14px;
//                 font-weight:700;
//                 text-decoration:none;
//               "
//             >
//               ${buttonText}
//             </a>

//           </td>
//         </tr>
//       </table>

   
// <p
//   style="
//     margin:16px 0 0;
//     font-size:13px;
//     line-height:1.7;
//     color:#667879;
//   "
// >
//   This link is valid for
//   <strong>30 minutes</strong>
//   and can only be used once.
// </p>

// <p
//   style="
//     margin:10px 0 0;
//     font-size:13px;
//     line-height:1.7;
//     color:#d62828;
//     font-weight:600;
//   "
// >
//   &#9888; Once this link expires or has been used,
//   it cannot be used again.
// </p>



//       <p
//         style="
//           margin:28px 0 7px;
//           color:#7b898a;
//           font-size:12px;
//           line-height:1.6;
//         "
//       >
//         If the button doesn't work,
//         copy and paste this link into
//         your browser:
//       </p>


//       <p
//         style="
//           margin:0;
//           word-break:break-all;
//           font-size:12px;
//           line-height:1.6;
//         "
//       >
//         <a
//           href="${actionUrl}"
//           style="
//             color:#C8942E;
//           "
//         >
//           ${actionUrl}
//         </a>
//       </p>

//     </td>
//   </tr>


//   <!-- FOOTER -->

//   <tr>
//     <td
//       align="center"
//       style="
//         padding:20px 30px;
//         background:#064B50;
//         color:#d8e4e4;
//         font-size:11px;
//         line-height:1.7;
//       "
//     >
//       © ${new Date().getFullYear()}
//       Akeso Global Medical Services.
//       All rights reserved.
//     </td>
//   </tr>

// </table>

// </td>
// </tr>
// </table>

// </body>
// </html>
// `;
// }


// async function sendMail({
//   to,
//   subject,
//   html,
// }) {
//   return transporter.sendMail({
//     from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
//     to,
//     subject,
//     html,
//   });
// }


// exports.sendActivationEmail =
//   async ({
//     name,
//     email,
//     token,
//   }) => {

//     const url =
//       `${process.env.FRONTEND_URL}/set-password?token=${encodeURIComponent(
//         token
//       )}`;

//     return sendMail({
//       to: email,

//       subject:
//         "Set your password to activate your Akeso account",

//       html: emailTemplate({
//         name,

//         heading:
//           `Welcome to Akeso Global Medical Services, ${name}!`,

//         description:
//           "Your account has been created. Click the button below to set your password and activate your account.",

//         buttonText:
//           "Set your password",

//         actionUrl: url,
//       }),
//     });
//   };


// exports.sendResetPasswordEmail =
//   async ({
//     name,
//     email,
//     token,
//   }) => {

//     const url =
//       `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
//         token
//       )}`;

//     return sendMail({
//       to: email,

//       subject:
//         "Reset your Akeso password",

//       html: emailTemplate({
//         name,

//         heading:
//           `Reset your Akeso password, ${name}`,

//         description:
//           "We received a request to reset your password. Click the button below to choose a new password.",

//         buttonText:
//           "Reset your password",

//         actionUrl: url,
//       }),
//     });
//   };