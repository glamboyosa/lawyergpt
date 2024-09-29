import { hasAuthCookie } from "@/lib/auth";
import { env } from "@/lib/env";
import { Ratelimit } from "@unkey/ratelimit";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
const unkey = new Ratelimit({
	rootKey: env.UNKEY_ROOT_KEY,
	namespace: "/api/chat/[id]",
	limit: 5,
	duration: "1d",
});
export async function GET(req: NextRequest) {
	const isAllowed = hasAuthCookie();
	if (!isAllowed) {
		return NextResponse.redirect(new URL("/auth", req.url));
	}
	const userId = cookies().get("userId")?.value;
	const user = cookies().get("user")?.value;
	console.log(user);
	try {
		if (user !== env.PRIMARY_MAIL_I && user !== env.PRIMARY_MAIL_II) {
			const ratelimit = await unkey.limit(userId as string, { cost: 0 });

			return NextResponse.json({ success: true, remaining: ratelimit.remaining }, { status: 200 });
		}
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 });
	}
}
