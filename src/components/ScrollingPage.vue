<template>
	<div>
		<slot
			v-bind="{
				isPageFocused,
				isElementFocused
			}"
		/>
	</div>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import { Page } from '@/types';

	const Props = Vue.extend({
		props: {
			page: {
				type: Object as PropType<Page>,
				required: true
			},
			focusedPage: {
				type: Number,
				default: undefined
			},
			scrollTop: {
				type: Number,
				default: 0
			},
			clientHeight: {
				type: Number,
				default: 0
			},
			enablePageJump: {
				type: Boolean,
				default: false
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component<ScrollingPage>({
		watch: {
			scrollTop() {
				this.updateElementBounds();
			},
			clientHeight() {
				this.updateElementBounds();
			},
			isPageFocused(): void {
				if (!this.enablePageJump || this.isElementFocused || !this.isPageFocused) {
					return;
				}

				this.$emit('page-jump', this.elementTop);
			}
		}
	})
	export default class ScrollingPage extends MixinsDeclaration {
		elementTop = 0;
		elementHeight = 0;

		get isPageFocused(): boolean {
			return this.page.pageNumber === this.focusedPage;
		}

		get isElementFocused(): boolean {
			const {
				elementTop,
				bottom,
				elementHeight,
				scrollTop,
				clientHeight
			} = this;

			if (!elementHeight) {
				return false;
			}

			const halfHeight = elementHeight / 2;
			const halfScreen = clientHeight / 2;

			const delta = elementHeight >= halfScreen ? halfScreen : halfHeight;
			const threshold = scrollTop + delta;

			return elementTop < threshold && bottom >= threshold;
		}

		get bottom(): number {
			return this.elementTop + this.elementHeight;
		}

		get scrollBottom(): number {
			return this.scrollTop + this.clientHeight;
		}

		updateElementBounds(): void {
			const { offsetTop, offsetHeight } = this.$el as HTMLElement;
			this.elementTop = offsetTop;
			this.elementHeight = offsetHeight;
		}

		created() {
			this.$on('update-visibility', this.updateElementBounds);
		}

		mounted() {
			this.updateElementBounds();
		}
	}
</script>
