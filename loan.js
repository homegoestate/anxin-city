export function calculateLoan({principalWan,annualRate,years,income,otherDebt}) {
  const vals=[principalWan,annualRate,years,income,otherDebt];
  if(vals.some(v=>typeof v!=='number'||!Number.isFinite(v))) throw new Error('請填入完整且有效的數字。');
  if(principalWan<=0||principalWan>10000||annualRate<0||annualRate>20||years<1||years>40||!Number.isInteger(years)||income<=0||income>10000000||otherDebt<0||otherDebt>10000000) throw new Error('請確認金額、利率與年限在欄位範圍內。');
  const principal=principalWan*10000,months=years*12,r=annualRate/1200;
  const monthly=r===0?principal/months:principal*r/(-Math.expm1(-months*Math.log1p(r)));
  return {monthly,monthlyDebt:monthly+otherDebt,ratio:(monthly+otherDebt)/income*100,remaining:income-monthly-otherDebt,months};
}
