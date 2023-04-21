import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email: emailToAdd } = AddFriendValidator.parse(body.email);

		//*************************************************************************************************/
		/* Due To NextJs Caching this is not working so i'll be using the redis helper to bypass th prblm */
		//*************************************************************************************************/
		// const RESTResponse = await fetch(
		// 	`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,
		// 	{
		// 		headers: {
		// 			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		// 		},
		// 		cache: "no-store",
		// 	}
		// );
		//		const data = (await RESTResponse.json()) as { result: string };
		//*************************************************************************************************/

		const idToAdd = (await fetchRedis(
			"get",
			`user:email:${emailToAdd}`
		)) as string;

		if (!idToAdd) {
			return new Response("This Person Does Not Exist.", { status: 400 });
		}

		const session = await getServerSession(authOptions);

		if (!session) {
			return new Response("Unothorized", { status: 401 });
		}

		if (idToAdd === session.user.id) {
			return new Response("You cannot add yoursel as a friend", {
				status: 400,
			});
		}

		//check if user already added
		const isAlreadyAdded = (await fetchRedis(
			"sismember",
			`user:${idToAdd}:incoming_friend_requests`,
			session.user.id
		)) as 0 | 1;

		if (isAlreadyAdded) {
			return new Response("Already added this user", { status: 400 });
		}

		//check if user already firends
		const isAlreadyFriends = (await fetchRedis(
			"sismember",
			`user:${session.user.id}:friends`,
			idToAdd
		)) as 0 | 1;

		if (isAlreadyFriends) {
			return new Response("Already Friends with this user", { status: 400 });
		}

		//valid Request , send friend req

		db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

		return new Response("OK");
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response("invalid req payload", { status: 422 });
		}
		return new Response("invalid request", { status: 400 });
	}
}
