import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { numberToWords } from '../lib/utils';

interface InvoiceItem {
  slNo: number;
  description: string;
  hsnSac: string;
  quantity: string;
  rate: number;
  unit: string;
  amount: number;
  per?: string;
  gstRate?: number;
}

interface CompanyDetails {
  name: string;
  address: string[];
  gstin: string;
  pan?: string;
  state: string;
  stateCode: string;
  contact: string[];
  email: string;
  website: string;
  logo?: string;
}

interface BuyerDetails {
  name: string;
  address: string[];
  gstin: string;
  pan: string;
  state: string;
  stateCode: string;
  placeOfSupply: string;
}

interface InvoiceDetails {
  invoiceNo: string;
  invoiceDate: string;
  eWayBillNo?: string;
  deliveryNote?: string;
  referenceNoAndDate?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  billOfLadingNo?: string;
  motorVehicleNo?: string;
  termsOfDelivery?: string;
  modeOfPayment: string;
  otherReferences?: string;
}

interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  branchAndIFSC: string;
  swiftCode?: string;
}

interface InvoicePdfProps {
  company: CompanyDetails;
  buyer: BuyerDetails;
  invoiceDetails: InvoiceDetails;
  items: InvoiceItem[];
  igstRate: number;
  previousBalance?: number;
  bankDetails: BankDetails;
  qrCode?: string;
  notes?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  container: {
    border: '1px solid #000',
  },
  titleRow: {
    borderBottom: '1px solid #000',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  originalText: {
    position: 'absolute',
    right: 5,
    top: 2,
    fontSize: 7,
    fontStyle: 'italic',
  },
  mainHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
  },
  companyInfo: {
    width: '50%',
    padding: 5,
    borderRight: '1px solid #000',
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  invoiceInfoGrid: {
    width: '50%',
  },
  infoRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    minHeight: 25,
  },
  infoCell: {
    flex: 1,
    padding: 3,
    borderRight: '1px solid #000',
  },
  infoCellLast: {
    flex: 1,
    padding: 3,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  buyerSection: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
  },
  buyerInfo: {
    width: '50%',
    padding: 5,
    borderRight: '1px solid #000',
  },
  termsSection: {
    width: '50%',
    padding: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    minHeight: 20,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    minHeight: 30,
  },
  colSl: { width: '5%', borderRight: '1px solid #000', padding: 2, textAlign: 'center' },
  colDesc: { width: '45%', borderRight: '1px solid #000', padding: 2 },
  colHsn: { width: '10%', borderRight: '1px solid #000', padding: 2, textAlign: 'center' },
  colQty: { width: '12%', borderRight: '1px solid #000', padding: 2, textAlign: 'right' },
  colRate: { width: '10%', borderRight: '1px solid #000', padding: 2, textAlign: 'right' },
  colPer: { width: '5%', borderRight: '1px solid #000', padding: 2, textAlign: 'center' },
  colAmount: { width: '13%', padding: 2, textAlign: 'right' },
  amountInWordsSection: {
    padding: 5,
    borderBottom: '1px solid #000',
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 5,
    borderBottom: '1px solid #000',
  },
  balanceLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
  },
  balanceValue: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  hsnSummaryTable: {
    margin: 5,
    border: '0.5px solid #000',
  },
  hsnHeader: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #000',
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f9f9f9',
  },
  hsnRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #000',
  },
  hsnCell: {
    padding: 2,
    borderRight: '0.5px solid #000',
    fontSize: 7,
  },
  footer: {
    flexDirection: 'row',
    minHeight: 100,
  },
  bankDetails: {
    width: '60%',
    padding: 5,
    borderRight: '1px solid #000',
  },
  signature: {
    width: '40%',
    padding: 5,
    textAlign: 'right',
    justifyContent: 'space-between',
  },
  declaration: {
    fontSize: 7,
    marginTop: 10,
    borderTop: '1px solid #000',
    paddingTop: 5,
  }
});

