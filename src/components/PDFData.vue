<template>
	<div>
		<slot
			name="document"
			v-bind="{ pages }"
		/>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFLoadingTask, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

	import range from '../utils/range';

	@Component
	export default class PDFData extends Vue {
		pdf: PDFDocumentProxy | null = null;
		pages: PDFPageProxy[] = [];
		cursor = 0;

		readonly BUFFER_LENGTH = 10;

		@Prop(String) readonly url!: string;

		@Watch('url', { immediate: true })
		urlUpdated(url : string) {
			this.getDocument(url)
				.then((pdf) => {
					this.pdf = pdf as unknown as PDFDocumentProxy;
				})
				.catch(response => {
					this.$emit('document:errored', {
						text: 'Failed to retrieve PDF',
						response
					});
				});
		}

		@Watch('pdf')
		pdfUpdated(pdf: any, oldPdf: any) {
			if (!pdf) {
				return;
			}

			// if (oldPdf) {
			// 	Object.assign(this, this.getDefaults());
			// }

			this.$emit('page-count', this.pageCount);
			this.fetchPages();
		}

		getDocument(url: string) {
			// Using import statement in this way allows Webpack
			// to treat pdf.js as an async dependency so we can
			// avoid adding it to one of the main bundles
			return import(
				/* webpackChunkName: 'pdfjs-dist' */
				'pdfjs-dist'
			)
			.then((pdfjs) => pdfjs.getDocument(url));
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

		onPageRendered({ text, page }: any) {
			// console.log(text, page);
		}

		onPageErrored({ text, response, page }: any) {
			// console.log('Error!', text, response, page);
		}

		get pageCount() {
			return this.pdf ? this.pdf.numPages : 0;
		}

		created() {
			this.$on('page-rendered', this.onPageRendered);
			this.$on('page-errored', this.onPageErrored);
			this.$on('pages-fetch', this.fetchPages);
		}
	}
</script>
