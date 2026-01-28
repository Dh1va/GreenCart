import puppeteer from "puppeteer";
import handlebars from "handlebars";

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }
  return browserInstance;
};

export const generatePDF = async (templateHtml, data, options = {}) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // 1. Enable Images (Required for Barcodes/Logos)
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    // Block media/font for speed, but ALLOW images
    if (["media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const template = handlebars.compile(templateHtml);
  const html = template(data);

  // Wait for network idle to ensure barcode images load
  await page.setContent(html, { waitUntil: "networkidle0" });

  // 2. Logic to handle A4 vs A6 vs Custom Sizes
  const pdfConfig = {
    format: "A4", // Default fallback (Invoice)
    printBackground: true,
    ...options,   // Overrides (e.g., format: "A6")
  };

  // Critical: If custom width/height is explicitly passed, delete 'format'
  // because Puppeteer ignores custom dimensions if 'format' exists.
  if (options.width || options.height) {
    delete pdfConfig.format;
  }

  const pdf = await page.pdf(pdfConfig);

  await page.close();
  return pdf;
};