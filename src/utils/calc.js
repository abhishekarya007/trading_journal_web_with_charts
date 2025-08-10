export function calcTradeCharges(trade) {
  const qty = Number(trade.qty) || 0;
  const buy = Number(trade.buy) || 0;
  const sell = Number(trade.sell) || 0;
  const buyValue = buy * qty;
  const sellValue = sell * qty;
  const turnover = buyValue + sellValue;
  // Brokerage: flat ₹20 per executed leg (buy + sell) for intraday
  const brokerageBuy = buyValue > 0 ? Math.min(20, buyValue * 0.0003) : 0;
  const brokerageSell = sellValue > 0 ? Math.min(20, sellValue * 0.0003) : 0;
  const brokerage = brokerageBuy + brokerageSell;
  // STT: 0.025% on sell side value
  const stt = sellValue * 0.00025;
  // Exchange Transaction Charges: 0.00297% on turnover
  const exchangeCharges = turnover * 0.0000297;
  // Stamp Duty: 0.003% on buy side value only
  const stampDuty = buyValue * 0.00003;
  // SEBI Turnover Charges: 0.0001% on turnover
  const sebi = turnover * 0.000001;
  // IPFT: 0.0001% on turnover
  const ipft = turnover * 0.000001;
  // DP charges (intraday = 0)
  const dp = 0;
  // GST base: Brokerage + Exchange + SEBI (per shared rule)
  const gstBase = brokerage + exchangeCharges + sebi;
  const gstRaw = 0.18 * gstBase;
  // Round components (broker models often ceil GST to nearest paisa)
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const ceil2 = (x) => Math.ceil((x + Number.EPSILON) * 100) / 100;

  const brokerageR = r2(brokerage);
  const sttR = r2(stt);
  const exchangeR = r2(exchangeCharges);
  const stampDutyR = r2(stampDuty);
  const sebiR = r2(sebi);
  const ipftR = r2(ipft);
  const dpR = r2(dp);
  const gstR = ceil2(gstRaw);

  const totalCharges = brokerageR + sttR + exchangeR + stampDutyR + sebiR + ipftR + dpR + gstR;
  let gross;
  if (trade.type === "Long") {
    gross = (sell - buy) * qty;
  } else {
    gross = (buy - sell) * qty;
  }
  let net = gross - totalCharges;
  const netRounded = r2(net);
  if (Math.abs(netRounded) < 0.015) net = 0; else net = netRounded;
  // Breakeven price per unit
  const breakeven = trade.type === "Long"
    ? round(buy + (totalCharges / (qty || 1)))
    : round(sell - (totalCharges / (qty || 1)));
  return {
    turnover: r2(turnover),
    brokerage: brokerageR,
    stt: sttR,
    exchangeCharges: exchangeR,
    stampDuty: stampDutyR,
    sebi: sebiR,
    ipft: ipftR,
    dp: dpR,
    gst: gstR,
    totalCharges: r2(totalCharges),
    gross: r2(gross),
    net,
    breakeven,
  };
}

function round(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}
