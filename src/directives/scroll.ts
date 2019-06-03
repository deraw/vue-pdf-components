import { DirectiveOptions } from 'vue';

import throttle from '../utils/throttle';

/** Scroll directive
 * Provide callback when the window
 * or a specifically defined element are scrolled
 */
const scrollDirective: DirectiveOptions = {
	inserted(el, binding) {
		/** v-pdf-scroll="callback" */
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

export default scrollDirective;
