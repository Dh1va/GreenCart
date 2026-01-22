import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { Download, Search, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Pagination from "../../components/Admin/Pagination";
const Invoices = () => {
  const { currency, invoices, fetchInvoicesOnce } = useAppContext();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- INIT ---
  useEffect(() => {
    fetchInvoicesOnce();
  }, []);

  // --- HANDLERS ---
  const handleDownload = (id) => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin-invoices/${id}/pdf`,
      "_blank"
    );
  };

  // --- FILTERS & PAGINATION ---
  const filteredInvoices = useMemo(() => {
    const term = search.toLowerCase();
    return (invoices || []).filter((inv) => {
      const invoiceNo = inv.invoiceNumber?.toLowerCase() || "";
      const customer = inv.order?.address?.firstName?.toLowerCase() || "";
      return invoiceNo.includes(term) || customer.includes(term);
    });
  }, [invoices, search]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Invoices</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage customer billing history.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search invoice # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date Issued
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedData.length > 0 ? (
                  paginatedData.map((inv) => (
                    <tr
                      key={inv._id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Invoice # */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold text-gray-900">
                              {inv.invoiceNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Order #{inv.order?._id?.slice(-6).toUpperCase() || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inv.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {inv.order?.address?.firstName || "Unknown"} {inv.order?.address?.lastName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {inv.order?.address?.email || "No email"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {currency}
                          {inv.order?.pricing?.total?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.order?.payment?.status || "pending")}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownload(inv._id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No invoices found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Try adjusting your search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- FOOTER --- */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-800">{paginatedData.length}</span> of <span className="font-bold text-gray-800">{filteredInvoices.length}</span> invoices
            </p>
            <Pagination
              totalItems={filteredInvoices.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;