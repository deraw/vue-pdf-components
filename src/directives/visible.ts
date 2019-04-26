import { VNode } from 'vue';

interface Modifiers {
	once?: boolean;
}

interface Binding {
	value: () => void;
	oldValue?: () => void;
	modifiers: Modifiers;
}

const instances = new WeakMap();

function createObserver(el: HTMLElement, vnode: VNode, modifiers: Modifiers, callback: () => void) {
	const observer = new IntersectionObserver(entries => {
		const entry = entries[0];

		if (entry.isIntersecting) {
			callback();

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

const visible: any = {
	bind(el: HTMLElement, { value, modifiers }: Binding, vnode: VNode) {
		const enhanced = (window as any).IntersectionObserver !== 'undefined';

		if (enhanced) {
			const observer = createObserver(el, vnode, modifiers, () => {
				const callback = value;

				if (typeof callback === 'function') {
					callback();
				}
			});

			instances.set(el, { observer });
		}
	},
	update(el: HTMLElement, { value, oldValue }: Binding, vnode: VNode) {
		if (value === oldValue) {
			return;
		}

		const { observer } = instances.get(el);
		disconnectObserver(observer);

		this.bind(el, { value, modifiers: {} }, vnode);
	},
	unbind(el: HTMLElement) {
		if (instances.has(el)) {
			const { observer } = instances.get(el);
			disconnectObserver(observer);
			instances.delete(el);
		}
	}
};

export default visible;
