import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@unkey/ratelimit";
import { env } from "@/lib/env";
import { cookies } from "next/headers";
import { hasAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export const maxDuration = 30;

const unkey = new Ratelimit({
  rootKey: env.UNKEY_ROOT_KEY,
  namespace: "/api/chat/[id]",
  limit: 10,
  duration: "1d",
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAllowed = hasAuthCookie();
  if (!isAllowed) {
    return NextResponse.redirect(new URL("/new-location", req.url));
  }
  const { messages } = await req.json();
  const conversationId = params.id;
  const userId = cookies().get("userId")?.value;

  const ratelimit = await unkey.limit(userId as string);
  if (!ratelimit.success) {
    revalidatePath(`/conversations/${conversationId}`);
    return NextResponse.json(
      { success: false, error: "Rate limit reached, try again later" },
      { status: 429 }
    );
  }
  try {
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
