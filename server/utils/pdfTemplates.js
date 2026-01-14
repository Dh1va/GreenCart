export const invoiceTemplate = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      .header { display:flex; justify-content:space-between; border-bottom:2px solid #22c55e; padding-bottom:10px; }
      .title { font-size:24px; font-weight:bold; color:#16a34a; }
      table { width:100%; border-collapse:collapse; margin-top:30px; }
      th, td { border-bottom:1px solid #ddd; padding:8px; font-size:12px; }
      th { background:#f3f4f6; text-align:left; }
      .total { margin-top:20px; text-align:right; font-size:16px; font-weight:bold; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">GREEN CART</div>
      <div>
        <div><b>Invoice #{{orderId}}</b></div>
        <div>Date: {{date}}</div>
      </div>
    </div>

    <h4>Customer</h4>
    <p>
      {{address.firstName}} {{address.lastName}}<br/>
      {{address.street}}, {{address.city}}<br/>
      {{address.state}} - {{address.zipCode}}<br/>
      Phone: {{address.phone}}
    </p>

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
          <td>₹{{price}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="total">
      Total: ₹{{pricing.total}}
    </div>
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
