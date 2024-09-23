import "./styles.css";

const bars = Array.from({ length: 12 }, (_, i) => i + 1);
export function Spinner({ color, size = 20 }: { color: string; size: number }) {
	return (
		<div
			className="wrapper"
			style={
				{
					"--spinner-size": `${size}px`,
					"--spinner-color": color,
				} as React.CSSProperties
			}
		>
			<div className="spinner">
				{bars.map((i) => (
					<div className="bar" key={`spinner-bar-${i}`} />
				))}
			</div>
		</div>
	);
}
