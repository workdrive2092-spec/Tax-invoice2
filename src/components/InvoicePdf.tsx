import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  item: {
    marginBottom: 5,
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
});

const InvoicePdf = ({ invoiceNumber, invoiceDate, items, company, options }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Invoice</Text>
          <Text>Invoice Number: {invoiceNumber}</Text>
          <Text>Invoice Date: {invoiceDate}</Text>
          <Text>Company: {company.name}</Text>
          <Text>Address: {company.address}</Text>
        </View>
        <View style={styles.table}>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.item}>{item.description}</Text>
              <Text style={styles.item}>${item.amount}</Text>
            </View>
          ))}
        </View>
        <View>
          <Text>Total Amount: ${items.reduce((acc, item) => acc + item.amount, 0)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdf;