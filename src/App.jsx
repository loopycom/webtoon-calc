import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// === Reusable UI helpers ===
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    {children}
  </div>
);
const Input = props => (
  <input {...props} className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className||''}`} />
);

export default function App() {
  // 기본 입력값
  const [months, setMonths] = useState(12);
  const [episodesPerMonth, setEpm] = useState(4);
  const [mgType, setMgType] = useState("monthly"); // 'monthly' | 'total'
  const [mgMonthly, setMgMonthly] = useState(50);   // 만원
  const [mgTotal, setMgTotal] = useState(600);      // 만원
  const [portalFee, setPortalFee] = useState(30);   // %
  const [rsPercent, setRsPercent] = useState(50);   // %
  const [deductAfter, setDeductAfter] = useState(false); // 선/후 차감
  const [monthlyRevenue, setMonthlyRevenue] = useState(0); // 만원
  const [firstMonthRevenue, setFirstMonthRevenue] = useState(0); // 만원

  const result = useMemo(() => {
    // MG 계산
    const totalMG = mgType === "monthly" ? mgMonthly * months : mgTotal;

    // 월 매출 (입력값 없으면 기본 0)
    const monthlyGross = monthlyRevenue > 0 ? monthlyRevenue : 0;
    const grossAll = monthlyGross * months;

    // MG 차감 방식
    const afterMGRevenue = deductAfter ? grossAll : Math.max(grossAll - totalMG, 0);

    // 포털 수수료
    const portalFeeAmt = afterMGRevenue * (portalFee / 100);
    const afterPortal = afterMGRevenue - portalFeeAmt;

    // 작가 RS
    const authorRS = afterPortal * (rsPercent / 100);

    // 첫 달 계산
    const firstGross = firstMonthRevenue > 0 ? firstMonthRevenue : monthlyGross;
    const firstAfterMG = deductAfter ? firstGross : Math.max(firstGross - (mgType==='monthly'? mgMonthly : totalMG), 0);
    const firstAfterPortal = firstAfterMG - firstAfterMG * (portalFee/100);
    const firstRS = firstAfterPortal * (rsPercent/100);

    // MG 잔액
    const remainingMG = deductAfter ? Math.max(totalMG - afterMGRevenue, 0) : Math.max(totalMG - grossAll, 0);

    return {
      totalMG,
      grossAll,
      afterPortal,
      authorRS,
      portalFeeAmt,
      remainingMG,
      firstRS,
      firstAfterPortal,
    };
  }, [months, mgMonthly, mgTotal, mgType, monthlyRevenue, portalFee, rsPercent, deductAfter, firstMonthRevenue]);

  const fmt = n => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4 md:px-10">
      <motion.h1
        initial={{ opacity:0, y:-20 }} animate={{opacity:1,y:0}} transition={{duration:0.6}}
        className="mb-8 text-center text-3xl font-bold text-indigo-700"
      >
        🖌️ Acon3d Webtoon Revenue Simulator
      </motion.h1>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* INPUTS */}
        <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.7}} className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">입력</h2>
          <div className="flex flex-col gap-4">
            <Field label="연재 기간 (개월)">
              <Input type="number" value={months} min={1} onChange={e=>setMonths(+e.target.value)} />
            </Field>
            <Field label="월 연재 횟수 (회)">
              <Input type="number" value={episodesPerMonth} min={1} onChange={e=>setEpm(+e.target.value)} />
            </Field>

            {/* MG 입력 방식 */}
            <Field label="MG 입력 방식">
              <select value={mgType} onChange={e=>setMgType(e.target.value)} className="rounded-xl border px-3 py-2 text-sm shadow-sm">
                <option value="monthly">월 MG</option>
                <option value="total">누적 MG</option>
              </select>
            </Field>
            {mgType === "monthly" ? (
              <Field label="월 MG 금액 (만원)">
                <Input type="number" value={mgMonthly} min={0} onChange={e=>setMgMonthly(+e.target.value)} />
              </Field>
            ) : (
              <Field label="누적 MG 금액 (만원)">
                <Input type="number" value={mgTotal} min={0} onChange={e=>setMgTotal(+e.target.value)} />
              </Field>
            )}

            <Field label="월 총수익 예상치 (만원)">
              <Input type="number" value={monthlyRevenue} min={0} onChange={e=>setMonthlyRevenue(+e.target.value)} placeholder="예: 300" />
            </Field>

            <Field label="포털 수수료 (%)">
              <Input type="number" value={portalFee} min={0} max={100} onChange={e=>setPortalFee(+e.target.value)} />
            </Field>

            <Field label="작가 RS 비율 (%)">
              <Input type="number" value={rsPercent} min={0} max={100} onChange={e=>setRsPercent(+e.target.value)} />
            </Field>

            <Field label="MG 차감 방식">
              <select value={deductAfter? "after":"before"} onChange={e=>setDeductAfter(e.target.value==="after")} className="rounded-xl border px-3 py-2 text-sm shadow-sm">
                <option value="before">선차감</option>
                <option value="after">후차감</option>
              </select>
            </Field>

            <Field label="첫 달 총수익 예상 (만원)">
              <Input type="number" value={firstMonthRevenue} min={0} onChange={e=>setFirstMonthRevenue(+e.target.value)} placeholder="선택 입력" />
            </Field>
          </div>
        </motion.div>

        {/* OUTPUTS */}
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.2}} className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">결과</h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex justify-between"><span>총 MG 금액:</span><span className="font-medium">{fmt(result.totalMG)} 만원</span></li>
            <li className="flex justify-between"><span>총 매출 (예상):</span><span className="font-medium">{fmt(result.grossAll)} 만원</span></li>
            <li className="flex justify-between"><span>포털 수수료:</span><span className="font-medium">{fmt(result.portalFeeAmt)} 만원</span></li>
            <li className="flex justify-between"><span>포털 차감 후 금액:</span><span className="font-medium">{fmt(result.afterPortal)} 만원</span></li>
            <li className="flex justify-between"><span>작가 RS 수익:</span><span className="font-medium text-indigo-600">{fmt(result.authorRS)} 만원</span></li>
            <li className="flex justify-between"><span>MG 잔액 (종료 후):</span><span className="font-medium">{fmt(result.remainingMG)} 만원</span></li>
            <li className="flex justify-between"><span>첫 달 RS 수익 (예상):</span><span className="font-medium">{fmt(result.firstRS)} 만원</span></li>
          </ul>
        </motion.div>
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-gray-500">
        ※ 본 계산기는 참고용 시뮬레이션 도구입니다. 실제 정산 금액은 계약 조건 및 플랫폼 정책에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}