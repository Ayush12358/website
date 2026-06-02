const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, 'public', 'resume.html');
  const pdfPath = path.resolve(__dirname, 'public', 'resume_ayush_maurya.pdf');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Use file:// protocol to load the HTML
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      bottom: '0',
      left: '0',
      right: '0'
    },
    preferCSSPageSize: true,
  });

  console.log(`✅ PDF saved to: ${pdfPath}`);
  await browser.close();
})();
