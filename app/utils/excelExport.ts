import * as XLSX from 'xlsx';
import type { DonationListResponse } from 'app/interfaces/report';

interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  includeSummary?: boolean;
  pageInfo?: {
    page: number;
    limit: number;
    totalCount: number;
  };
}

interface ExportData {
  'Order ID': string;
  'Order Number': string;
  'Donation Name': string;
  'Amount ($)': string;
  'Quantity': number;
  'Vendor': string;
  'Date': string;
  'Time': string;
}

/**
 * Utility function to export donation list data to Excel format
 * @param donationData - The donation list response data
 * @param options - Export configuration options
 */
export const exportDonationListToExcel = (
  donationData: DonationListResponse,
  options: ExportOptions = {}
) => {
  const {
    filename,
    includeTimestamp = true,
    includeSummary = true,
    pageInfo
  } = options;

  // Validate input data
  if (!donationData?.data?.orders || donationData.data.orders.length === 0) {
    throw new Error('No data available to export');
  }

  // Prepare data for Excel export
  const excelData: ExportData[] = [];
  let totalAmount = 0;
  let totalQuantity = 0;

    donationData.data.orders.forEach((order: any) => {
      if (!order.lineItems || !Array.isArray(order.lineItems)) {
        console.warn('Order missing lineItems:', order.orderId);
        return;
      }

      order.lineItems.forEach((lineItem: any) => {
        try {
          const amount = parseFloat(lineItem.price) || 0;
          const quantity = parseInt(lineItem.quantity) || 0;
          totalAmount += amount * quantity;
          totalQuantity += quantity;
          
          excelData.push({
            'Order ID': order.orderId || 'N/A',
            'Order Number': order.orderNumber || 'N/A',
            'Donation Name': lineItem.productName || 'N/A',
            'Amount ($)': (amount ).toFixed(2),
            'Quantity': quantity,
            'Vendor': lineItem.vendor || 'N/A',
            'Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
            'Time': order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A',
          });
        } catch (itemError) {
          console.error('Error processing line item:', itemError, lineItem);
        }
      });
    });

  // Add summary row if requested
  // if (includeSummary) {
  //   excelData.push({
  //     'Order ID': '',
  //     'Order Number': '',
  //     'Donation Name': 'TOTAL',
  //     'Amount ($)': totalAmount.toFixed(2),
  //     'Quantity': totalQuantity,
  //     'Vendor': '',
  //     'Date': '',
  //     'Time': '',
  //   });
  // }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // Order ID
    { wch: 12 }, // Order Number
    { wch: 25 }, // Donation Name
    { wch: 12 }, // Amount
    { wch: 8 },  // Quantity
    { wch: 15 }, // Vendor
    { wch: 12 }, // Date
    { wch: 12 }, // Time
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };
  }

  // // Style the total row if summary is included
  // if (includeSummary) {
  //   const lastRowIndex = excelData.length - 1;
  //   for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
  //     const cellAddress = XLSX.utils.encode_cell({ r: lastRowIndex + 1, c: col });
  //     if (!worksheet[cellAddress]) continue;
  //     worksheet[cellAddress].s = {
  //       font: { bold: true },
  //       fill: { fgColor: { rgb: "FFFFCC" } }
  //     };
  //   }
  // }

  // // Add main worksheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations List');

  // // Add summary sheet if requested
  if (includeSummary && pageInfo) {
    const summaryData = [
      { 'Metric': 'Total Records Exported', 'Value': excelData.length - (includeSummary ? 1 : 0) },
      { 'Metric': 'Total Amount', 'Value': `$${totalAmount.toFixed(2)}` },
      { 'Metric': 'Total Quantity', 'Value': totalQuantity },
      { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() },
      { 'Metric': 'Export Time', 'Value': new Date().toLocaleTimeString() },
      { 'Metric': 'Page', 'Value': pageInfo.page },
      { 'Metric': 'Records Per Page', 'Value': pageInfo.limit },
      { 'Metric': 'Total Records Available', 'Value': pageInfo.totalCount },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
    
    // Style summary sheet headers
    const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1');
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (!summaryWorksheet[cellAddress]) continue;
      summaryWorksheet[cellAddress].s = {
        font: { bold: true }
      };
    }
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Export Summary');
  }

  // Generate filename
  const currentDate = new Date().toISOString().split('T')[0];
  const timestamp = includeTimestamp ? new Date().toISOString().replace(/[:.]/g, '-') : '';
  const pageInfo_str = pageInfo ? `page-${pageInfo.page}` : '';
  
  const generatedFilename = filename || 
    `donations-list-${currentDate}${pageInfo_str ? `-${pageInfo_str}` : ''}${timestamp ? `-${timestamp}` : ''}.xlsx`;

  // Download the file
  XLSX.writeFile(workbook, generatedFilename);

  // Return export statistics
  return {
    success: true,
    filename: generatedFilename,
    recordsExported: excelData.length ,
    totalAmount,
    totalQuantity,
    exportDate: new Date().toISOString(),
  };
};

/**
 * Simple export function with default options
 * @param donationData - The donation list response data
 * @param customFilename - Optional custom filename
 */
export const exportDonationListSimple = (
  donationData: DonationListResponse,
  customFilename?: string
) => {
  return exportDonationListToExcel(donationData, {
    filename: customFilename,
    includeTimestamp: false,
    includeSummary: false,
    pageInfo: donationData?.data ? {
      page: donationData.data.page,
      limit: donationData.data.limit,
      totalCount: donationData.data.totalLineItemCount,
    } : undefined,
  });
};

/**
 * Export with advanced options including multiple sheets
 * @param donationData - The donation list response data
 * @param options - Advanced export options
 */
export const exportDonationListAdvanced = (
  donationData: DonationListResponse,
  options: ExportOptions & { 
    includeMetadata?: boolean;
    customSheetName?: string;
  } = {}
) => {
  const {  customSheetName, ...baseOptions } = options;
  
  const result = exportDonationListToExcel(donationData, {
    ...baseOptions,
    includeSummary: false,
    pageInfo: donationData?.data ? {
      page: donationData.data.page,
      limit: donationData.data.limit,
      totalCount: donationData.data.totalLineItemCount,
    } : undefined,
  });

  return result;
};