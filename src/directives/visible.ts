import { DirectiveOptions, VNode } from 'vue';

declare global {
	interface Window {
		IntersectionObserver?: IntersectionObserver;
	}
}

interface Modifiers {
	[key: string]: boolean
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
const instances = new WeakMap();

function createObserver(el: HTMLElement, vnode: VNode, modifiers: Modifiers, callback: () => void) {
	const observer = new IntersectionObserver(entries => {
		const entry = entries[0];

		// If the element if intersecting
		if (entry.isIntersecting) {
			// Fire the callback
			callback();

			// If the modifier once is present,
			// disconnect the observer
			if (modifiers.once) {
				disconnectObserver(observer);
			}
		}
	});

	// Observe when element is inserted in DOM
	if (vnode.context) {
		vnode.context.$nextTick(() => observer.observe(el));
	}

	return observer;
}

function disconnectObserver(observer: IntersectionObserver) {
	if (observer) {
		observer.disconnect();
	}
}

// Visible directive
// Provide callback when an element is visible

// Using IntersectionObserver
// (see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

// v-pdf-visible="callback"
const visible: DirectiveOptions = {
	bind(el, { value, modifiers }, vnode) {
		// Don't do anything is IntersectionObserver is not supported
		if (window.IntersectionObserver === undefined) {
			return;
		}

		// Create the observer
		const observer = createObserver(el, vnode, modifiers, () => {
			const callback = value;

			if (typeof callback === 'function') {
				callback();
			}
		});

		instances.set(el, { observer });
	},
	update(el, { value, oldValue }, vnode, oldVnode) {
		// If the value hasn't been updated,
		// don't do anything
		if (value === oldValue) {
			return;
		}

		// Disconnect previous observer
		const { observer } = instances.get(el);
		disconnectObserver(observer);

		// Type safety: bind() is optional, make sure it's present
		if (typeof this.bind !== 'function') {
			return;
		}

		// Call bind() with updated parameters
		// (this will create a new observer)
		this.bind(el, { value, modifiers: {} } as any, vnode, oldVnode);
	},
	unbind(el) {
		if (instances.has(el)) {
			// Disconnect & delete the observer
			const { observer } = instances.get(el);
			disconnectObserver(observer);
			instances.delete(el);
		}
	}
};

export default visible;
