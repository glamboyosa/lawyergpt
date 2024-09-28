"use client";

import type { PropsWithChildren } from "react";

export default function ClientWrapper({ children }: PropsWithChildren) {
	return <>{children}</>;
}
