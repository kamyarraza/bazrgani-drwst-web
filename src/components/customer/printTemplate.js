export const printTemplate = ({ customer, isRTL, t, currentDate, formatDate, formatCurrency }) => `
<!DOCTYPE html>
<html>
<head>
  <title>${t('customer.print.documentTitle')} - ${customer.fname} ${customer.sname}</title>
  <style>
    * {
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }

    body {
      font-family: 'Segoe UI', 'Tahoma', sans-serif !important;
      line-height: 1.6 !important;
      color: #444 !important;
      max-width: 900px !important;
      margin: 0 auto !important;
      padding: 24px !important;
      background: #fff !important;
    }

    .header {
      text-align: center !important;
      margin-bottom: 28px !important;
      padding-bottom: 18px !important;
      border-bottom: 2px dashed #90caf9 !important;
    }

    .company-name {
      font-size: 26px !important;
      font-weight: 700 !important;
      color: #1565c0 !important;
      margin-bottom: 4px !important;
    }

    .document-title {
      font-size: 18px !important;
      font-weight: 500 !important;
      color: #666 !important;
      margin-bottom: 6px !important;
    }

    .print-date {
      font-size: 13px !important;
      color: #888 !important;
    }

    .section-title {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1976d2 !important !important;
      margin: 22px 0 14px 0 !important;
      border-left: 4px solid #90caf9 !important;
      padding-left: 10px !important;
    }

    .info-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
      gap: 14px !important;
      margin-bottom: 20px !important;
    }

    .info-item {
      background: #fefefe !important;
      border-radius: 10px !important;
      padding: 14px !important;
      border: 1px solid #e0e0e0 !important;
    }

    .info-label {
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #999 !important;
      margin-bottom: 4px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.4px !important;
    }

    .info-value {
      font-size: 15px !important;
      font-weight: 500 !important;
      color: #333 !important;
    }

    .info-value.highlight {
      color: #1976d2 !important;
      font-weight: 700 !important;
    }

    .credit-section {
      background: #fafafa !important;
      padding: 18px !important;
      border-radius: 12px !important;
      margin-bottom: 24px !important;
      border: 1px solid #e0e0e0 !important;
    }

    .credit-card {
      background: ${customer.type === 'supplier' 
        ? 'linear-gradient(135deg, #f48fb1, #ec407a)' 
        : 'linear-gradient(135deg, #64b5f6, #1e88e5)'};
      color: white;
      padding: 18px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .credit-amount {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .credit-label {
      font-size: 13px;
      opacity: 0.95;
    }

    .credit-description {
      text-align: center;
      font-style: italic;
      color: #666;
      font-size: 13px;
      margin-top: 4px;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999;
      /* Highest z-index to appear over everything */
      opacity: 0.08;
      /* Slightly increased opacity to show brand colors better */
      pointer-events: none;

      img {
        width: 500px;
        /* Slightly smaller for better proportions */
        height: 500px;
        object-fit: contain;
        /* Removed grayscale filter to show brand colors */
      }
    }

    .footer {
      margin-top: 32px;
      text-align: center;
      border-top: 1px dashed #ddd;
      padding-top: 18px;
      color: #888;
      font-size: 11px;
    }

    .footer-2 {
      text-align: center;
      margin-top: 12px;
      font-size: 11px;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
    }

  </style>
</head>
<body dir="${isRTL.value ? 'rtl' : 'ltr'}">
    <div class="watermark">
      <img src="./brand.jpg" alt="Brand Watermark" />
    </div>

    <img src="./vector-2.png" width="100px" style="position: absolute; top: 0; right: 0; transform: scale(-1);">
    <img src="./vector-2.png" width="100px" style="position: absolute; top: 0; left: 0; transform: scaleY(-1);">
    <img src="./vector-2.png" width="100px" style="position: absolute; bottom: 0; right: 0; transform: scaleX(-1);">
    <img src="./vector-2.png" width="100px" style="position: absolute; bottom: 0; left: 0;">

    <br><br><br>

    <!-- Logo at the top -->
    <div style="text-align: center;"><img src="./brand.jpg" width="100px"></div>

    <br><br>

  <div class="header">
    <div class="company-name">${t('customer.print.companyName')}</div>
    <div class="document-title">${t('customer.print.documentTitle')}</div>
    <!-- <div class="print-date">${t('customer.print.generatedOn')} ${currentDate}</div> -->
  </div>

  <div class="customer-info">
    <div class="section-title">${t('customer.print.basicInformationTitle')}</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">${t('customer.print.customerId')}</div>
        <div class="info-value highlight">#${customer.id}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t('customer.print.customerType')}</div>
        <div class="info-value">${customer.type_value === 'customer' ? t('customer.customer') : t('customer.supplier')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t('customer.print.fullName')}</div>
        <div class="info-value">${customer.fname} ${customer.sname}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t('customer.print.phoneNumber')}</div>
        <div class="info-value">${customer.fphone}</div>
      </div>
      ${customer.sphone ? `
      <div class="info-item">
        <div class="info-label">${t('customer.secondPhone')}</div>
        <div class="info-value">${customer.sphone}</div>
      </div>` : ''}
      ${customer.place ? `
      <div class="info-item">
        <div class="info-label">${t('customer.print.place')}</div>
        <div class="info-value">${customer.place}</div>
      </div>` : ''}
      ${customer.location?.name ? `
      <div class="info-item">
        <div class="info-label">${t('customer.print.location')}</div>
        <div class="info-value">${customer.location.name}</div>
      </div>` : ''}
      <div class="info-item">
        <div class="info-label">${t('customer.print.createdDate')}</div>
        <div class="info-value">${formatDate(customer.created_at)}</div>
      </div>
      ${customer.hasAccount !== undefined ? `
      <div class="info-item">
        <div class="info-label">${t('customer.accountStatus')}</div>
        <div class="info-value">${customer.hasAccount ? t('customer.hasAccount') : t('customer.noAccount')}</div>
      </div>` : ''}
      ${customer.note ? `
      <div class="info-item">
        <div class="info-label">${t('customer.note')}</div>
        <div class="info-value" style="font-style: italic; padding: 6px; border-radius: 6px; background: #fafafa;">${customer.note}</div>
      </div>` : ''}
    </div>
  </div>

  ${(customer.type === 'supplier' && customer.sell_borrow !== undefined) ||
  (customer.type === 'customer' && customer.purchase_borrow !== undefined) ? `
  <div class="credit-section">
    <div class="section-title">${t('customer.print.creditInformationTitle')}</div>
    ${customer.type === 'supplier' && customer.sell_borrow !== undefined ? `
    <div class="credit-card">
      <div class="credit-amount">${formatCurrency(customer.sell_borrow)}</div>
      <div class="credit-label">${t('customer.print.weOweSupplier')}</div>
    </div>
    <div class="credit-description">${t('customer.print.supplierDebtDescription')}</div>
    ` : ''}
    ${customer.type === 'customer' && customer.purchase_borrow !== undefined ? `
    <div class="credit-card">
      <div class="credit-amount">${formatCurrency(customer.purchase_borrow)}</div>
      <div class="credit-label">${t('customer.print.customerOwesUs')}</div>
    </div>
    <div class="credit-description">${t('customer.print.customerDebtDescription')}</div>
    ` : ''}
  </div>` : ''}

  <div class="footer">
    <p>${t('customer.print.footerNote')}</p>
    <p>${t('customer.print.contactNote')}</p>
  </div>

  <div class="footer-2">
      <small>${t('customer.print.companyName')}</small>
      <b>|</b>
      <small>${t('invoice.footer.copyright')}</small>
  </div>
</body>
</html>
`;
