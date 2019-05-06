<template>
	<div
		v-pdf-scroll.immediate="updateScrollBounds"
		class="scrolling-document"
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
			class="scrolling-page"
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
			v-pdf-visible="fetchPages"
			class="observer"
		/>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

	import ScrollingPage from './ScrollingPage.vue';

	@Component({
		components: {
			ScrollingPage
		}
	})
	export default class ScrollingDocument extends Vue {
		focusedPage = 0;
		scrollTop = 0;
		clientHeight = 0;

		@Prop([Object, Array]) readonly pages!: any;
		@Prop({ type: Boolean, default: false }) readonly enablePageJump!: boolean;
		@Prop({ type: Number, default: 1 }) readonly currentPage!: number;
		@Prop({ type: Boolean, default: true }) readonly isParentVisible!: boolean;

		get pagesLength() {
			return this.pages.length;
		}

		fetchPages(currentPage: number) {
			this.$emit('pages-fetch', currentPage);
		}
		onPageJump(scrollTop: number) {
			this.$emit('page-jump', scrollTop);
		}

		@Watch('isParentVisible')
		updateScrollBounds() {
			const { scrollTop, clientHeight } = this.$el;
			this.scrollTop = scrollTop;
			this.clientHeight = clientHeight;
		}

		@Watch('pagesLength')
		pagesLengthUpdated(count: number, oldCount: number) {
			if (oldCount === 0) {
				this.$emit('pages-reset');
			}

			// Set focusedPage after new pages are mounted
			this.$nextTick(() => {
				this.focusedPage = this.currentPage;
			});
		}

		@Watch('currentPage')
		currentPageUpdated(currentPage: number) {
			if (currentPage > this.pages.length) {
				this.fetchPages(currentPage);
			} else {
				this.focusedPage = currentPage;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.scrolling-page {
		position: relative;
	}
</style>
