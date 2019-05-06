<template>
	<ScrollingDocument
		v-slot="{
			page,
			isPageFocused,
			isElementFocused
		}"
		v-bind="{
			pages,
			pageCount,
			currentPage
		}"
		:enable-page-jump="true"
		:class="{ 'preview-enabled': isPreviewEnabled }"
		class="pdf-document"
		@page-jump="onPageJump"
		@pages-fetch="onPagesFetch"
		@pages-reset="fitWidth"
	>
		<PDFPage
			v-bind="{
				scale,
				optimalScale,
				page,
				isPageFocused,
				isElementFocused
			}"
			@page-rendered="onPageRendered"
			@page-errored="onPageErrored"
			@page-focus="onPageFocused"
		/>
	</ScrollingDocument>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

	import { PIXEL_RATIO, VIEWPORT_RATIO } from '../utils/const';

	import ScrollingDocument from './ScrollingDocument.vue';
	import PDFPage from './PDFPage.vue';

	@Component({
		components: {
			ScrollingDocument,
			PDFPage
		}
	})
	export default class PDFDocument extends Vue {
		@Prop() readonly pages!: any;
		@Prop({ default: 0 }) readonly pageCount!: number;
		@Prop({ default: 1.0 }) readonly scale!: number;
		@Prop(Number) readonly optimalScale!: number;
		@Prop(String) readonly fit!: string;
		@Prop({ default: 1 }) readonly currentPage!: number;
		@Prop({ default: false }) readonly isPreviewEnabled!: boolean;

		get defaultViewport() {
			if (!this.pages.length) {
				return { width: 0, height: 0 };
			}

			const [page] = this.pages;
			return page.getViewport(1.0);
		}
		get isPortrait() {
			const { width, height } = this.defaultViewport;
			return width <= height;
		}

		pageWidthScale() {
			const { defaultViewport, $el } = this;
			if (!defaultViewport.width) {
				return 0;
			}

			return ($el.clientWidth * PIXEL_RATIO) * .73 / defaultViewport.width;
		}
		pageHeightScale() {
			const { defaultViewport, $el } = this;
			if (!defaultViewport.height) {
				return 0;
			}

			return ($el.clientHeight * PIXEL_RATIO) * VIEWPORT_RATIO / defaultViewport.height;
		}
		// Determine an ideal scale using viewport of document's first page,
		// the pixel ratio from the browser
		// and a subjective scale factor based on the screen size.
		@Watch('pageCount')
		@Watch('isPreviewEnabled')
		fitWidth() {
			const scale = this.pageWidthScale();
			this.updateScale(scale, { isOptimal: !this.optimalScale });
		}
		fitHeight() {
			const scale = this.isPortrait ? this.pageHeightScale() : this.pageWidthScale();
			this.updateScale(scale);
		}
		fitAuto() {
			const scale = Math.min(this.pageWidthScale(), this.pageHeightScale());
			this.updateScale(scale);
		}
		updateScale(scale: number, { isOptimal = false } = {}) {
			if (!scale) {
				return;
			}

			this.$emit('scale-change', { scale, isOptimal });
		}
		onPageJump(scrollTop: number) {
			this.$el.scrollTop = scrollTop; // triggers 'scroll' event
		}
		onPagesFetch(currentPage: number) {
			this.$parent.$emit('pages-fetch', currentPage);
		}
		onPageFocused(pageNumber: number) {
			this.$parent.$emit('page-focus', pageNumber);
		}
		onPageRendered(payload: number) {
			this.$parent.$emit('page-rendered', payload);
		}
		onPageErrored(payload: number) {
			this.$parent.$emit('page-errored', payload);
		}

		@Watch('fit')
		updateFit(fit: string) {
			switch (fit) {
				case 'width': {
					this.fitWidth();
					break;
				}
				case 'auto': {
					this.fitAuto();
					break;
				}
				default: {
					break;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pdf-document {
		position: absolute;
		overflow: auto;
		width: 100%;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: #525f69;

		/deep/ {
			> div + div {
				margin-top: 50px;
			}
		}
	}

	@media print {
		.pdf-document {
			position: static;
		}
	}
</style>
