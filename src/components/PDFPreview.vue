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
				scale,
				page,
				isPageFocused
			}"
			@thumbnail-rendered="onThumbnailRendered"
			@thumbnail-errored="onThumbnailErrored"
			@page-focus="onPageFocused"
		/>
	</ScrollingDocument>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

	import ScrollingDocument from './ScrollingDocument.vue';
	import PDFThumbnail from './PDFThumbnail.vue';

	@Component({
		components: {
			ScrollingDocument,
			PDFThumbnail
		}
	})
	export default class PDFPreview extends Vue {
		@Prop() readonly pages!: any;
		@Prop({ type: Number, default: 0 }) readonly pageCount!: number;
		@Prop({ type: Number, default: 1.0 }) readonly scale!: number;
		@Prop({ type: Number, default: 1 }) readonly currentPage!: number;
		@Prop({ type: Boolean, default: false }) readonly isPreviewEnabled!: boolean;

		onPagesFetch(currentPage: number) {
			this.$parent.$emit('pages-fetch', currentPage);
		}

		onPageFocused(pageNumber: number) {
			this.$parent.$emit('page-focus', pageNumber);
		}

		onThumbnailRendered(payload: any) {
			this.$el.dispatchEvent(new Event('scroll'));
			this.$parent.$emit('thumbnail-rendered', payload);
		}

		onThumbnailErrored(payload: any) {
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
