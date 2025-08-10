import React from "react";
import DateRangePicker from "./DateRangePicker";
import ScreenshotManager from "./ScreenshotManager";

export default function TradesTab({
  form,
  setForm,
  addOrUpdateTrade,
  importExcel,
  importZip,
  chargesPreview,
  formatNumber,
  visibleTrades,
  editTrade,
  duplicateTrade,
  deleteTrade,
  filterText,
  setFilterText,
  filterStatus,
  setFilterStatus,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sortKey,
  sortDir,
  onSortChange,
  currentPage,
  totalPages,
  totalTrades,
  pageSize,
  setPageSize,
  goToPage,
  goToFirstPage,
  goToLastPage,
  goToPrevPage,
  goToNextPage,
}) {
  const [showRange, setShowRange] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showImportMenu, setShowImportMenu] = React.useState(false);
  React.useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); const fake = { preventDefault:()=>{} }; addOrUpdateTrade(fake); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addOrUpdateTrade]);

  // Close import menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (showImportMenu && !event.target.closest('.relative')) {
        setShowImportMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showImportMenu]);
  return (
    <div>

      <div className="card table-wrap">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-semibold">Trade Log</h2>
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => { setForm({ id: Date.now() + Math.random(), date: new Date().toISOString().slice(0,10), symbol:'', type:'Long', qty:'', buy:'', sell:'', setup:'', remarks:''}); setShowModal(true); }}>Add Trade</button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                  {/* search icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                </span>
                <input value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Search" className="field field-sm w-full sm:w-56 input-with-icon"/>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button type="button" className={`chip ${filterStatus==='all' ? 'chip-active':''}`} onClick={()=>setFilterStatus('all')}>All</button>
                <button type="button" className={`chip chip-green ${filterStatus==='wins' ? 'chip-active':''}`} onClick={()=>setFilterStatus('wins')}>Wins</button>
                <button type="button" className={`chip chip-red ${filterStatus==='losses' ? 'chip-active':''}`} onClick={()=>setFilterStatus('losses')}>Losses</button>
              </div>
              {/* Fallback select on small screens */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="field field-sm md:hidden">
                <option value="all">All</option>
                <option value="wins">Wins</option>
                <option value="losses">Losses</option>
              </select>
              <div className="flex gap-2">
                <div className="relative">
                  <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setShowRange(v=>!v)}>
                    <span className="hidden sm:inline">Date Range</span>
                    <span className="sm:hidden">Range</span>
                  </button>
                  {showRange ? (
                    <div className="absolute right-0 mt-2 z-50">
                      <DateRangePicker
                        range={{ startDate: fromDate ? new Date(fromDate) : new Date(), endDate: toDate ? new Date(toDate) : new Date() }}
                        onChange={({startDate, endDate}) => { setFromDate(startDate.toISOString().slice(0,10)); setToDate(endDate.toISOString().slice(0,10)); setShowRange(false); }}
                      />
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={() => { setFilterText(''); setFilterStatus('all'); setFromDate(''); setToDate(''); }} className="btn btn-secondary">Clear</button>
              </div>
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th cursor-pointer" onClick={() => onSortChange('date')}>Date {sortKey==='date' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('symbol')}>Symbol {sortKey==='symbol' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('type')}>Type {sortKey==='type' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('trend')}>Trend {sortKey==='trend' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('rule')}>Rule {sortKey==='rule' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('qty')}>Qty {sortKey==='qty' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('buy')}>Buy {sortKey==='buy' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('sell')}>Sell {sortKey==='sell' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('net')}>Net P&L {sortKey==='net' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('riskReward')}>R:R {sortKey==='riskReward' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th">Setup</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrades.length ? visibleTrades.map(t => (
                <tr key={t.id} className="tr">
                  <td className="td">{t.date}</td>
                  <td className="td">{t.symbol}</td>
                  <td className="td">{t.type === 'Long' ? <span className="chip chip-green">Long</span> : <span className="chip chip-red">Short</span>}</td>
                  <td className="td">
                    {t.trend ? (
                      <span className={t.trend === 'Up' ? "chip chip-green" : "chip chip-red"}>{t.trend}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="td">
                    {t.rule ? (
                      <span className={t.rule === 'Yes' ? "chip chip-green" : "chip chip-red"}>{t.rule}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="td">{t.qty}</td>
                  <td className="td">{formatNumber(Number(t.buy))}</td>
                  <td className="td">{formatNumber(Number(t.sell))}</td>
                  <td className={"td " + ((t.meta?.net || 0) > 0 ? "text-green-700" : "text-red-700")}>
                    {t.meta?.net !== undefined ? formatNumber(Number(t.meta?.net)) : "-"}
                  </td>
                  <td className="td">
                    {t.riskReward ? (
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{t.riskReward}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex items-center justify-between">
                      <div>
                        {t.setup ? (
                          <span className="chip">{t.setup}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                      {t.screenshots && t.screenshots.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded" title={`${t.screenshots.length} screenshot(s)`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {t.screenshots.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { editTrade(t); setShowModal(true); }} className="btn btn-secondary !px-2 !py-1 text-xs" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => { duplicateTrade(t); setShowModal(true); }} className="btn btn-secondary !px-2 !py-1 text-xs" title="Duplicate">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteTrade(t.id)} className="btn btn-danger !px-2 !py-1 text-xs" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="10" className="td text-slate-500">No trades found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalTrades > 0 && (
        <div className="card-body border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTrades)} of {totalTrades} trades
            </div>
            
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="field field-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-slate-600 dark:text-slate-300">per page</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <button 
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                className="btn btn-secondary !px-2 !py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                ««
              </button>
              <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                className="btn btn-secondary !px-2 !py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                «
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`btn !px-3 !py-1 text-sm ${
                        currentPage === pageNum 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="btn btn-secondary !px-2 !py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                »
              </button>
              <button 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                className="btn btn-secondary !px-2 !py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 my-2 sm:my-0" onClick={(e)=>e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold">Add / Edit Trade</h2>
              <button className="btn btn-secondary !px-2 !py-1 text-sm" onClick={()=>setShowModal(false)}>Close</button>
            </div>
            <form onSubmit={(e)=>{ addOrUpdateTrade(e); setShowModal(false); }} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="sm:col-span-2">
                <div className="text-slate-500 dark:text-slate-300 text-sm mb-2">Trade details</div>
              </div>
              <div>
                <label className="label">Date</label>
                <input required value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="field field-md"/>
              </div>
              <div>
                <label className="label">Symbol</label>
                <input placeholder="e.g. NIFTY" required value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} className="field field-md"/>
              </div>
              <div>
                <label className="label">Trade Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="field field-md">
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
              <div>
                <label className="label">Trend</label>
                <select value={form.trend || 'Up'} onChange={e => setForm({...form, trend: e.target.value})} className="field field-md">
                  <option>Up</option>
                  <option>Down</option>
                </select>
              </div>
              <div>
                <label className="label">Rule Followed</label>
                <select value={form.rule || 'Yes'} onChange={e => setForm({...form, rule: e.target.value})} className="field field-md">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div>
                <label className="label">Qty</label>
                <input placeholder="0" inputMode="numeric" type="text" value={form.qty} onChange={e => setForm({...form, qty: e.target.value.replace(/[^0-9]/g, '')})} className="field field-md"/>
              </div>
              <div>
                <label className="label">Buy Price</label>
                <input placeholder="0.00" inputMode="decimal" type="text" value={form.buy} onChange={e => setForm({...form, buy: e.target.value.replace(/[^0-9.]/g, '')})} className="field field-md"/>
                <p className="text-xs text-slate-500 mt-1">Average buy price per unit</p>
              </div>
              <div>
                <label className="label">Sell Price</label>
                <input placeholder="0.00" inputMode="decimal" type="text" value={form.sell} onChange={e => setForm({...form, sell: e.target.value.replace(/[^0-9.]/g, '')})} className="field field-md"/>
                <p className="text-xs text-slate-500 mt-1">Average sell price per unit</p>
              </div>

              <div>
                <label className="label">Setup</label>
                <select value={form.setup || ''} onChange={e => setForm({...form, setup: e.target.value})} className="field field-md">
                  <option value="">Select setup</option>
                  <option>Breakout</option>
                  <option>Breakdown</option>
                  <option>Liquidity-Sweep</option>
                  <option>Reversal</option>
                  <option>Support</option>
                  <option>Resistance</option>
                  <option>Trendline</option>
                  <option>Scalping</option>
                  <option>Price Action</option>
                  <option>M pattern</option>
                  <option>W pattern</option>
                  <option>Pin Bar</option>
                  <option>Magic candle</option>
                  <option>Retest</option>
                  <option>Trap</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Remarks</label>
                <input placeholder="Notes, mistakes, improvements..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="field field-md"/>
              </div>
              <div>
                <label className="label">Emotion</label>
                <select value={form.emotion || ''} onChange={e => setForm({...form, emotion: e.target.value})} className="field field-md">
                  <option value="">Select emotion</option>
                  <option>Calm</option>
                  <option>Confident</option>
                  <option>Fearful</option>
                  <option>Greedy</option>
                  <option>FOMO</option>
                  <option>Revenge</option>
                  <option>Stressed</option>
                </select>
              </div>
              <div>
                <label className="label">Risk:Reward</label>
                <input placeholder="e.g. 1:2" value={form.riskReward} onChange={e => setForm({...form, riskReward: e.target.value})} className="field field-md"/>
              </div>

              <div className="sm:col-span-2">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="section-title">Charges preview</div>
                    <div className={(chargesPreview.net >= 0 ? 'badge badge-green' : 'badge badge-red') + ' capitalize'}>
                      Net: {formatNumber(Math.abs(chargesPreview.net) < 0.015 ? 0 : chargesPreview.net)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                    <div><span className="text-slate-500 dark:text-slate-300">Turnover</span><div className="font-medium">{formatNumber(chargesPreview.turnover)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">Brokerage</span><div className="font-medium">{formatNumber(chargesPreview.brokerage)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">STT</span><div className="font-medium">{formatNumber(chargesPreview.stt)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">Exchange</span><div className="font-medium">{formatNumber(chargesPreview.exchangeCharges)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">Stamp Duty</span><div className="font-medium">{formatNumber(chargesPreview.stampDuty)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">SEBI</span><div className="font-medium">{formatNumber(chargesPreview.sebi)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">GST</span><div className="font-medium">{formatNumber(chargesPreview.gst)}</div></div>
                    <div><span className="text-slate-500 dark:text-slate-300">Total Charges</span><div className="font-medium">{formatNumber(chargesPreview.totalCharges)}</div></div>
                  </div>
                </div>
              </div>

              {/* Screenshots Section */}
              <div className="sm:col-span-2">
                <ScreenshotManager 
                  screenshots={form.screenshots || []}
                  onChange={(newScreenshots) => setForm({...form, screenshots: newScreenshots})}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row flex-wrap gap-2 pt-3">
                <button type="submit" className="btn btn-primary">Save Trade</button>
                <button type="button" onClick={() => setForm({ ...form, id: Date.now() + Math.random(), qty: '', buy: '', sell: '' })} className="btn btn-secondary">Clear</button>

                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowImportMenu(v => !v)} 
                    className="btn btn-secondary flex items-center gap-1"
                  >
                    Import
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showImportMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                      <div className="py-1">
                        <label className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Excel Only
                          <span className="text-xs text-slate-500 ml-auto">Data only</span>
                          <input 
                            accept=".xlsx, .xls" 
                            type="file" 
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                importExcel(e.target.files[0]);
                                setShowImportMenu(false);
                                e.target.value = '';
                              }
                            }} 
                            className="hidden"
                          />
                        </label>
                        <label className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          ZIP with Screenshots
                          <span className="text-xs text-slate-500 ml-auto">Complete</span>
                          <input 
                            accept=".zip" 
                            type="file" 
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                importZip(e.target.files[0]);
                                setShowImportMenu(false);
                                e.target.value = '';
                              }
                            }} 
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
