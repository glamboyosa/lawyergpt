import "server-only";
import { cookies } from "next/headers";

export function hasAuthCookie() {
	return cookies().has("userId");
}
