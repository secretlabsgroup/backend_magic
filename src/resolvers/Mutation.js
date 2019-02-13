const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { transport, formatEmail } = require('../mail');

const Mutation = {
	async createEvent(parent, args, ctx, info) {
		const event = await ctx.db.mutation.createEvent(
			{
				data: { ...args }
			},
			info
		);
		return event;
	},
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		const password = await bcrypt.hash(args.password, 10);
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: ['FREE'] }
				}
			},
			info
		);
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
		});

		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error('Invalid Password!');
		}
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		return user;
	},
	signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye!' };
	},
	async requestReset(parent, args, ctx, info) {
		// 1. Check if this is a real user
		const user = await ctx.db.query.user({ where: { email: args.email } });
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}
		const random = await randomBytes(20);
		const resetToken = random.toString('hex');
		const resetTokenExpiry = Date.now() + 3600000;
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry }
		});
		console.log(res); // just to check and make sure the resetToken and expiry are getting set
		const mailRes = await transport.sendMail({
			from: 'wes@wesbos.com',
			to: user.email,
			subject: 'Your Password Reset Token',
			html: formatEmail(`Your Password Reset Token is here!
		  \n\n
		  <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
		});

		// this is the SMTP Holden has setup that we can use to send emails once we go into production (have a hard cap of 100 emails/month though)

		// const mailRes = await client.sendEmail({
		// 	From: 'me@holdenb.me',
		// 	To: `${user.email}`,
		// 	Subject: 'Your Password Reset Token!',
		// 	HtmlBody: makeANiceEmail(`Your Password Reset Token is here!
		//   \n\n
		//   <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
		// });
		return { body: 'Thanks!' };
	},
	async resetPassword(parent, args, ctx, info) {
		if (args.password !== args.confirmPassword) {
			throw new Error('Passwords must match!');
		}
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000 // make sure reset Token is still within 1hr time limit
			}
		});
		if (!user) {
			throw new Error('This token is either invalid or expired');
		}
		const password = await bcrypt.hash(args.password, 10);
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null
			}
		});
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		return updatedUser;
	}
};

module.exports = Mutation;
