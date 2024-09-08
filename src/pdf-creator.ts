import { PDFDocument } from 'pdf-lib';

class PDFCreator {

    private pdfDoc!:PDFDocument;
    private isReady:boolean = false;

    async init() {
        this.pdfDoc = await PDFDocument.create();
        this.isReady = true;
    }

    async addPdfBytes(pdfBytes: Uint8Array) {
        if (!this.isReady) {
            throw new Error("PDF Creator is not initialized yet. Call init() before calling me.");
        }
        const doc = await PDFDocument.load(pdfBytes);
        for (var i = 0; i < doc.getPageCount(); i++) {
            const [docPage] = await this.pdfDoc.copyPages(doc, [i]);
            this.pdfDoc.addPage(docPage);
        }
    }

    async getPdf() {
        if (!this.isReady) {
            throw new Error("PDF Creator is not initialized yet. Call init() before calling me.");
        }
        return this.pdfDoc.save();
    }
}

export default PDFCreator;