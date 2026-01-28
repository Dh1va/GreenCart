export const orderPlacedEmailTemplate = ({ storeName, orderId, total, supportEmail }) => {
  return `
    <div style="font-family:Arial,sans-serif">
      <h2>Order Placed Successfully</h2>
      <p>Thanks for your order with <b>${storeName}</b>.</p>
      <p><b>Order ID:</b> ${orderId}</p>
      <p><b>Total:</b> ₹${total}</p>
      <p>Support: ${supportEmail || "-"}</p>
    </div>
  `;
};
