<template>
	<div
		ref="pdf-page"
		v-bind="canvasAttrs"
	>
		<canvas
			ref="canvas"
			v-observe-visibility="{
				callback: renderPage,
				once: true
			}"
			v-bind="canvasAttrs"
		/>

		<div
			ref="textLayer"
			class="pdf-text-layer"
		/>
	</div>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import pdfjs, { PDFPageViewport, PDFRenderTask, TextContent } from 'pdfjs-dist';
	import { Page } from '../types';

	import { PIXEL_RATIO } from '../utils/const';

	interface CanvasAttrs {
		width: number;
		height: number;
		style: string;
		class: string;
	}

	const Props = Vue.extend({
		props: {
			page: {
				type: Object as PropType<Page>,
				required: true
			},
			scale: {
				type: Number,
				required: true
			},
			optimalScale: {
				type: Number,
				required: true
			},
			isPageFocused: {
				type: Boolean,
				default: false
			},
			isElementFocused: {
				type: Boolean,
				default: false
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component<PDFPage>({
		watch: {
			scale() {
				this.$parent.$emit('update-visibility');
			},
			page(newPage: Page, oldPage: Page) {
				this.destroyPage(oldPage);
			},
			isElementFocused(isElementFocused: boolean) {
				if (isElementFocused) {
					this.focusPage();
				}
			}
		}
	})
	export default class PDFPage extends MixinsDeclaration {
		renderTask?: PDFRenderTask;
		viewport = {} as PDFPageViewport;

		get actualSizeViewport(): PDFPageViewport {
			return this.viewport.clone({
				viewBox: null,
				scale: this.scale,
				rotation: 0,
				offsetX: 0,
				offsetY: 0,
				dontFlip: true
			});
		}

		get canvasStyle(): string {
			const {
				width: actualSizeWidth,
				height: actualSizeHeight
			} = this.actualSizeViewport;

			const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map(dim => Math.ceil(dim / PIXEL_RATIO));

			return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
		}

		get canvasAttrs(): CanvasAttrs {
			let { width, height } = this.actualSizeViewport;
			[width, height] = [width, height].map((dim) => Math.ceil(dim));

			return {
				width: width * 2,
				height: height * 2,
				style: `width: ${width}px; height: ${height}px;`,
				class: 'pdf-page'
			};
		}

		get pageNumber(): number {
			return this.page.pageNumber;
		}

		focusPage(): void {
			if (this.isPageFocused) {
				return;
			}

			this.$emit('page-focus', this.pageNumber);
		}

		renderPage(): void {
			if (this.renderTask) {
				return;
			}

			const canvasEl = this.$refs.canvas as HTMLCanvasElement;
			const canvasContext = canvasEl.getContext('2d');

			if (!canvasContext) {
				return;
			}

			const renderContext = {
				canvasContext,
				viewport: this.page.getViewport({
					scale: this.scale * 2
				})
			};

			// PDFPageProxy#render
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			this.renderTask = this.page.render(renderContext);
			this.renderTask.promise
				.then(
					// onResolve
					() => {
						this.$emit('page-rendered', {
							page: this.page,
							text: `Rendered page ${this.pageNumber}`
						});

						this.page.getTextContent()
							.then(
								// onResolve
								(text) => {
									this.renderTextLayer(text);
								}
							);
					},
					// onReject
					(reason) => {
						this.destroyRenderTask();
						this.$emit('page-errored', {
							reason,
							page: this.page,
							text: `Failed to render page ${this.pageNumber}`
						});
					}
				);
		}

		renderTextLayer(textContent: TextContent): void {
			/* eslint-disable @typescript-eslint/no-explicit-any */
			(pdfjs as any).renderTextLayer({
				textContent: textContent,
				container: this.$refs.textLayer,
				viewport: this.page.getViewport({
					scale: this.scale
				}),
				textDivs: []
			});
		}

		destroyPage(page: Page): void {
			// PDFPageProxy#destroy
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			if (page) {
				page._destroy();
			}

			this.destroyRenderTask();
		}

		destroyRenderTask(): void {
			if (!this.renderTask) {
				return;
			}

			// RenderTask#cancel
			// https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
			this.renderTask.cancel();
			this.renderTask = undefined;
		}

		created() {
			// PDFPageProxy#getViewport
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			this.viewport = this.page.getViewport({
				scale: this.optimalScale
			});
		}

		beforeDestroy(): void {
			this.destroyPage(this.page);
		}
	}
</script>

<style lang="scss">
	.pdf-page {
		position: relative;
		display: block;
		max-width: none;
		margin: 0 auto;
		background: #fff;
	}

	.pdf-text-layer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;

		span {
			color: transparent;
			position: absolute;
			white-space: pre;
			cursor: text;
			transform-origin: left bottom;
		}

		::selection {
			color: transparent !important;
			background: rgba(179, 212, 252, .3) !important;
		}
	}
</style>
