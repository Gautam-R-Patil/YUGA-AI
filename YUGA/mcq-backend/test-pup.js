import puppeteer from 'puppeteer';
console.log('Puppeteer imported');
try {
    const browser = await puppeteer.launch({ headless: 'new' });
    console.log('Browser launched');
    await browser.close();
    console.log('Browser closed');
} catch (e) {
    console.error('Puppeteer error:', e);
}
