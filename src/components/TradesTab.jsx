import React from "react";
import DateRangePicker from "./DateRangePicker";

export default function TradesTab({
  form,
  setForm,
  addOrUpdateTrade,
  importExcel,
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
}) {
  const [showRange, setShowRange] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  React.useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); const fake = { preventDefault:()=>{} }; addOrUpdateTrade(fake); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addOrUpdateTrade]);
  return (
    <div>

      <div className="card table-wrap">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Trade Log</h2>
            <button type="button" className="btn btn-primary" onClick={() => { setForm({ id: Date.now() + Math.random(), date: new Date().toISOString().slice(0,10), symbol:'', type:'Long', qty:'', buy:'', sell:'', setup:'', remarks:''}); setShowModal(true); }}>Add Trade</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                {/* search icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </span>
              <input value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Search" className="field field-sm w-56 input-with-icon"/>
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
            <div className="relative">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRange(v=>!v)}>Date Range</button>
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
        <div className="table-scroll">
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th cursor-pointer" onClick={() => onSortChange('date')}>Date {sortKey==='date' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('symbol')}>Symbol {sortKey==='symbol' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('type')}>Type {sortKey==='type' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('qty')}>Qty {sortKey==='qty' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('buy')}>Buy {sortKey==='buy' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('sell')}>Sell {sortKey==='sell' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="th cursor-pointer" onClick={() => onSortChange('net')}>Net P&L {sortKey==='net' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
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
                  <td className="td">{t.qty}</td>
                  <td className="td">{formatNumber(Number(t.buy))}</td>
                  <td className="td">{formatNumber(Number(t.sell))}</td>
                  <td className={"td " + ((t.meta?.net || 0) > 0 ? "text-green-700" : "text-red-700")}>
                    {t.meta?.net !== undefined ? formatNumber(Number(t.meta?.net)) : "-"}
                  </td>
                  <td className="td">
                    {t.setup ? (
                      <span className="chip">{t.setup}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => { editTrade(t); setShowModal(true); }} className="btn btn-secondary !px-2 !py-1 text-xs" title="E">Edit</button>
                      <button onClick={() => { duplicateTrade(t); setShowModal(true); }} className="btn btn-secondary !px-2 !py-1 text-xs" title="D">Duplicate</button>
                      <button onClick={() => deleteTrade(t.id)} className="btn btn-danger !px-2 !py-1 text-xs" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="9" className="td text-slate-500">No trades found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-700" onClick={(e)=>e.stopPropagation()}>
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold">Add / Edit Trade</h2>
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Close</button>
            </div>
            <form onSubmit={(e)=>{ addOrUpdateTrade(e); setShowModal(false); }} className="card-body grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-3">
                <div className="text-slate-500 dark:text-slate-300 text-sm mb-2">Trade details</div>
              </div>
              <div>
                <label className="label">Date</label>
                <input required value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="mt-1 field field-md"/>
              </div>
              <div>
                <label className="label">Symbol</label>
                <input placeholder="e.g. NIFTY" required value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} className="mt-1 field field-md"/>
              </div>
              <div>
                <label className="label">Trade Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="mt-1 field field-md">
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>

              <div>
                <label className="label">Qty</label>
                <input placeholder="0" inputMode="numeric" type="text" value={form.qty} onChange={e => setForm({...form, qty: e.target.value.replace(/[^0-9]/g, '')})} className="mt-1 field field-md"/>
              </div>
              <div>
                <label className="label">Buy Price</label>
                <input placeholder="0.00" inputMode="decimal" type="text" value={form.buy} onChange={e => setForm({...form, buy: e.target.value.replace(/[^0-9.]/g, '')})} className="mt-1 field field-md"/>
                <p className="text-xs text-slate-500 mt-1">Average buy price per unit</p>
              </div>
              <div>
                <label className="label">Sell Price</label>
                <input placeholder="0.00" inputMode="decimal" type="text" value={form.sell} onChange={e => setForm({...form, sell: e.target.value.replace(/[^0-9.]/g, '')})} className="mt-1 field field-md"/>
                <p className="text-xs text-slate-500 mt-1">Average sell price per unit</p>
              </div>

              <div>
                <label className="label">Setup</label>
                <input placeholder="e.g. Breakout, Pullback" value={form.setup} onChange={e => setForm({...form, setup: e.target.value})} className="mt-1 field field-md"/>
              </div>
              <div className="md:col-span-2">
                <label className="label">Remarks</label>
                <input placeholder="Notes, mistakes, improvements..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="mt-1 field field-md"/>
              </div>

              <div className="md:col-span-3">
                <div className="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="section-title">Charges preview</div>
                    <div className={(chargesPreview.net >= 0 ? 'badge badge-green' : 'badge badge-red') + ' capitalize'}>
                      Net: {formatNumber(Math.abs(chargesPreview.net) < 0.015 ? 0 : chargesPreview.net)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
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

              <div className="md:col-span-3 flex flex-wrap gap-2 pt-3">
                <button type="submit" className="btn btn-primary">Save Trade</button>
                <button type="button" onClick={() => setForm({ ...form, id: Date.now() + Math.random(), qty: '', buy: '', sell: '' })} className="btn btn-secondary">Clear</button>

                <label className="btn btn-secondary cursor-pointer">
                  Import Excel
                  <input accept=".xlsx, .xls" type="file" onChange={e => e.target.files?.[0] && importExcel(e.target.files[0])} className="hidden"/>
                </label>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
