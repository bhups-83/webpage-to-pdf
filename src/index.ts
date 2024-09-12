import fs from 'fs';
import { Cluster } from 'puppeteer-cluster';
import PDFCreator from './pdf-creator';
import { PuppeteerLaunchOptions } from 'puppeteer';

interface ITaskData {
    url: string;
    index: number;
    headers: Record<string, string>;
}
export enum Status {
    SUCCESS,
    SESSION_ALREADY_ACTIVE,
    NOT_INITIALIZED,
    CONERSION_IN_PROGRESS
}

interface WebpageToPdfOptions {
    options: PuppeteerLaunchOptions;
    parallelRequests: number;
    shareCookies: boolean;
}

export type WebpageToPdfArgument = Partial<WebpageToPdfOptions>;

const DEFAULT_OPTIONS: WebpageToPdfOptions = {
    parallelRequests: 5,
    shareCookies: false,
    options: {}
}

class WebpageToPdf {

    private isSessionActive: boolean = false;
    private isConversionInProgress = false;
    private cluster!: Cluster<ITaskData>;
    private pdfCreator!: PDFCreator; 
    private numPages: number = 0;

    async init(wtpArguments: WebpageToPdfArgument=DEFAULT_OPTIONS)  {
        let args:WebpageToPdfArgument = {
            ...DEFAULT_OPTIONS,
            ...wtpArguments
        }
        if (this.isSessionActive) {
            return Status.SESSION_ALREADY_ACTIVE;
        }
        // Create and initialize PDFCreator
        this.pdfCreator = new PDFCreator();
        await this.pdfCreator.init();

        //Initialize internal states
        this.numPages = 0;
        this.isConversionInProgress = false;

        // Initialize puppeteer cluster
        this.cluster = await Cluster.launch({
            concurrency: args.shareCookies? Cluster.CONCURRENCY_PAGE : Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: args.parallelRequests,
            puppeteerOptions: args.options
        });

        await this.cluster.task(async({page, data: taskData}) => {
            await page.setExtraHTTPHeaders(taskData.headers);
            await page.goto(taskData.url);
            const pdfBytes = await page.pdf();
            await this.pdfCreator.addPdfBytesAtIndex(pdfBytes, taskData.index);
        });
        this.isSessionActive = true;
        return Status.SUCCESS;
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
        const pdfBytes = await this.pdfCreator.getPdf();
        await fs.promises.writeFile(path, pdfBytes);
        await this.cluster.close();
        // reset the seesion back to inactive
        this.isSessionActive = false;
    }
}

export default WebpageToPdf;
