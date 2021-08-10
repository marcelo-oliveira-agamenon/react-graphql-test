import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "gv6h3yyncqstiag7@ethereal.email",
      pass: "yvwUqsHu5ZeFBvh8qq",
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject: "Change Password",
    html,
  });

  console.log("Message sent: ", info.messageId);
  console.log("preview url: ", nodemailer.getTestMessageUrl(info));
}
