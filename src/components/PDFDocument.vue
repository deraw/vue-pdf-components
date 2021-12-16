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
				page,
				scale,
				optimalScale,
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
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import { Page, PDFPageViewport } from '@/types';

	import { PIXEL_RATIO, VIEWPORT_RATIO } from '../utils/const';

	import ScrollingDocument from './ScrollingDocument.vue';
	import PDFPage from './PDFPage.vue';

	const Props = Vue.extend({
		props: {
			pages: {
				type: Array as PropType<Page[]>,
				required: true
			},
			pageCount: {
				type: Number,
				default: 0
			},
			scale: {
				type: Number,
				default: 1.0
			},
			optimalScale: {
				type: Number,
				required: true
			},
			fit: {
				type: String,
				required: true
			},
			currentPage: {
				type: Number,
				default: 1
			},
			isPreviewEnabled: {
				type: Boolean,
				default: false
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component<PDFDocument>({
		components: {
			ScrollingDocument,
			PDFPage
		},
		watch: {
			pageCount() {
				this.fitWidth();
			},
			isPreviewEnabled() {
				this.fitWidth();
			},
			fit(fit: string) {
				this.updateFit(fit);
			}
		}
	})
	export default class PDFDocument extends MixinsDeclaration {
		get defaultViewport(): PDFPageViewport {
			if (!this.pages.length) {
				return {
					width: 0,
					height: 0
				} as PDFPageViewport;
			}

			const [page] = this.pages;

			return page.getViewport({
				scale: 1.0
			});
		}

		get isPortrait(): boolean {
			const { width, height } = this.defaultViewport;
			return width <= height;
		}

		pageWidthScale(): number {
			if (!this.defaultViewport.width) {
				return 0;
			}

			return (this.$el.clientWidth * PIXEL_RATIO) * .73 / this.defaultViewport.width;
		}

		pageHeightScale(): number {
			if (!this.defaultViewport.height) {
				return 0;
			}

			return (this.$el.clientHeight * PIXEL_RATIO) * VIEWPORT_RATIO / this.defaultViewport.height;
		}

		// Determine an ideal scale using viewport of document's first page,
		// the pixel ratio from the browser
		// and a subjective scale factor based on the screen size.
		fitWidth(): void {
			const scale = this.pageWidthScale();

			this.updateScale(scale, !this.optimalScale);
		}

		fitHeight(): void {
			const scale = this.isPortrait ? this.pageHeightScale() : this.pageWidthScale();
			this.updateScale(scale);
		}

		fitAuto(): void {
			const scale = Math.min(this.pageWidthScale(), this.pageHeightScale());
			this.updateScale(scale);
		}

		updateScale(scale: number, isOptimal = false): void {
			if (!scale) {
				return;
			}

			this.$emit('scale-change', {
				scale,
				isOptimal
			});
		}

		onPageJump(scrollTop: number): void {
			this.$el.scrollTop = scrollTop; // triggers 'scroll' event
		}

		onPagesFetch(currentPage: number): void {
			this.$parent.$emit('pages-fetch', currentPage);
		}

		onPageFocused(pageNumber: number): void {
			this.$parent.$emit('page-focus', pageNumber);
		}

		onPageRendered(payload: number): void {
			this.$parent.$emit('page-rendered', payload);
		}

		onPageErrored(payload: number): void {
			this.$parent.$emit('page-errored', payload);
		}

		updateFit(fit: string): void {
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

<style lang="scss">
	.pdf-document {
		position: absolute;
		overflow: auto;
		width: 100%;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}

	@media print {
		.pdf-document {
			position: static;
		}
	}
</style>
