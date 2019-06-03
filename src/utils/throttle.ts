/** Throttle function
 * "Throttling enforces a maximum number of times a function can be called over time"
 *
 * @param {Function} callback The callback to execute
 * @param {Number} delay The throttle delay
 */
export default function throttle(callback: () => void, delay: number) {
	let lastCall = 0;

	return function() {
		const date = new Date;
		const now = date.getTime();

		if (now - lastCall < delay) {
			return;
		}

		lastCall = now;

		return callback();
	}
}
