<template>
	<main class="main">
		<PDFViewer />
	</main>
</template>

<script lang="ts">
	import { Component, Vue } from 'vue-property-decorator';

	@Component
	export default class App extends Vue { }
</script>

<style lang="scss">
	* {
		$transparent: rgba(0, 0, 0, 0);

		max-width: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		scroll-behavior: smooth;
		font-family: 'Roboto', sans-serif;
		box-sizing: border-box;
		word-break: break-word;
		hyphens: auto;
		-moz-osx-font-smoothing: grayscale;
		-webkit-tap-highlight-color: $transparent;
	}

	html,
	body {
		// Font size defined by the browser
		font-size: 100%;
	}

	body {
		overflow: hidden;
	}

	.pdf-viewer__preview {
		display: block;
		width: 15%;
		right: 85%;
	}

	.main .pdf-document.preview-enabled {
		width: 85%;
		left: 15%;
	}
</style>
