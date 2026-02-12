import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 24,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    margin: 'auto',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
  },
  tableCol: {
    width: '25%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    textAlign: 'center',
  },
  totalRow: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});

const InvoicePdf = ({ invoiceNumber, invoiceDate, items, company, options }) => {
  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.item.rate * (1 - item.discount);
      const itemGst = (itemTotal * item.item.gstRate) / 100;

      subtotal += itemTotal;
      totalGst += itemGst;
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalGst: totalGst.toFixed(2),
      grandTotal: (subtotal + totalGst).toFixed(2),
    };
  };

  const { subtotal, totalGst, grandTotal } = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Invoice</Text>
          <Text>Invoice Number: {invoiceNumber}</Text>
          <Text>Invoice Date: {invoiceDate}</Text>
        </View>
        <View style={styles.section}>
          <Text>Company: {company.name}</Text>
          <Text>Address: {company.address}</Text>
          <Text>State: {company.state}</Text>
          <Text>GST No: {company.gstNo}</Text>
          <Text>Phone: {company.phone}</Text>
        </View>
        <View style={styles.section}>
          <Text>Items</Text>
          <View style={styles.table}>
            {items.map(item => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.tableCol}>{item.item.name}</Text>
                <Text style={styles.tableCol}>{item.quantity}</Text>
                <Text style={styles.tableCol}>{item.item.rate}</Text>
                <Text style={styles.tableCol}>{item.item.gstRate}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text>Subtotal: ₹{subtotal}</Text>
            <Text>Total GST: ₹{totalGst}</Text>
            <Text>Grand Total: ₹{grandTotal}</Text>
          </View>
          {options.notes && <Text>Notes: {options.notes}</Text>}
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdf;