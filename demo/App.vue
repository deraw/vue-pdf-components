<template>
	<main class="main">
		<PDFViewer
			url="/pdf/demo3.pdf"
			:is-preview-enabled="true"
		/>
	</main>
</template>

<script lang="ts">
	import { Component, Vue } from 'vue-property-decorator';

	@Component
	export default class App extends Vue {}
</script>

<style lang="scss">
	* {
		$transparent: rgba(0, 0, 0, 0);

		max-width: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		// scroll-behavior: smooth; // Smooth scrolling when page jump
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

	// PDF Document
	// When preview is enabled, let 15% space on the left
	.pdf-document.preview-enabled {
		width: 85%;
		left: 15%;
	}

	.pdf-document,
	.pdf-preview {
		// Default backgroung
		background: #525659;

		.pdf-scrolling-page + .pdf-scrolling-page {
			margin-top: 1em;
		}
	}

	// PDF Preview
	.pdf-preview {
		display: block;

		// Align to left
		right: 85%;
		// With a width of 85%
		width: 15%;

		// Inner top & bottom spacing
		padding: 1em 0;
	}

	// PDF Thumbnail
	.pdf-thumbnail {
		// Scpacing between thumbnails
		+ .pdf-thumbnail {
			margin-top: 1em;
		}

		// Witdh of final img & placeholder
		img,
		.pdf-placeholder {
			width: 85%;
			// Default border to avoid moving image
			border: 5px solid transparent;
		}

		&.focused img {
			// Only change color on focus
			border-color: #01579b;
		}
	}

	.pdf-page-number {
		color: #fff;
	}

	// .pdf-page {
	// 	box-shadow:
	// 		0 5px 15px 0 rgba(0, 0, 0, .11),
	// 		0 5px 15px 0 rgba(0, 0, 0, .08);
	// }

	@media print {
		body {
			background: transparent;
		}

		.main {
			margin: 0;
			padding: 0;
		}
	}
</style>
