<template>
	<ScrollingDocument
		v-slot="{
			page,
			isPageFocused
		}"
		v-bind="{
			pages,
			pageCount,
			currentPage
		}"
		:is-parent-visible="isPreviewEnabled"
		class="pdf-preview"
		@pages-fetch="onPagesFetch"
	>
		<PDFThumbnail
			v-bind="{
				page,
				scale,
				isPageFocused
			}"
			@thumbnail-rendered="onThumbnailRendered"
			@thumbnail-errored="onThumbnailErrored"
			@page-focus="onPageFocused"
		/>
	</ScrollingDocument>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import { PDFPageProxy } from 'pdfjs-dist';

	import ScrollingDocument from './ScrollingDocument.vue';
	import PDFThumbnail from './PDFThumbnail.vue';

	const Props = Vue.extend({
		props: {
			pages: {
				type: Array as PropType<PDFPageProxy[]>,
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

	@Component({
		components: {
			ScrollingDocument,
			PDFThumbnail
		}
	})
	export default class PDFPreview extends MixinsDeclaration {
		onPagesFetch(currentPage: number): void {
			this.$parent.$emit('pages-fetch', currentPage);
		}

		onPageFocused(pageNumber: number): void {
			this.$parent.$emit('page-focus', pageNumber);
		}

		onThumbnailRendered(payload: PDFPageProxy): void {
			this.$el.dispatchEvent(new Event('scroll'));
			this.$parent.$emit('thumbnail-rendered', payload);
		}

		onThumbnailErrored(payload: string): void {
			this.$parent.$emit('thumbnail-errored', payload);
		}
	}
</script>

<style lang="scss">
	.pdf-preview {
		position: absolute;
		overflow: auto;
		z-index: 1;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	@media print {
		.pdf-preview {
			display: none;
		}
	}
</style>