const InvoicePdf: React.FC<InvoicePdfProps> = ({
  company,
  buyer,
  invoiceDetails,
  items,
  igstRate: globalIgstRate,
  previousBalance = 0,
  bankDetails,
  qrCode,
  notes,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalIgstAmount = items.reduce((sum, item) => {
    const rate = item.gstRate ?? globalIgstRate;
    return sum + (item.amount * rate) / 100;
  }, 0);
  const grandTotal = Math.round((subtotal + totalIgstAmount) * 100) / 100;
  const roundOff = (grandTotal - (subtotal + totalIgstAmount)).toFixed(2);
  const currentBalance = previousBalance + grandTotal;
  const hsnSummary = items.reduce((acc, item) => {
    const hsn = item.hsnSac || 'N/A';
    const rate = item.gstRate ?? globalIgstRate;
    if (!acc[hsn]) {
      acc[hsn] = { taxableValue: 0, igstRate: rate, igstAmount: 0 };
    }
    acc[hsn].taxableValue += item.amount;
    acc[hsn].igstAmount += (item.amount * rate) / 100;
    return acc;
  }, {} as Record<string, { taxableValue: number, igstRate: number, igstAmount: number }>)

  const formatValue = (val: string | undefined) => (val && val.trim() !== '') ? val : 'N/A';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Tax Invoice</Text>
            <Text style={styles.originalText}>(ORIGINAL FOR RECIPIENT)</Text>
          </View>
          <View style={styles.mainHeader}>
            <View style={styles.companyInfo}>
              <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                {company.logo && <Image src={company.logo} style={{ width: 40, height: 40, marginRight: 10 }} />}
                <View>
                  <Text style={styles.companyName}>{formatValue(company.name)}</Text>
                  {company.address.length > 0 ? (
                    company.address.map((line, i) => <Text key={i}>{formatValue(line)}</Text>)
                  ) : (
                    <Text>N/A</Text>
                  )}
                </View>
              </View>
              <Text><Text style={styles.label}>GSTIN/UIN: </Text>{formatValue(company.gstin)}</Text>
              <Text><Text style={styles.label}>State Name: </Text>{formatValue(company.state)}, Code : {formatValue(company.stateCode)}</Text>
              <Text><Text style={styles.label}>Contact: </Text>{company.contact.length > 0 ? company.contact.filter(Boolean).join(', ') : 'N/A'}</Text>
              <Text><Text style={styles.label}>E-Mail: </Text>{formatValue(company.email)}</Text>
              <Text>{formatValue(company.website)}</Text>
            </View>
            <View style={styles.invoiceInfoGrid}>
              <View style={styles.infoRow}>
                <View style={styles.infoCell}>
                  <Text style={styles.label}>Invoice No.</Text>
                  <Text style={styles.value}>{formatValue(invoiceDetails.invoiceNo)}</Text>
                </View>
                <View style={styles.infoCellLast}>
                  <Text style={styles.label}>Dated</Text>
                  <Text style={styles.value}>{formatValue(invoiceDetails.invoiceDate)}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoCell}>
                  <Text style={styles.label}>Delivery Note</Text>
                  <Text style={styles.value}>{formatValue(invoiceDetails.deliveryNote)}</Text>
                </View>
                <View style={styles.infoCellLast}>
                  <Text style={styles.label}>Mode/Terms of Payment</Text>
                  <Text style={styles.value}>{formatValue(invoiceDetails.modeOfPayment)}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.buyerSection}>
            <View style={styles.buyerInfo}>
              <Text style={styles.label}>Buyer (Bill to)</Text>
              <Text style={styles.companyName}>{formatValue(buyer.name)}</Text>
              {buyer.address.length > 0 ? (
                buyer.address.map((line, i) => <Text key={i}>{formatValue(line)}</Text>)
              ) : (
                <Text>N/A</Text>
              )}
              <Text><Text style={styles.label}>GSTIN/UIN : </Text>{formatValue(buyer.gstin)}</Text>
            </View>
          </View>
          <View>
            <View style={styles.tableHeader}>
              <Text style={styles.colSl}>Sl No.</Text>
              <Text style={styles.colDesc}>Description of Goods</Text>
              <Text style={styles.colHsn}>HSN/SAC</Text>
              <Text style={styles.colQty}>Quantity</Text>
              <Text style={styles.colRate}>Rate</Text>
              <Text style={styles.colPer}>per</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>
            {items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colSl}>{item.slNo}</Text>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colHsn}>{formatValue(item.hsnSac)}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colRate}>{item.rate.toFixed(2)}</Text>
                <Text style={styles.colPer}>{formatValue(item.per || item.unit)}</Text>
                <Text style={styles.colAmount}>{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <View style={styles.bankDetails}>
              <Text style={styles.label}>Company's Bank Details</Text>
              <Text><Text style={styles.label}>A/c Holder's Name : </Text>{formatValue(bankDetails.accountHolderName)}</Text>
              <Text><Text style={styles.label}>Bank Name : </Text>{formatValue(bankDetails.bankName)}</Text>
            </View>
            <View style={styles.signature}>
              <Text style={{ textAlign: 'center', fontSize: 7 }}>for {formatValue(company.name)}</Text>
              <Text style={{ textAlign: 'center' }}>Authorised Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdf;