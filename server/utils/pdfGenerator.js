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

    // warm-up
    const warmup = await browserInstance.newPage();
    await warmup.goto("about:blank");
    await warmup.close();
  }
  return browserInstance;
};

export const generatePDF = async (templateHtml, data, options = {}) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const template = handlebars.compile(templateHtml);
  const html = template(data);

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    ...options,
  });

  await page.close();
  return pdf;
};
