import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
export type Page = PDFPageProxy;

import type { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
export type PDFPageViewport = PageViewport;

export type { PDFDocumentProxy, TextContent } from 'pdfjs-dist/types/src/display/api';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PDFRenderTask {
	_internalRenderTask: any;
	onContinue: any;
	get promise(): Promise<void>;
	cancel(): void;
}
