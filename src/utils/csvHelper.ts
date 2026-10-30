import { Order } from '../types';

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    'order_id',
    'order_date',
    'customer_name',
    'phone',
    'address',
    'city',
    'state',
    'pincode',
    'order_value',
    'items_count',
    'customer_type',
    'prior_rto_count',
    'prior_delivered_count',
    'payment_method',
    'delivery_status',
    'rto_reason'
  ];

  const rows = orders.map((o) => {
    return [
      o.order_id,
      o.order_date,
      `"${o.customer_name.replace(/"/g, '""')}"`,
      o.phone,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.city.replace(/"/g, '""')}"`,
      `"${o.state.replace(/"/g, '""')}"`,
      o.pincode,
      o.order_value,
      o.items_count,
      o.customer_type,
      o.prior_rto_count,
      o.prior_delivered_count,
      o.payment_method,
      o.delivery_status,
      `"${(o.rto_reason || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function parseCsvToOrders(csvText: string): Order[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const orders: Order[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex to split comma while honoring quoted strings
    const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Simple robust regex split for CSV lines
    const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
    const values: string[] = [];
    let m;
    while ((m = regex.exec(lines[i])) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      let val = m[1];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      values.push(val.trim());
    }

    if (values.length >= 10) {
      const getVal = (name: string, fallbackIdx: number): string => {
        const idx = headers.indexOf(name);
        return (idx >= 0 && idx < values.length) ? values[idx] : (values[fallbackIdx] || '');
      };

      orders.push({
        order_id: getVal('order_id', 0) || `ORD-${1000 + i}`,
        order_date: getVal('order_date', 1) || new Date().toISOString(),
        customer_name: getVal('customer_name', 2) || 'Customer',
        phone: getVal('phone', 3) || '9876543210',
        address: getVal('address', 4) || 'Main Street',
        city: getVal('city', 5) || 'New Delhi',
        state: getVal('state', 6) || 'Delhi',
        pincode: getVal('pincode', 7) || '110001',
        order_value: parseFloat(getVal('order_value', 8)) || 649,
        items_count: parseInt(getVal('items_count', 9)) || 1,
        customer_type: (getVal('customer_type', 10) === 'repeat' ? 'repeat' : 'first_time'),
        prior_rto_count: parseInt(getVal('prior_rto_count', 11)) || 0,
        prior_delivered_count: parseInt(getVal('prior_delivered_count', 12)) || 0,
        payment_method: 'COD',
        delivery_status: (getVal('delivery_status', 14) === 'RTO' ? 'RTO' : 'Delivered'),
        rto_reason: getVal('rto_reason', 15) || undefined,
      });
    }
  }

  return orders;
}
