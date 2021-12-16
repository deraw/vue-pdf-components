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
	import Vue from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import * as pdfjs from 'pdfjs-dist';

	import { Page, PDFDocumentProxy } from '@/types';

	import range from '../utils/range';

	// @see https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
	pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

	const Props = Vue.extend({
		props: {
			url: {
				type: String,
				required: true
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component<PDFData>({
		watch: {
			url: {
				handler(url: string) {
					this.urlUpdated(url);
				},
				immediate: true
			},
			pdf(pdf: PDFDocumentProxy, oldPdf: PDFDocumentProxy) {
				if (!pdf) {
					return;
				}

				if (oldPdf) {
					this.pages = [];
					this.cursor = 0;
				}

				this.$emit('page-count', this.pageCount);
				this.fetchPages();
			}
		}
	})
	export default class PDFData extends MixinsDeclaration {
		pdf: PDFDocumentProxy | null = null;
		pages: Page[] = [];
		cursor = 0;

		readonly BUFFER_LENGTH = 10;

		urlUpdated(url: string): void {
			pdfjs
				.getDocument(url)
				.promise
				.then(
					// onReslove
					(pdf) => this.pdf = pdf,
					// onReject
					(reason) => {
						this.$emit('document-errored', {
							text: 'Failed to retrieve PDF',
							reason
						});
					}
				);
		}

		getPages(pdf: PDFDocumentProxy, first: number, last: number): Promise<Page[]> {
			const allPages = range(first, last).map(number => pdf.getPage(number)) as unknown as Promise<Page>[];

			return Promise.all(allPages);
		}

		fetchPages(currentPage = 0): void {
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

			this.getPages(this.pdf, startPage, endPage)
				.then((pages) => {
					const deleteCount = 0;
					this.pages.splice(startIndex, deleteCount, ...pages as Page[]);

					return this.pages;
				})
				.catch((response) => {
					this.$emit('document-errored', {
						text: 'Failed to retrieve pages',
						response
					});
				});
		}

		get pageCount(): number {
			return this.pdf ? this.pdf.numPages : 0;
		}

		created() {
			this.$on('pages-fetch', this.fetchPages);
		}
	}
</script>
