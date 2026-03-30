import { Loading } from "~/components/loading";

const LoadingFallback = () => {
	return (
		<div className="h-screen">
			<Loading size="xl" />
		</div>
	);
};

export default LoadingFallback;
