import { Loading } from "~/components/loading";

const LoadingFallback = () => {
	return (
		<div className="mt-2 grid">
			<Loading size="lg" />
		</div>
	);
};

export default LoadingFallback;
