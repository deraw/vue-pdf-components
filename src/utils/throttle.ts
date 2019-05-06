// Throttle function
// "Throttling enforces a maximum number of times a function can be called over time"
export default function throttle(callback: () => void, delay: number) {
	let lastCall = 0;

	return function() {
		const now = (new Date).getTime();

		if (now - lastCall < delay) {
			return;
		}

		lastCall = now;

		return callback();
	}
}
