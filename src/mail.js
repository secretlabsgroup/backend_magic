const nodemailer = require('nodemailer');
// const postmark = require('postmark'); // will use when we wanna send actual emails

const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

const formatEmail = text => `
  <div className="email" style="
  border: 1px solid black;
  padding: 20px;
  font-family: sans-serif;
  line-height: 2;
  font-size: 20px;
  ">
  <h2>Hello There!</h2>
  <p>${text}</p>
  <p>Love, Holden Bucher</p>
  </div>
`;

module.exports = {
	transport,
	formatEmail
};
