/* ==========================================================================
   INVOICE TEMPLATE (A4)
   - Integrated Settings: Store Name, Phone, Email, GST, Terms, Policy
   ========================================================================== */
export const invoiceTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: 'Helvetica', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333; padding: 40px; }
      
      .header-section { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
      .store-info h1 { margin: 0; color: #1a1a1a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
      .store-meta { font-size: 12px; color: #666; margin-top: 5px; }
      
      .invoice-info { text-align: right; }
      .invoice-title { font-size: 18px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
      .invoice-meta { font-size: 13px; color: #555; }

      .addresses-section { display: flex; margin-bottom: 40px; gap: 40px; }
      .addr-box { flex: 1; }
      .addr-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 0.5px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
      .addr-content { font-size: 14px; font-weight: 500; line-height: 1.4; }
      .addr-content p { margin: 0; }

      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th { background: #f9fafb; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; color: #555; font-weight: bold; border-bottom: 1px solid #e5e7eb; }
      td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      .col-right { text-align: right; }
      .col-center { text-align: center; }

      .summary-section { display: flex; justify-content: flex-end; }
      .summary-table { width: 300px; }
      .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
      .summary-row.total { border-top: 2px solid #333; margin-top: 8px; padding-top: 8px; font-weight: bold; font-size: 16px; color: #000; }

      .footer { margin-top: 60px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
      .footer h4 { margin: 0 0 4px 0; font-size: 12px; color: #333; }
      .footer p { margin: 0 0 10px 0; }
    </style>
  </head>
  <body>
    <div class="header-section">
      <div class="store-info">
        <h1>{{storeName}}</h1>
        <div class="store-meta">
          {{storeEmail}} {{#if supportPhone}} • {{supportPhone}}{{/if}}<br/>
          {{#if gstNumber}}GSTIN: <strong>{{gstNumber}}</strong>{{/if}}
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta">#{{invoiceNumber}}</div>
        <div class="invoice-meta">{{date}}</div>
      </div>
    </div>

    <div class="addresses-section">
      <div class="addr-box">
        <div class="addr-title">Bill To</div>
        <div class="addr-content">
          <p><strong>{{address.firstName}} {{address.lastName}}</strong></p>
          <p>{{address.street}}</p>
          <p>{{address.city}}, {{address.state}} - {{address.zipCode}}</p>
          <p>{{address.country}}</p>
          <p>Ph: {{address.phone}}</p>
        </div>
      </div>
      <div class="addr-box">
        <div class="addr-title">Order Details</div>
        <div class="addr-content">
          <p>Order ID: <strong>{{orderId}}</strong></p>
          <p>Payment: {{payment.method}} ({{payment.status}})</p>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%">Item</th>
          <th class="col-center">Qty</th>
          <th class="col-right">Price</th>
          <th class="col-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>
            <div style="font-weight: 500; color: #000;">{{product.name}}</div>
            <div style="font-size: 11px; color: #777;">SKU: {{_id}}</div>
          </td>
          <td class="col-center">{{quantity}}</td>
          <td class="col-right">{{../currencySymbol}}{{price}}</td>
          <td class="col-right">{{../currencySymbol}}{{price}}</td> </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row"><span>Subtotal</span> <span>{{currencySymbol}}{{pricing.subtotal}}</span></div>
        <div class="summary-row"><span>Tax</span> <span>{{currencySymbol}}{{pricing.tax}}</span></div>
        <div class="summary-row"><span>Shipping</span> <span>{{currencySymbol}}{{pricing.deliveryFee}}</span></div>
        {{#if pricing.discount}}
        <div class="summary-row" style="color: #16a34a;"><span>Discount</span> <span>-{{currencySymbol}}{{pricing.discount}}</span></div>
        {{/if}}
        <div class="summary-row total"><span>Total</span> <span>{{currencySymbol}}{{pricing.total}}</span></div>
      </div>
    </div>

    <div class="footer">
      {{#if invoiceTerms}}
        <h4>Terms & Conditions</h4>
        <p>{{invoiceTerms}}</p>
      {{/if}}
      
      {{#if returnPolicy}}
        <h4>Return Policy</h4>
        <p>{{returnPolicy}}</p>
      {{/if}}
      <p style="margin-top: 20px;">Thank you for your business!</p>
    </div>
  </body>
</html>
`;

/* ==========================================================================
   SHIPPING LABEL TEMPLATE (A6)
   - Professional "Logistics" Style
   - Dynamic Barcode (Code 128)
   - Clear Address Zones
   ========================================================================== */
export const labelTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    
    @page { 
      size: A6; 
      margin: 0; 
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Inter', sans-serif; 
      background-color: #fff;
      width: 100vw;
      height: 100vh;
    }

    .container {
      width: 100%;
      height: 99.5vh; /* Prevent overflow page break */
      box-sizing: border-box;
      border: 4px solid #000;
      display: flex;
      flex-direction: column;
    }

    /* HEADER: Service Level */
    .header {
      background: #000;
      color: #fff;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
    }
    
    .service-type {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .weight {
      font-size: 14px;
      font-weight: 600;
      border: 1px solid #fff;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* RETURN ADDRESS */
    .from-section {
      padding: 8px 12px;
      border-bottom: 2px solid #000;
      font-size: 10px;
      color: #444;
    }
    .from-label { font-weight: 800; text-transform: uppercase; margin-right: 4px; color: #000; }

    /* SHIP TO (Main Focus) */
    .to-section {
      flex: 1;
      padding: 15px 12px;
      display: flex;
      flex-direction: column;
    }

    .to-label {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #000;
      margin-bottom: 8px;
      display: block;
      border-bottom: 1px solid #eee;
      width: fit-content;
    }

    .recipient-name {
      font-size: 22px;
      font-weight: 800;
      text-transform: uppercase;
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .recipient-address {
      font-size: 16px;
      line-height: 1.4;
      font-weight: 500;
      color: #111;
    }

    .recipient-phone {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 600;
    }

    /* BARCODE SECTION */
    .barcode-section {
      border-top: 4px solid #000;
      padding: 15px 0;
      text-align: center;
    }

    .barcode-img {
      height: 60px;
      max-width: 90%;
      display: block;
      margin: 0 auto;
    }
    
    .order-ref {
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
      display: block;
    }

    /* FOOTER METADATA */
    .footer {
      display: flex;
      border-top: 2px solid #000;
    }

    .footer-box {
      flex: 1;
      padding: 8px 12px;
      border-right: 2px solid #000;
    }
    .footer-box:last-child { border-right: none; }

    .meta-key { font-size: 9px; text-transform: uppercase; font-weight: 800; color: #666; display: block; }
    .meta-val { font-size: 13px; font-weight: bold; color: #000; }

  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <div class="service-type">STANDARD</div>
      <div class="weight">Qty: {{totalQty}}</div>
    </div>

    <div class="from-section">
      <span class="from-label">FROM:</span> {{storeName}} | {{supportPhone}} <br/>
      {{#if gstNumber}}GST: {{gstNumber}}{{/if}}
    </div>

    <div class="to-section">
      <span class="to-label">SHIP TO:</span>
      <div class="recipient-name">{{address.firstName}} {{address.lastName}}</div>
      <div class="recipient-address">
        {{address.street}}<br/>
        {{address.city}}, {{address.state}}<br/>
        <strong>{{address.zipCode}}</strong> - {{address.country}}
      </div>
      <div class="recipient-phone">PH: {{address.phone}}</div>
    </div>

    <div class="barcode-section">
      <img class="barcode-img" src="https://bwipjs-api.metafloor.com/?bcid=code128&text={{_id}}&scale=2&height=12&includetext" alt="Barcode" />
    </div>

    <div class="footer">
      <div class="footer-box">
        <span class="meta-key">Order Date</span>
        <span class="meta-val">{{date}}</span>
      </div>
      <div class="footer-box">
        <span class="meta-key">Payment</span>
        <span class="meta-val">{{paymentMethod}}</span>
      </div>
    </div>

  </div>
</body>
</html>
`;