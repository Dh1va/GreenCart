export const invoiceTemplate = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      .header { display:flex; justify-content:space-between; border-bottom:2px solid #22c55e; padding-bottom:10px; }
      .title { font-size:24px; font-weight:bold; color:#16a34a; }
      table { width:100%; border-collapse:collapse; margin-top:20px; }
      th, td { border-bottom:1px solid #ddd; padding:8px; font-size:12px; }
      th { background:#f3f4f6; text-align:left; }
      .meta { font-size:12px; color:#111827; margin-top:6px; }
      .total { margin-top:16px; text-align:right; font-size:16px; font-weight:bold; }
      .section { margin-top:18px; }
      .muted { color:#6b7280; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="title">{{storeName}}</div>
        <div class="meta">
          Support: {{storeEmail}} {{#if supportPhone}} | {{supportPhone}}{{/if}}
        </div>
        {{#if gstNumber}}
          <div class="meta">GST: {{gstNumber}}</div>
        {{/if}}
      </div>

      <div>
        <div><b>Invoice #{{invoiceNumber}}</b></div>
        <div class="muted">Date: {{date}}</div>
        <div class="muted">Order: {{orderId}}</div>
      </div>
    </div>

    <div class="section">
      <h4>Customer</h4>
      <p class="muted">
        {{address.firstName}} {{address.lastName}}<br/>
        {{address.street}}, {{address.city}}<br/>
        {{address.state}} - {{address.zipCode}}<br/>
        Phone: {{address.phone}}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{product.name}}</td>
          <td>{{quantity}}</td>
          <td>{{../currencySymbol}}{{price}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="total">
      Total: {{currencySymbol}}{{pricing.total}}
    </div>

    {{#if invoiceTerms}}
      <div class="section">
        <h4>Terms</h4>
        <p class="muted">{{invoiceTerms}}</p>
      </div>
    {{/if}}

    {{#if returnPolicy}}
      <div class="section">
        <h4>Return Policy</h4>
        <p class="muted">{{returnPolicy}}</p>
      </div>
    {{/if}}
  </body>
</html>
`;

export const labelTemplate = `
<html>
  <head>
    <style>
      body { font-family: monospace; }
      .box { width:4in; height:6in; border:2px solid #000; padding:16px; }
      h1 { font-size:20px; margin:10px 0; }
    </style>
  </head>
  <body>
    <div class="box">
      <b>STANDARD SHIPPING</b><br/><br/>
      <b>Ship To:</b><br/>
      <h1>{{address.firstName}} {{address.lastName}}</h1>
      {{address.street}}<br/>
      {{address.city}}, {{address.state}}<br/>
      PIN: {{address.zipCode}}<br/>
      Phone: {{address.phone}}<br/><br/>
      Qty: {{totalQty}}<br/>
      Order: {{_id}}
    </div>
  </body>
</html>
`;
