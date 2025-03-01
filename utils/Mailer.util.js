import nodemailer from 'nodemailer';

const mailerUtils={

    welcomeMailForUser:async (req, res) => {
        const transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
            user: process.env.MAIL_ID, // your Gmail address
            pass: process.env.MAIL_PASSWORD, // your Gmail password or app-specific password
          }
        });
    
        const { receiverEmail, subject, userName, link } = req.body;
    
        // HTML template with dynamic values for employee onboarding
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to the Team!</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                }
                table {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-collapse: collapse;
                }
                .header {
                  background-color: #003366;
                  padding: 20px;
                  text-align: center;
                  color: #ffffff;
                }
                .header h1 {
                  margin: 0;
                }
                .content {
                  padding: 20px;
                  color: #333333;
                }
                .content h2 {
                  color: #003366;
                }
                .footer {
                  padding: 20px;
                  text-align: center;
                  background-color: #eeeeee;
                  color: #777777;
                  font-size: 12px;
                }
                .button {
                  background-color: #003366;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                }
                .button:hover {
                  background-color: #002244;
                }
              </style>
            </head>
            <body>
              <table>
                <tr>
                  <td class="header">
                    <h1>Welcome to Lawzz Advocate Services!</h1>
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h2>Dear ${userName || 'Employee'},</h2>
                    <p>We are thrilled to welcome you to the team! We believe that your skills and experience will be a valuable addition to our company.</p>
                    <p>Your onboarding process is now underway, and you can access our employee portal by clicking the button below:</p>
                    <p style="text-align: center;">
                      <a href="${link || '#'}" class="button">Access Employee Portal</a>
                    </p>
                    <p>If you have any questions or need assistance, please feel free to reach out to our HR team. We are here to support you in every step of your journey with us.</p>
                    <p>We look forward to working with you and achieving great success together!</p>
                    <p>Best regards,<br>The Lawzz HR Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <p>&copy; 2024 Lawzz Advocate Services. All rights reserved.</p>
                    <p>1234 Street Address, City, State | +1 123-456-7890 | hr@lawzz.com</p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `;
    
        // Define the email options
        const mailOptions = {
          from: `"Guess The Answer (GTA)" <${process.env.DISPLAY_EMAIL}>`, // sender address
          to: receiverEmail, // list of receivers
          subject: subject, // Subject line
          html: html // HTML body
        };
    
        // Send mail
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email', error });
          }
          console.log('Message sent: %s', info.messageId);
    
          res.status(200).json({
            message: 'Email sent successfully',
          });
        });
      },

    otpMailForUser:async (req, res) => {
        const transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
            user: process.env.MAIL_ID, // your Gmail address
            pass: process.env.MAIL_PASSWORD, // your Gmail password or app-specific password
          },
        });
    
        const { receiverEmail,subject, otp,userName,otpType } = req.body;
    
        const mailOptions = {
          from: `"From Guess The Answer (GTA)" <${process.env.DISPLAY_EMAIL}>`, // sender address
          to: receiverEmail, // recipient address
          subject: subject, // email subject
          text:`Hi ${userName?userName:"there"}\nYour ${otpType} OTP is : ${otp} \nThis OTP is valid for 5 minutes\nplease keep the otp confidential and not share with others.`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email', error });
          }
          console.log('Message sent: %s', info.messageId);
    
          res.status(200).json({
            message: 'Email sent successfully',
          });
        })
    
      }
}

export default mailerUtils;