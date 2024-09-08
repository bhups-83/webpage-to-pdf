import fs from 'fs';
import { Cluster } from 'puppeteer-cluster';
import PDFCreator from './pdf-creator';

interface ITaskData {
    url: string;
    index: number;
    headers: Record<string, string>;
}
export enum Status {
    SUCCESS,
    NOT_INITIALIZED,
    CONERSION_IN_PROGRESS
}
class WebpageToPdf {

    private isSessionActive: boolean = false;
    private isConversionInProgress = false;
    private cluster!: Cluster<ITaskData>;
    private pdfCreator: PDFCreator = new PDFCreator();
    private pagesPdfArray: Uint8Array[] = [];
    private numPages: number = 0;

    async init(parallelRequests: number = 5) {
        await this.pdfCreator.init();

        this.cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: parallelRequests,
        });

        await this.cluster.task(async({page, data: taskData}) => {
            await page.setExtraHTTPHeaders(taskData.headers);
            await page.goto(taskData.url);
            const pdfBytes = await page.pdf();
            this.pagesPdfArray[taskData.index] = pdfBytes;
        });
        this.isSessionActive = true;
    }

    convertPageToPdf(url: string, headers: Record<string, string> = {}): Status {
        if (!this.isSessionActive) {
            return Status.NOT_INITIALIZED;
        }
        if (this.isConversionInProgress) {
            return Status.CONERSION_IN_PROGRESS;
        }
        this.cluster.queue({
            url: url,
            index: this.numPages++,
            headers: headers

        });
        return Status.SUCCESS;
    }

    async saveAllPagesToPdf(path: string) {
        await this.cluster.idle();
        for (var pdfPageBytes of this.pagesPdfArray) {
            await this.pdfCreator.addPdfBytes(pdfPageBytes);
        }
        const pdfBytes = await this.pdfCreator.getPdf();
        await fs.promises.writeFile(path, pdfBytes);
        await this.cluster.close();
    }
}

export default WebpageToPdf;
