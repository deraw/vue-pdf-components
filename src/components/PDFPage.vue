<template>
	<div
		ref="page"
		v-bind="canvasAttrs"
	>
		<canvas
			ref="canvas"
			v-pdf-visible.once="renderPage"
			v-bind="canvasAttrs"
		/>

		<div
			ref="textLayer"
			class="text-layer"
		/>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFPageProxy, PDFRenderTask, PDFLoadingTask, PDFPageViewport } from 'pdfjs-dist';

	import { PIXEL_RATIO } from '../utils/const';

	@Component
	export default class PDFPage extends Vue {
		renderTask?: PDFRenderTask;
		viewport: any = null;

		@Prop(Object) readonly page!: PDFPageProxy;
		@Prop(Number) readonly scale!: number;
		@Prop(Number) readonly optimalScale!: number;
		@Prop({ type: Boolean, default: false }) readonly isPageFocused!: boolean;
		@Prop({ type: Boolean, default: false }) readonly isElementFocused!: boolean;

		get actualSizeViewport() {
			return this.viewport.clone({ scale: this.scale });
		}

		get canvasStyle() {
			const {
				width: actualSizeWidth,
				height: actualSizeHeight
			} = this.actualSizeViewport;

			const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
			.map(dim => Math.ceil(dim / PIXEL_RATIO));

			return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
		}

		get canvasAttrs() {
			let { width, height } = this.actualSizeViewport;
			[width, height] = [width, height].map((dim) => Math.ceil(dim));

			const style = this.canvasStyle;

			return {
				width: width * 2,
				height: height * 2,
				style: `width: ${width}px; height: ${height}px;`,
				class: 'pdf-page box-shadow'
			};
		}

		get pageNumber() {
			return this.page.pageNumber;
		}

		focusPage() {
			if (this.isPageFocused) {
				return;
			}

			this.$emit('page-focus', this.pageNumber);
		}

		renderPage() {
			if (this.renderTask) {
				return;
			}

			// const { viewport } = this;
			const canvasEl = this.$refs.canvas as HTMLCanvasElement;
			const canvasContext = canvasEl.getContext('2d');

			if (!canvasContext) {
				return;
			}

			const renderContext = { canvasContext, viewport: this.page.getViewport(this.scale * 2) };

			// PDFPageProxy#render
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			this.renderTask = this.page.render(renderContext);
			(this.renderTask as any)
				.then(() => {
					this.$emit('page-rendered', {
						page: this.page,
						text: `Rendered page ${this.pageNumber}`
					});

					this.page.getTextContent().then((text: any) => {
						this.renderTextLayer(text);
					});
				})
				.catch((response: any) => {
					this.destroyRenderTask();
					this.$emit('page-errored', {
						response,
						page: this.page,
						text: `Failed to render page ${this.pageNumber}`
					});
				});
		}

		renderTextLayer(textContent: any) {
			return import(
				/* webpackChunkName: 'pdfjs-dist' */
				'pdfjs-dist'
			).then((pdfjs: any) => {
				pdfjs.renderTextLayer({
					textContent: textContent,
					container: this.$refs.textLayer,
					viewport: this.page.getViewport(this.scale),
					textDivs: []
				});
			});
		}

		@Watch('scale')
		updateVisibility() {
			this.$parent.$emit('update-visibility');
		}

		destroyPage(page: PDFPageProxy) {
			// PDFPageProxy#destroy
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			if (page) {
				// page.destroy();
			}

			this.destroyRenderTask();
		}

		destroyRenderTask() {
			if (!this.renderTask) {
				return;
			}

			// RenderTask#cancel
			// https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
			this.renderTask.cancel();
			this.renderTask = undefined;
		}

		@Watch('page')
		pageUpdated(newPage: PDFPageProxy, oldPage: PDFPageProxy) {
			this.destroyPage(oldPage);
		}

		@Watch('isElementFocused')
		isElementFocusedUpdated(isElementFocused: boolean) {
			if (isElementFocused) {
				this.focusPage();
			}
		}

		created() {
			// PDFPageProxy#getViewport
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			this.viewport = this.page.getViewport(this.optimalScale);
		}

		mounted() {
			// console.log(`Page ${this.pageNumber} mounted`);
		}

		beforeDestroy() {
			this.destroyPage(this.page);
		}
	}
</script>

<style lang="scss" scoped>
	.pdf-page {
		position: relative;
		display: block;
		max-width: none;
		margin: 0 auto;
		background: #fff;
		box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.11), 0 5px 15px 0 rgba(0, 0, 0, 0.08);
	}

	.text-layer {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;

		/deep/ {
			div {
				color: transparent;
				position: absolute;
				white-space: pre;
				cursor: text;
				transform-origin: left bottom;
			}

			::selection {
				background: rgba(179, 212, 252, .3);
			}

			::-moz-selection {
				background: rgba(0, 0, 255, .3);
			}
		}
	}
</style>
