# webpage-to-pdf

# how to use
```typescript
import WebpageToPdf from 'webpage-to-pdf';

(async () => {
    const wtp = new WebpageToPdf();
    await wtp.init();
    wtp.convertPageToPdf('https://www.google.com');
    wtp.convertPageToPdf('https://github.com/bhups-83/webpage-to-pdf/blob/main/README.md',
        {
            'referer': 'https://github.com'
        }
    );
    await wtp.saveAllPagesToPdf("./output.pdf");
})();
```
