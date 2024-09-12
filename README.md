# webpage-to-pdf

# how to use
## Mac
```typescript
import WebpageToPdf from 'webpage-to-pdf';

(async () => {
    const wtp = new WebpageToPdf();
    await wtp.init({
        parallelRequests:3,
        shareCookies: true
    });
    wtp.convertPageToPdf('https://www.google.com');
    wtp.convertPageToPdf('https://github.com/bhups-83/webpage-to-pdf/blob/main/README.md',
        {
            'referer': 'https://github.com'
        }
    );
    await wtp.saveAllPagesToPdf("./output.pdf");
})();
```

## Windows
On windows, there is a [bug](https://github.com/puppeteer/puppeteer/issues/12471) with shipped chrome. Current workaround is to pass `--no-sandbox` args to the underlying puppeteer library, which in turn passes it to chrome.
```typescript
import WebpageToPdf from 'webpage-to-pdf';
(async () => {
    const wtp = new WebpageToPdf();
    await wtp.init({
        parallelRequests:1,
        options: {
            headless: true,
            timeout: 0,
            args: ["--no-sandbox"],
    }});
    wtp.convertPageToPdf('https://www.google.com');
    wtp.convertPageToPdf('https://www.google.com');
    await wtp.saveAllPagesToPdf("./output.pdf");
})();
```
