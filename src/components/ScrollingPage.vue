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
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFPageProxy } from 'pdfjs-dist';

	@Component
	export default class ScrollingPage extends Vue {
		elementTop = 0;
		elementHeight = 0;

		@Prop(Object) readonly page!: PDFPageProxy;
		@Prop({ type: Number, default: undefined }) readonly focusedPage!: number;
		@Prop({ type: Number, default: 0 }) readonly scrollTop!: number;
		@Prop({ type: Number, default: 0 }) readonly clientHeight!: number;
		@Prop({ type: Boolean, default: false }) readonly enablePageJump!: number;

		get isPageFocused() {
			return this.page.pageNumber === this.focusedPage;
		}

		get isElementFocused() {
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

		get bottom() {
			return this.elementTop + this.elementHeight;
		}

		get scrollBottom() {
			return this.scrollTop + this.clientHeight;
		}

		@Watch('isPageFocused')
		jumpToPage() {
			if (!this.enablePageJump || this.isElementFocused || !this.isPageFocused) {
				return;
			}

			this.$emit('page-jump', this.elementTop);
		}

		@Watch('scrollTop')
		@Watch('clientHeight')
		updateElementBounds() {
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
