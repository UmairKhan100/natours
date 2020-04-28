const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Umair Khan <${process.env.EMAIL_FROM}>`;
  }

  //- A) TRUCK
  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      // For DEVELOPMENT
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    // SendGrid
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_EMAIL,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  //- B) DRIVER
  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  //- C) FACTORY OWNER
  async sendWelcome() {
    await this.send('welcome', 'Welcome To The Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset Token (valid for 10 min)'
    );
  }
};
