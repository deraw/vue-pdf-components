<template>
	<div>
		<slot
			name="preview"
			v-bind="{ pages }"
		/>

		<slot
			name="document"
			v-bind="{ pages }"
		/>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import pdfjs, { PDFLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
	import { Page } from '../types';

	import range from '../utils/range';

	@Component
	export default class PDFData extends Vue {
		pdf: PDFDocumentProxy | null = null;
		pages: Page[] = [];
		cursor = 0;

		readonly BUFFER_LENGTH = 10;

		@Prop(String) readonly url!: string;

		@Watch('url', { immediate: true })
		urlUpdated(url : string) {
			pdfjs.getDocument(url).promise
				.then(
					// onReslove
					(pdf) => {
						this.pdf = pdf;
					},
					// onReject
					(reason) => {
						this.$emit('document-errored', {
							text: 'Failed to retrieve PDF',
							reason
						});
					}
				);
		}

		@Watch('pdf')
		pdfUpdated(pdf: PDFDocumentProxy, oldPdf: PDFDocumentProxy) {
			if (!pdf) {
				return;
			}

			if (oldPdf) {
				Object.assign(this, this.getDefaults());
			}

			this.$emit('page-count', this.pageCount);
			this.fetchPages();
		}

		getPages(pdf: PDFDocumentProxy, first: number, last: number) {
			const allPages: any = range(first, last).map(number => pdf.getPage(number));

			return Promise.all(allPages);
		}

		fetchPages(currentPage = 0) {
			// Don't try to fetch without pdf
			if (!this.pdf) {
				return;
			}

			// Don't fetch if pages number is 0 or equals to pageCount
			if (this.pageCount > 0 && this.pages.length === this.pageCount) {
				return;
			}

			const startIndex = this.pages.length;

			if (this.cursor > startIndex) {
				return;
			}

			const startPage = startIndex + 1;
			const endPage = Math.min(
				Math.max(currentPage, startIndex + this.BUFFER_LENGTH),
				this.pageCount
			);

			this.cursor = endPage;
			// console.log(`Fetching pages ${startPage} to ${endPage}`);

			this.getPages(this.pdf, startPage, endPage)
				.then((pages) => {
					const deleteCount = 0;
					this.pages.splice(startIndex, deleteCount, ...pages as any);

					return this.pages;
				})
				.catch((response) => {
					this.$emit('document-errored', {
						text: 'Failed to retrieve pages',
						response
					});
				});
		}

		getDefaults() {
			return {
				pages: [],
				cursor: 0
			};
		}

		get pageCount() {
			return this.pdf ? this.pdf.numPages : 0;
		}

		created() {
			this.$on('pages-fetch', this.fetchPages);
		}
	}
</script>
