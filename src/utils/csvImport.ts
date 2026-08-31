export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const parseLine = (line: string) => {
    const result = [];
    let insideQuotes = false;
    let currentVal = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentVal += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal);
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] !== undefined ? values[index].trim() : '';
    });
    data.push(obj);
  }

  return data;
}

/**
 * Downloads a ready-to-use Excel/CSV template formatted specifically for product importing.
 */
export function downloadProductExcelTemplate(): void {
  const headers = [
    'Code',
    'Name',
    'Category',
    'Department',
    'Purchase Price',
    'Sale Price',
    'Stock',
    'Opening Stock',
    'Location',
    'UOM',
    'Track Stock',
    'Active',
    'Warranty Details',
    'Variation Options',
    'Description'
  ];

  const sampleRows = [
    [
      'PRD-1001',
      'Wireless Bluetooth Headphones',
      'Electronics',
      'Audio & Sound',
      '3500',
      '5200',
      '50',
      '50',
      'Main Warehouse',
      'Pcs',
      'TRUE',
      'TRUE',
      '1 Year Official Warranty',
      'Black, Silver, Blue',
      'High fidelity noise cancelling wireless headphones'
    ],
    [
      'PRD-1002',
      'Mechanical Gaming Keyboard',
      'Computer Accessories',
      'Hardware',
      '4200',
      '6500',
      '25',
      '25',
      'Main Warehouse',
      'Pcs',
      'TRUE',
      'TRUE',
      '6 Months Replacement',
      'RGB Backlit, Blue Switch, Red Switch',
      'Tactile mechanical switches with customizable RGB lighting'
    ],
    [
      'PRD-1003',
      'Cotton Crew Neck T-Shirt',
      'Apparel',
      'Men Clothing',
      '800',
      '1490',
      '100',
      '100',
      'Store Floor Shelf A2',
      'Pcs',
      'TRUE',
      'TRUE',
      '',
      'Small, Medium, Large, XL',
      '100% Premium Combed Cotton regular fit t-shirt'
    ]
  ];

  // Excel BOM (\uFEFF) ensures UTF-8 accents and characters render properly in Microsoft Excel
  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

  sampleRows.forEach(row => {
    csvContent += row.map(val => `"${val.replace(/"/g, '""')}"`).join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Product_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a ready-to-use Excel/CSV template formatted specifically for contacts (customers & suppliers).
 */
export function downloadContactExcelTemplate(): void {
  const headers = [
    'Name',
    'Business Name',
    'Type',
    'Email',
    'Phone',
    'Status',
    'Opening Balance',
    'Opening Balance Type',
    'Payables',
    'Receivables',
    'Address',
    'City',
    'Province',
    'Post Code',
    'Country',
    'NTN',
    'STRN',
    'Contact Person Name',
    'Contact Person Phone',
    'Notes'
  ];

  const sampleRows = [
    [
      'Ali Khan',
      'Apex Solutions Pvt Ltd',
      'Customer',
      'ali.khan@apexsolutions.pk',
      '+92 300 1234567',
      'Active',
      '50000',
      'Debit',
      '0',
      '50000',
      'Plot 42, Sector 15, Korangi Industrial Area',
      'Karachi',
      'Sindh',
      '74900',
      'Pakistan',
      '1234567-8',
      '0987654321',
      'Ali Khan',
      '+92 300 1234567',
      'Key corporate customer, credit limit 15 days'
    ],
    [
      'Usman Qureshi',
      'National Wholesale Distributing Co.',
      'Supplier',
      'info@nationalwholesale.com',
      '+92 321 9876543',
      'Active',
      '120000',
      'Credit',
      '120000',
      '0',
      'Shop 14, Hall Road Electronic Market',
      'Lahore',
      'Punjab',
      '54000',
      'Pakistan',
      '7654321-0',
      '1122334455',
      'Tariq Mehmood',
      '+92 333 5556677',
      'Primary electronics & accessories vendor'
    ],
    [
      'Zubair Ahmed',
      'Al-Madina Traders',
      'Both',
      'zubair@almadinatraders.com',
      '+92 345 5554321',
      'Active',
      '0',
      'Debit',
      '15000',
      '25000',
      'Commercial Market Block C',
      'Rawalpindi',
      'Punjab',
      '46000',
      'Pakistan',
      '',
      '',
      'Zubair Ahmed',
      '+92 345 5554321',
      'Buys retail packaging, supplies bulk stock'
    ]
  ];

  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

  sampleRows.forEach(row => {
    csvContent += row.map(val => `"${val.replace(/"/g, '""')}"`).join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Contacts_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

