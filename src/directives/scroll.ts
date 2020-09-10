import { DirectiveOptions } from 'vue';

import throttle from '../utils/throttle';

/**
 * Provide callback when the window or a
 * specifically defined element is scrolled
 * @example v-pdf-scroll="callback"
 */
export const scrollDirective: DirectiveOptions = {
	inserted(el, binding) {
		const callback = binding.value;

		// Immediate modifier
		// v-pdf-scroll.immediate="callback"
		if (binding.modifiers.immediate) {
			callback();
		}

		// Throttle scroll event by 300ms
		const throttledScroll = throttle(callback, 300);
		el.addEventListener('scroll', throttledScroll, true);
	}
};
