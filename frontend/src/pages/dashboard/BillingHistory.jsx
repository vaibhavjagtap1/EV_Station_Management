import { useState, useEffect, useCallback } from 'react';
import { billingAPI } from '../../api';
import { FileText, Download, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const generatePDF = (bill) => {
  const doc = new jsPDF();

  // Header gradient-like section
  doc.setFillColor(16, 185, 129); // green-500
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EVCharge', 14, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('EV Charging Station Management System', 14, 21);
  doc.setFontSize(12);
  doc.text('TAX INVOICE', 14, 30);

  // Bill number and date
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(`Bill No: ${bill.billNumber}`, 14, 50);
  doc.text(`Date: ${format(new Date(bill.createdAt), 'dd MMM yyyy, HH:mm')}`, 14, 57);

  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${bill.userName || bill.user?.name || 'N/A'}`, 14, 78);
  doc.text(`Email: ${bill.userEmail || bill.user?.email || 'N/A'}`, 14, 85);
  doc.text(`Vehicle: ${bill.vehicleType || 'N/A'} ${bill.vehicleNumber ? `(${bill.vehicleNumber})` : ''}`, 14, 92);

  // Station details
  doc.setFont('helvetica', 'bold');
  doc.text('Charging Station', 120, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${bill.stationName || bill.station?.name || 'N/A'}`, 120, 78);
  doc.text(`${bill.stationAddress || ''}`, 120, 85, { maxWidth: 75 });

  // Session details
  doc.setFont('helvetica', 'bold');
  doc.text('Session Details', 14, 107);
  doc.setFont('helvetica', 'normal');
  if (bill.sessionStart) doc.text(`Start: ${format(new Date(bill.sessionStart), 'dd MMM yyyy, HH:mm')}`, 14, 115);
  if (bill.sessionEnd) doc.text(`End: ${format(new Date(bill.sessionEnd), 'dd MMM yyyy, HH:mm')}`, 14, 122);
  if (bill.chargingDuration) doc.text(`Duration: ${bill.chargingDuration} minutes`, 14, 129);

  // Bill table
  autoTable(doc, {
    startY: 140,
    head: [['Description', 'Rate', 'Units', 'Amount']],
    body: [
      ['EV Charging - Energy', `₹${bill.pricePerUnit}/kWh`, `${bill.energyConsumed} kWh`, `₹${bill.subtotal?.toFixed(2)}`],
      ['GST (18%)', '', '', `₹${bill.taxAmount?.toFixed(2)}`],
    ],
    foot: [['', '', 'Total Amount', `₹${bill.totalAmount?.toFixed(2)}`]],
    headStyles: { fillColor: [16, 185, 129] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10 },
  });

  // Payment status
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Status: ${(bill.paymentStatus || 'Pending').toUpperCase()}`, 14, finalY);

  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for choosing EVCharge! Go Green, Drive Electric.', 14, finalY + 15);

  doc.save(`EVCharge-Bill-${bill.billNumber}.pdf`);
};

const BillingHistory = () => {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.getMyBilling({ page, limit });
      setBills(data.bills);
      setStats(data.stats);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleDownload = async (bill) => {
    try {
      let fullBill = bill;
      if (!bill.sessionStart) {
        const { data } = await billingAPI.getBillById(bill._id);
        fullBill = data.bill;
      }
      generatePDF(fullBill);
      toast.success('Bill downloaded!');
    } catch (err) {
      toast.error('Failed to download bill');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing History</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Spent', value: `₹${stats.totalAmount?.toFixed(0) || 0}`, icon: <DollarSign className="w-5 h-5 text-blue-500" /> },
              { label: 'Energy Used', value: `${stats.totalEnergy?.toFixed(1) || 0} kWh`, icon: <FileText className="w-5 h-5 text-green-500" /> },
              { label: 'Sessions', value: stats.totalSessions || 0, icon: <FileText className="w-5 h-5 text-purple-500" /> },
            ].map((s) => (
              <div key={s.label} className="card flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
          </div>
        ) : bills.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bills yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Complete a charging session to see your bills here</p>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3">Bill #</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Energy</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {bills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                          {bill.billNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {bill.station?.name || bill.stationName || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {bill.energyConsumed} kWh
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          ₹{bill.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              bill.paymentStatus === 'paid'
                                ? 'badge-completed'
                                : bill.paymentStatus === 'failed'
                                ? 'badge-cancelled'
                                : 'badge-pending'
                            }
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDownload(bill)}
                            className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;
