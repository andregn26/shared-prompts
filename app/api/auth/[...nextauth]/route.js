import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	async session({ session }) {
		const sessionUser = await User.fondOne({
			email: session.user.email,
		});
		session.user.id = sessionUser._id.toString();
	},
	async signIn({ profile }) {
		try {
			await connectToDB();
			//check if a user already exists
			const userExists = await User.findOne({
				email: profile.email,
			});

			//if not, create a new user and save it to the database
			if (!userExists) {
				await User.create({
					email: profile.email,
					username: profile.username.replace(" ", "").toLowerCase(),
					image: profile.picture,
				});
			}

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
});
export { handler as GET, handler as POST };