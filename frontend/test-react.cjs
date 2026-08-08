const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Puppeteer test...");
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });
    
    // Capture page errors
    page.on('pageerror', err => {
      console.error('BROWSER ERROR:', err.message);
    });

    console.log("Navigating to http://localhost:5173 ...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log("Page loaded. Taking screenshot and dumping DOM...");
    await page.screenshot({ path: 'screenshot.png' });
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log("BODY HTML:", bodyHTML.substring(0, 500));
    
    await browser.close();
    console.log("Puppeteer test finished.");
  } catch (error) {
    console.error("Test failed:", error);
  }
})();
