<template>
	<div
		v-pdf-visible.once="drawPage"
		:class="{
			focused: isPageFocused
		}"
		class="pdf-thumbnail"
		@click="focusPage"
	>
		<img
			v-if="src"
			:src="src"
			class="box-shadow"
		>

		<div
			v-else
			class="placeholder box-shadow"
		>
			<div class="content">
				Loading
			</div>
		</div>

		<span class="page-number">
			{{ pageNumber }}
		</span>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFPageProxy, PDFRenderTask } from 'pdfjs-dist';

	import pdfVisible from '../directives/visible';

	@Component({
		directives: {
			pdfVisible
		}
	})
	export default class PDFThumbnail extends Vue {
		src: string | null = null;
		renderTask?: PDFRenderTask;

		@Prop(Object) readonly page!: PDFPageProxy;
		@Prop(Number) readonly scale!: number;
		@Prop(Boolean) readonly isPageFocused!: boolean;

		get viewport() {
			return this.page.getViewport(1.0);
		}

		get pageNumber() {
			return this.page.pageNumber;
		}

		focusPage() {
			this.$emit('page-focus', this.pageNumber);
		}

		drawPage() {
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
			(this.renderTask as any)
				.then(() => {
					this.src = canvas.toDataURL();
					// Zeroing the width and height causes Firefox to release graphics
					// resources immediately, which can greatly reduce memory consumption.
					canvas.width = 0;
					canvas.height = 0;
				})
				.then(() => {
					this.$emit('thumbnail-rendered', {
						page: this.page,
						text: `Rendered thumbnail ${this.pageNumber}`
					});
				})
				.catch((response: any) => {
					this.destroyRenderTask();
					this.$emit('thumbnail-errored', {
						response,
						page: this.page,
						text: `Failed to render thumbnail ${this.pageNumber}`
					});
				});
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

		@Watch('src')
		@Watch('scale')
		updateVisibility() {
			this.$parent.$emit('update-visibility');
		}

		@Watch('page')
		pageUpdated(newPage: PDFPageProxy, oldPage: PDFPageProxy) {
			this.destroyPage(oldPage);
		}

		mounted() {
			// console.log(`Thumbnail ${this.pageNumber} mounted`);
		}

		beforeDestroy() {
			this.destroyPage(this.page);
		}
	}
</script>

<style scoped>
	.pdf-thumbnail {
		cursor: pointer;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		position: relative;
		width: 100%;
	}

	img,
	.placeholder {
		border: 7px solid transparent;
		border-radius: 5px;
		width: 65%;
	}

	.pdf-thumbnail.focused img {
		border-color: rgba(68, 204, 139, 0.65);
	}

	.placeholder {
		background: white;
		background-clip: content-box;
		position: relative;
	}

	.placeholder::before {
		content: '';
		display: block;
		padding-top: 75%;
	}

	.placeholder .content {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.page-number {
		color: white;
		font-weight: bold;
	}
</style>
