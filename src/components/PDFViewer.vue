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
	import Vue from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import PDFDocument from './PDFDocument.vue';
	import PDFPreview from './PDFPreview.vue';
	import PDFData from './PDFData.vue';

	interface UpdateScaleParameters {
		scale: number;
		isOptimal?: boolean;
	}

	const Props = Vue.extend({
		props: {
			url: {
				type: String,
				required: true
			},
			fit: {
				type: String,
				default: 'auto'
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
			PDFDocument,
			PDFPreview,
			PDFData
		}
	})
	export default class PDFViewer extends MixinsDeclaration {
		scale = 0;
		optimalScale = 0;
		currentPage = 0;
		pageCount = 0;

		floor(value: number, precision: number): number {
			const multiplier = Math.pow(10, precision || 0);
			return Math.floor(value * multiplier) / multiplier;
		}

		updateScale({ scale, isOptimal = false }: UpdateScaleParameters): void {
			const roundedScale = this.floor(scale, 2);

			if (isOptimal) {
				this.optimalScale = roundedScale;
			}

			this.scale = roundedScale;
		}

		updateCurrentPage(pageNumber: number): void {
			this.currentPage = pageNumber;
		}
	}
</script>
