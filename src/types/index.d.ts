import { PDFPageProxy } from 'pdfjs-dist';

export interface Page extends PDFPageProxy {
	_destroy(): void;
}
