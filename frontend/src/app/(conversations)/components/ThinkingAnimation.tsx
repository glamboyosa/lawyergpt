export const ThinkingAnimation = () => (
	<div className="flex items-center space-x-2">
		<div
			className="h-2 w-2 animate-bounce rounded-full bg-stone-400"
			style={{ animationDelay: "0ms" }}
		/>
		<div
			className="h-2 w-2 animate-bounce rounded-full bg-stone-400"
			style={{ animationDelay: "150ms" }}
		/>
		<div
			className="h-2 w-2 animate-bounce rounded-full bg-stone-400"
			style={{ animationDelay: "300ms" }}
		/>
	</div>
);
