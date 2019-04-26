interface Modifiers {
	immediate: boolean;
}

interface Binding {
	value: () => void;
	modifiers: Modifiers;
}

function throttle(fn: () => void, delay: number) {
	let lastCall = 0;

	return function() {
		const now = (new Date).getTime();

		if (now - lastCall < delay) {
			return;
		}

		lastCall = now;

		return fn();
	}
}

const scrollDirective: any = {
	inserted(el: HTMLElement, binding: Binding) {
		const callback = binding.value;

		if (binding.modifiers.immediate) {
			callback();
		}

		const throttledScroll = throttle(callback, 300);
		el.addEventListener('scroll', throttledScroll, true);
	}
};

export default scrollDirective;
