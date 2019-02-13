require('dotenv').config({ path: '.env' });
const db = require('./db');
const bcrypt = require('bcryptjs');
let seedUsers = require('./seedUsers');
// WARNING WARNING WARNING WARNING WARNING WARNING WARNING
// gotta seed 100 users at a time because docker doesn't like you otherwise
seedUsers = seedUsers.slice(0, 100);

const seedDatabase = async () => {
	Promise.all(
		seedUsers.map(async user => {
			delete user.id;
			user.gender = user.gender.toUpperCase();
			const password = await bcrypt.hash(user.password, 10);
			try {
				const response = await db.mutation.updateUser({
					data: {
						...user,
						password
					},
					where: {
						email: user.email
					}
				});
				return response;
			} catch (err) {
				throw new Error(err.message);
			}
		})
	);
};

seedDatabase();
