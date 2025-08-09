export function calcTradeCharges(trade) {
  const qty = Number(trade.qty) || 0;
  const buy = Number(trade.buy) || 0;
  const sell = Number(trade.sell) || 0;
  const turnover = qty * (buy + sell);
  const brokerage = Math.min(20, turnover * 0.0003);
  const stt = (sell * qty) * 0.00025;
  const exchangeCharges = turnover * 0.0000375;
  const stampDuty = turnover * 0.00003;
  const sebi = turnover * 0.000001;
  const gst = 0.18 * (brokerage + exchangeCharges);
  const totalCharges = brokerage + stt + exchangeCharges + stampDuty + sebi + gst;
  let gross;
  if (trade.type === "Long") {
    gross = (sell - buy) * qty;
  } else {
    gross = (buy - sell) * qty;
  }
  const net = gross - totalCharges;
  return {
    turnover: round(turnover),
    brokerage: round(brokerage),
    stt: round(stt),
    exchangeCharges: round(exchangeCharges),
    stampDuty: round(stampDuty),
    sebi: round(sebi),
    gst: round(gst),
    totalCharges: round(totalCharges),
    gross: round(gross),
    net: round(net),
  };
}

function round(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}
