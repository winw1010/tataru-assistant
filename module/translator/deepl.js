/*Testing*/
const puppeteer = require('puppeteer');
/*
const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];
*/

async function translate(text, languageFrom, languageTo) {
    try {
        const browser = await puppeteer.launch();
        const [page] = await browser.pages();

        await page.goto(`https://www.deepl.com/zh/translator#${languageFrom}/${languageTo}/${text}`, { waitUntil: 'networkidle0' });

        const response = await page.evaluate(() => document.querySelector('#target-dummydiv').innerHTML);
        browser.close();

        console.log('DeepL:', response);
        return response.trim();
    } catch (error) {
        console.log(error);
        return '';
    }
}

exports.translate = translate;