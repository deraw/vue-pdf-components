<template>
	<div
		v-pdf-scroll.immediate="updateScrollBounds"
		class="pdf-scrolling-document"
	>
		<ScrollingPage
			v-for="page in pages"
			:key="page.pageNumber"
			v-slot="{
				isPageFocused,
				isElementFocused
			}"
			v-bind="{
				page,
				clientHeight,
				scrollTop,
				focusedPage,
				enablePageJump
			}"
			class="pdf-scrolling-page"
			@page-jump="onPageJump"
		>
			<slot
				v-bind="{
					page,
					isPageFocused,
					isElementFocused
				}"
			/>
		</ScrollingPage>

		<div
			v-observe-visibility="fetchPages"
			class="pdf-observer"
		/>
	</div>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import { PDFPageProxy } from 'pdfjs-dist';

	import ScrollingPage from './ScrollingPage.vue';

	import { scrollDirective } from '../directives/scroll';

	const Props = Vue.extend({
		props: {
			pages: {
				type: Array as PropType<PDFPageProxy[]>,
				required: true
			},
			enablePageJump: {
				type: Boolean,
				default: false
			},
			isPreviewEnabled: {
				type: Boolean,
				default: false
			},
			currentPage: {
				type: Number,
				default: 1
			},
			isParentVisible: {
				type: Boolean,
				default: true
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component<ScrollingDocument>({
		components: {
			ScrollingPage
		},
		directives: {
			pdfScroll: scrollDirective
		},
		watch: {
			isParentVisible(): void {
				const { scrollTop, clientHeight } = this.$el;

				this.scrollTop = scrollTop;
				this.clientHeight = clientHeight;
			},
			pagesLength(count: number, oldCount: number): void {
				if (oldCount === 0) {
					this.$emit('pages-reset');
				}

				// Set focusedPage after new pages are mounted
				this.$nextTick(() => {
					this.focusedPage = this.currentPage;
				});
			},
			currentPage(currentPage: number): void {
				if (currentPage > this.pages.length) {
					this.fetchPages(currentPage);
				} else {
					this.focusedPage = currentPage;
				}
			}
		}
	})
	export default class ScrollingDocument extends MixinsDeclaration {
		focusedPage = 0;
		scrollTop = 0;
		clientHeight = 0;

		get pagesLength(): number {
			return this.pages.length;
		}

		fetchPages(currentPage: number): void {
			this.$emit('pages-fetch', currentPage);
		}

		onPageJump(scrollTop: number): void {
			this.$emit('page-jump', scrollTop);
		}
	}
</script>

<style lang="scss">
	.pdf-scrolling-page {
		position: relative;
	}
</style>
