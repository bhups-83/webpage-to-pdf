import { PDFDocument } from 'pdf-lib';

class PDFCreator {

    private pdfDoc!:PDFDocument;
    private isReady:boolean = false;
    private pdfBytesMap!:Map<number, Uint8Array>;
    private nextPdfBytesIndex:number = 0;

    async init() {
        this.pdfDoc = await PDFDocument.create();
        this.pdfBytesMap = new Map();
        this.isReady = true;
        this.nextPdfBytesIndex = 0;
    }

    async addPdfBytesAtIndex(pdfBytes:Uint8Array, index:number) {
        this.checkReady();
        this.pdfBytesMap.set(index, pdfBytes);
        while (true) {
            let nextPdfBytes = this.pdfBytesMap.get(this.nextPdfBytesIndex);
            if (nextPdfBytes == undefined) {
                break;
            }
            await this.addPdfBytesToDoc(nextPdfBytes);
            this.pdfBytesMap.delete(this.nextPdfBytesIndex);
            this.nextPdfBytesIndex++;
        }
    }

    async addPdfBytes(pdfBytes: Uint8Array) {
        this.checkReady();
        this.addPdfBytesToDoc(pdfBytes);
    }

    async getPdf() {
        this.checkReady();
        return this.pdfDoc.save();
    }

    private async addPdfBytesToDoc(pdfBytes: Uint8Array) {
        const doc = await PDFDocument.load(pdfBytes);
        for (var i = 0; i < doc.getPageCount(); i++) {
            const [docPage] = await this.pdfDoc.copyPages(doc, [i]);
            this.pdfDoc.addPage(docPage);
        }
    }

    private checkReady() {
        if (!this.isReady) {
            throw new Error("PDF Creator is not initialized yet. Call init() before calling me.");
        }
    }
}

export default PDFCreator;