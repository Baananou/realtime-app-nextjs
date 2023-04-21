import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { fetchRedis } from "@/helpers/redis";

// function getGoogleCred() {
// 	const clientId = process.env.GOOGLE_CLIENT_ID;
// 	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 	if (!clientId || clientId.length === 0) {
// 		throw new Error("Missing Google GOOGLE_CLIENT_ID");
// 	}
// 	if (!clientSecret || clientSecret.length === 0) {
// 		throw new Error("Missing Google GOOGLE_CLIENT_SECRET");
// 	}
// 	return { clientId, clientSecret };
// }

function getGithubCred() {
	const clientId = process.env.GITHUB_ID;
	const clientSecret = process.env.GITHUB_SECRET;

	if (!clientId || clientId.length === 0) {
		throw new Error("Missing GITHUB GITHUB_ID");
	}
	if (!clientSecret || clientSecret.length === 0) {
		throw new Error("Missing GITHUB GITHUB_SECRET");
	}
	return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db),
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		// GoogleProvider({
		// 	clientId: getGoogleCred().clientId,
		// 	clientSecret: getGoogleCred().clientSecret,
		// }),
		GitHubProvider({
			clientId: "Iv1.47b26042470550aa",
			clientSecret: "a70ac1c5d2c4a02c55772b9124a92f24c5d763b4",
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// const dbUser = (await db.get(`user:${token.id}`)) as User | null; //To avoid caching this will be replaced
			const dbUserResult = (await fetchRedis("get", `user:${token.id}`)) as
				| string
				| null;

			if (!dbUserResult) {
				token.id = user!.id;
				return token;
			}
			const dbUser = JSON.parse(dbUserResult) as User;
			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			};
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.email = token.email;
				session.user.name = token.name;
				session.user.image = token.picture;
			}
			return session;
		},
		redirect() {
			return "/dashboard";
		},
	},
};
