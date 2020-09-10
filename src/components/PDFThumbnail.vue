<template>
	<div
		v-observe-visibility="{
			callback: drawPage,
			once: true
		}"
		:class="{
			focused: isPageFocused
		}"
		class="pdf-thumbnail"
		@click="focusPage"
	>
		<img
			v-if="src"
			:src="src"
		>

		<div
			v-else
			class="pdf-placeholder"
		>
			<div class="pdf-placeholder-content">
				{{ loadingLabel }}
			</div>
		</div>

		<span class="pdf-page-number">
			{{ pageNumber }}
		</span>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFPageViewport, PDFRenderTask } from 'pdfjs-dist';
	import { Page } from '../types';

	@Component
	export default class PDFThumbnail extends Vue {
		src: string | null = null;
		renderTask?: PDFRenderTask;

		@Prop(Object) readonly page!: Page;
		@Prop(Number) readonly scale!: number;
		@Prop(Boolean) readonly isPageFocused!: boolean;
		@Prop({ type: String, default: 'Loading' }) readonly loadingLabel!: string;

		get viewport(): PDFPageViewport {
			return this.page.getViewport({
				scale: 1.0
			});
		}

		get pageNumber(): number {
			return this.page.pageNumber;
		}

		focusPage(): void {
			this.$emit('page-focus', this.pageNumber);
		}

		drawPage(): void {
			if (this.renderTask) {
				return;
			}

			const { viewport } = this;
			const canvas = document.createElement('canvas');
			const canvasContext = canvas.getContext('2d');

			if (!canvasContext) {
				return;
			}

			const renderContext = { canvasContext, viewport };
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			// PDFPageProxy#render
			// https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
			this.renderTask = this.page.render(renderContext);
			this.renderTask.promise
				.then(
					// onResolve
					() => {
						this.src = canvas.toDataURL();
						// Zeroing the width and height causes Firefox to release graphics
						// resources immediately, which can greatly reduce memory consumption.
						canvas.width = 0;
						canvas.height = 0;

						this.$emit('thumbnail-rendered', {
							page: this.page,
							text: `Rendered thumbnail ${this.pageNumber}`
						});
					},
					// onReject
					(reason) => {
						this.destroyRenderTask();

						this.$emit('thumbnail-errored', {
							reason,
							page: this.page,
							text: `Failed to render thumbnail ${this.pageNumber}`
						});
					}
				);
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

		@Watch('src')
		@Watch('scale')
		updateVisibility(): void {
			this.$parent.$emit('update-visibility');
		}

		@Watch('page')
		pageUpdated(newPage: Page, oldPage: Page): void {
			this.destroyPage(oldPage);
		}

		mounted() {
			// console.log(`Thumbnail ${this.pageNumber} mounted`);
		}

		beforeDestroy(): void {
			this.destroyPage(this.page);
		}
	}
</script>

<style lang="scss">
	.pdf-thumbnail {
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		position: relative;
		width: 100%;
	}

	.pdf-placeholder {
		width: 100%;
		background: #fff;
		background-clip: content-box;
		position: relative;

		&::before {
			content: '';
			display: block;
			padding-top: 150%;
		}

		.pdf-placeholder-content {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
		}
	}
</style>
