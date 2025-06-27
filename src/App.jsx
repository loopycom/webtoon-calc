import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);
const Input = props => (
  <input {...props} className="rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
);

export default function App() {
  const [months, setMonths] = useState(12);
  const [releases, setReleases] = useState(4);
  const [mgType, setMgType] = useState("total");
  const [mgMonthly, setMgMonthly] = useState(50);
  const [mgTotal, setMgTotal] = useState(600);
  const [revenue, setRevenue] = useState(0);
  const [portalFee, setPortalFee] = useState(30);
  const [rsRate, setRsRate] = useState(50);
  const [offsetType, setOffsetType] = useState("before");
  const [firstRev, setFirstRev] = useState(0);

  const result = useMemo(() => {
    const totalMG = mgType==="monthly"?mgMonthly*months:mgTotal;
    const grossAll = revenue*months;
    const afterMG = offsetType==="before"?Math.max(grossAll-totalMG,0):grossAll;
    const feeAmt = afterMG*(portalFee/100);
    const afterFee = afterMG-feeAmt;
    const rsAmt = afterFee*(rsRate/100);
    const firstAfterMG = offsetType==="before"?Math.max(firstRev-totalMG,0):firstRev;
    const firstAfterFee = firstAfterMG - firstAfterMG*(portalFee/100);
    const firstRS = firstAfterFee*(rsRate/100);
    const remainingMG = offsetType==="before"?Math.max(totalMG-grossAll,0):Math.max(totalMG-afterMG,0);
    return { totalMG, grossAll, feeAmt, afterFee, rsAmt, remainingMG, firstRS };
  }, [months, releases, mgType, mgMonthly, mgTotal, revenue, portalFee, rsRate, offsetType, firstRev]);

  const fmt = n => n.toLocaleString("ko-KR",{maximumFractionDigits:0});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.h1 className="text-3xl font-bold text-center mb-6" initial={{opacity:0}} animate={{opacity:1}}>Acon3d Webtoon Revenue Simulator</motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{x:-30,opacity:0}} animate={{x:0,opacity:1}}>
          <h2 className="text-xl mb-4">입력</h2>
          <Field label="연재 기간 (개월)"><Input type="number" value={months} onChange={e=>setMonths(+e.target.value)}/></Field>
          <Field label="월 연재 횟수"><Input type="number" value={releases} onChange={e=>setReleases(+e.target.value)}/></Field>
          <Field label="MG 입력 방식">
            <select value={mgType} onChange={e=>setMgType(e.target.value)} className="rounded-xl border px-3 py-2">
              <option value="monthly">월 MG</option><option value="total">누적 MG</option>
            </select>
          </Field>
          {mgType==="monthly"?
            <Field label="월 MG 금액"><Input type="number" value={mgMonthly} onChange={e=>setMgMonthly(+e.target.value)}/></Field>
            :<Field label="누적 MG 금액"><Input type="number" value={mgTotal} onChange={e=>setMgTotal(+e.target.value)}/></Field>}
          <Field label="월 총수익 예상치"><Input type="number" value={revenue} onChange={e=>setRevenue(+e.target.value)}/></Field>
          <Field label="포털 수수료 (%)"><Input type="number" value={portalFee} onChange={e=>setPortalFee(+e.target.value)}/></Field>
          <Field label="작가 RS 비율 (%)"><Input type="number" value={rsRate} onChange={e=>setRsRate(+e.target.value)}/></Field>
          <Field label="MG 차감 방식">
            <select value={offsetType} onChange={e=>setOffsetType(e.target.value)} className="rounded-xl border px-3 py-2">
              <option value="before">선차감</option><option value="after">후차감</option>
            </select>
          </Field>
          <Field label="첫 달 수익 예상치"><Input type="number" value={firstRev} onChange={e=>setFirstRev(+e.target.value)}/></Field>
        </motion.div>
        <motion.div initial={{x:30,opacity:0}} animate={{x:0,opacity:1}}>
          <h2 className="text-xl mb-4">결과</h2>
          <p>총 MG 금액: {fmt(result.totalMG)} 만원</p>
          <p>총 매출 (예상): {fmt(result.grossAll)} 만원</p>
          <p>포털 수수료: {fmt(result.feeAmt)} 만원</p>
          <p>포털 차감 후 금액: {fmt(result.afterFee)} 만원</p>
          <p>작가 RS 수익: {fmt(result.rsAmt)} 만원</p>
          <p>MG 잔액 (종료 후): {fmt(result.remainingMG)} 만원</p>
          <p>첫 달 RS 수익: {fmt(result.firstRS)} 만원</p>
        </motion.div>
      </div>
    </div>
  );
}