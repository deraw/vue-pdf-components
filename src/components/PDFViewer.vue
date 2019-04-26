<template>
	<PDFData :url="url">
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
	import PDFData from './PDFData.vue';

	@Component({
		components: {
			PDFDocument,
			PDFData
		}
	})
	export default class PDFViewer extends Vue {
		url = '/pdf/demo4.pdf';

		scale = 0;
		optimalScale = 0;
		fit = 'auto';
		currentPage = null;
		pageCount = null;
		isPreviewEnabled = false;

		floor(value: number, precision: number) {
			const multiplier = Math.pow(10, precision || 0);
			return Math.floor(value * multiplier) / multiplier;
		}

		updateScale({ scale, isOptimal = false }: any) {
			const roundedScale = this.floor(scale, 2);

			if (isOptimal) {
				this.optimalScale = roundedScale;
			}

			this.scale = roundedScale;
		}
	}
</script>
