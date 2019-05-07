<template>
	<PDFData
		:url="url"
		@page-focus="updateCurrentPage"
	>
		<template v-slot:preview="{ pages }">
			<PDFPreview
				v-show="isPreviewEnabled"
				v-bind="{
					pages,
					scale,
					currentPage,
					pageCount,
					isPreviewEnabled
				}"
			/>
		</template>

		<template v-slot:document="{ pages }">
			<PDFDocument
				v-bind="{
					pages,
					scale,
					optimalScale,
					fit,
					currentPage,
					pageCount,
					isPreviewEnabled
				}"
				@scale-change="updateScale"
			/>
		</template>
	</PDFData>
</template>

<script lang="ts">
	import { Component, Vue } from 'vue-property-decorator';

	import PDFDocument from './PDFDocument.vue';
	import PDFPreview from './PDFPreview.vue';
	import PDFData from './PDFData.vue';

	interface UpdateScaleParameters {
		scale: number;
		isOptimal?: boolean;
	}

	@Component({
		components: {
			PDFDocument,
			PDFPreview,
			PDFData
		}
	})
	export default class PDFViewer extends Vue {
		url = '/pdf/demo4.pdf';

		scale = 0;
		optimalScale = 0;
		fit = 'auto';
		currentPage = 0;
		pageCount = 0;
		isPreviewEnabled = true;

		floor(value: number, precision: number) {
			const multiplier = Math.pow(10, precision || 0);
			return Math.floor(value * multiplier) / multiplier;
		}

		updateScale({ scale, isOptimal = false }: UpdateScaleParameters) {
			const roundedScale = this.floor(scale, 2);

			if (isOptimal) {
				this.optimalScale = roundedScale;
			}

			this.scale = roundedScale;
		}

		updateCurrentPage(pageNumber: number) {
			this.currentPage = pageNumber;
		}
	}
</script>
