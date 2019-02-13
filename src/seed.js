require('dotenv').config({ path: '.env' });
const db = require('./db');
const seedUsers = require('./seedUsers');

const seedDatabase = async () => {
	Promise.all(
		seedUsers.map(async user => {
			delete user.id;
			user.gender = user.gender.toUpperCase();
			try {
				const response = await db.mutation.createUser({
					data: {
						...user
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
