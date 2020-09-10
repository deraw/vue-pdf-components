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
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
	import { PDFPageProxy } from 'pdfjs-dist';

	import ScrollingPage from './ScrollingPage.vue';

	import { scrollDirective } from '../directives/scroll';

	@Component({
		components: {
			ScrollingPage
		},
		directives: {
			pdfScroll: scrollDirective
		}
	})
	export default class ScrollingDocument extends Vue {
		focusedPage = 0;
		scrollTop = 0;
		clientHeight = 0;

		@Prop([Array]) readonly pages!: PDFPageProxy[];
		@Prop({ type: Boolean, default: false }) readonly enablePageJump!: boolean;
		@Prop({ type: Number, default: 1 }) readonly currentPage!: number;
		@Prop({ type: Boolean, default: true }) readonly isParentVisible!: boolean;

		get pagesLength(): number {
			return this.pages.length;
		}

		fetchPages(currentPage: number): void {
			this.$emit('pages-fetch', currentPage);
		}

		onPageJump(scrollTop: number): void {
			this.$emit('page-jump', scrollTop);
		}

		@Watch('isParentVisible')
		updateScrollBounds(): void {
			const { scrollTop, clientHeight } = this.$el;
			this.scrollTop = scrollTop;
			this.clientHeight = clientHeight;
		}

		@Watch('pagesLength')
		pagesLengthUpdated(count: number, oldCount: number): void {
			if (oldCount === 0) {
				this.$emit('pages-reset');
			}

			// Set focusedPage after new pages are mounted
			this.$nextTick(() => {
				this.focusedPage = this.currentPage;
			});
		}

		@Watch('currentPage')
		currentPageUpdated(currentPage: number): void {
			if (currentPage > this.pages.length) {
				this.fetchPages(currentPage);
			} else {
				this.focusedPage = currentPage;
			}
		}
	}
</script>

<style lang="scss">
	.pdf-scrolling-page {
		position: relative;
	}
</style>
