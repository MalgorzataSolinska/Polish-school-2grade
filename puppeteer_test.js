import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // wait 2s for React to render
  
  const content = await page.content();
  if (content.includes('Brak nowych ogłoszeń')) {
      console.log('App loaded successfully.');
  } else {
      console.log('App did not load as expected. Body length:', content.length);
      console.log(content.substring(0, 1000));
  }

  await browser.close();
})();
