import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// ──────────────────────────────────────────────────────────────
// ✨ Backtocks‑style Revenue Calculator (UI 리디자인 버전)
//    ‑ React + TailwindCSS + framer‑motion + shadcn/ui
//    ‑ 단일 파일 데모 (App component)
//    ‑ 입력 변경 시 실시간 결과 계산
// ──────────────────────────────────────────────────────────────

/*
  HOW TO USE / 배포 안내
  1. pnpm create vite my‑calc ‑‑template react
  2. cd my‑calc && pnpm i ‑D tailwindcss postcss autoprefixer
  3. npx tailwindcss init ‑p  (tailwind 설정)
  4. shadcn/ui 설치 → https://ui.shadcn.com/docs/installation
  5. App.jsx 내용 교체 후 `pnpm run dev`로 확인
  6. GitHub 푸시 → Vercel, Netlify, Cloudflare Pages 등 연결하여 배포
*/

// ──────────────────────────────────────────────────────────────
// small shadcn/ui helpers (원본 패키지 import로 대체해도 OK)
// ──────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    {children}
  </div>
);

const Input = props => (
  <input {...props} className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className || ""}`} />
);

const Toggle = ({ checked, onChange, optionA = "선차감", optionB = "후차감" }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500">{optionA}</span>
    <label className="inline-flex cursor-pointer items-center">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-indigo-600 after:content-[''] after:absolute after:h-4 after:w-4 after:translate-x-1 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
    </label>
    <span className="text-xs text-gray-500">{optionB}</span>
  </div>
);

// ──────────────────────────────────────────────────────────────
export default function App() {
  // INPUT STATES
  const [months, setMonths] = useState(12);
  const [episodesPerMonth, setEpm] = useState(4);
  const [mgPerEp, setMgPerEp] = useState(50); // 만원 단위
  const [portalFee, setPortalFee] = useState(30); // %
  const [deductAfter, setDeductAfter] = useState(false); // false=선차감, true=후차감
  const [firstMonthGross, setFirstMonthGross] = useState(0);

  // CORE CALCULATION (실시간 업데이트)
  const result = useMemo(() => {
    const totalEps = months * episodesPerMonth;
    const totalMG = mgPerEp * totalEps;

    // ☝️ 월별 총매출 가정 — 첫 달 입력값이 있으면 그 값, 없다면 MG와 동일한 금액 가정
    const perMonthGross = firstMonthGross > 0 ? firstMonthGross : mgPerEp * episodesPerMonth;
    const grossAll = perMonthGross * months;

    // MG 차감 방식
    const afterMGRevenue = deductAfter ? grossAll : Math.max(grossAll - totalMG, 0);

    const portalFeeAmt = afterMGRevenue * (portalFee / 100);
    const netAfterFee = afterMGRevenue - portalFeeAmt;

    // 후차감인 경우 종료 시점에서 MG 상계
    const remainingMG = deductAfter ? Math.max(totalMG - afterMGRevenue, 0) : Math.max(totalMG - grossAll, 0);

    const monthlyAvgNet = netAfterFee / months;

    // 첫 달 실제 수령액 (MG 차감/수수료 적용)
    const firstGross = firstMonthGross > 0 ? firstMonthGross : perMonthGross;
    const firstAfterMG = deductAfter ? firstGross : Math.max(firstGross - mgPerEp * episodesPerMonth, 0);
    const firstAfterFee = firstAfterMG - firstAfterMG * (portalFee / 100);

    return {
      totalEps,
      totalMG,
      grossAll,
      portalFeeAmt,
      netAfterFee,
      remainingMG,
      monthlyAvgNet,
      firstAfterFee,
    };
  }, [months, episodesPerMonth, mgPerEp, portalFee, deductAfter, firstMonthGross]);

  // number→locale string helper
  const fmt = n => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4 md:px-10">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 text-center text-3xl font-bold text-indigo-700">
        ✏️ Webtoon Revenue Simulator
      </motion.h1>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* ─── Input Card ─── */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">입력</h2>
          <div className="flex flex-col gap-4">
            <Field label="연재 기간 (개월)">
              <Input type="number" value={months} onChange={e => setMonths(Number(e.target.value))} min={1} />
            </Field>
            <Field label="월 연재 횟수 (회)">
              <Input type="number" value={episodesPerMonth} onChange={e => setEpm(Number(e.target.value))} min={1} />
            </Field>
            <Field label="1화당 MG (만원)">
              <Input type="number" value={mgPerEp} onChange={e => setMgPerEp(Number(e.target.value))} min={0} />
            </Field>
            <Field label="포털 수수료 (%)">
              <Input type="number" value={portalFee} onChange={e => setPortalFee(Number(e.target.value))} min={0} max={100} />
            </Field>
            <Field label="MG 차감 방식">
              <Toggle checked={deductAfter} onChange={setDeductAfter} optionA="선차감" optionB="후차감" />
            </Field>
            <Field label="첫 달 총매출 예상 (선택, 만원)">
              <Input type="number" value={firstMonthGross} onChange={e => setFirstMonthGross(Number(e.target.value))} min={0} placeholder="입력 시 첫 달 기준값" />
            </Field>
          </div>
        </motion.div>

        {/* ─── Output Card ─── */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">결과</h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex justify-between"><span>총 회차:</span><span className="font-medium">{fmt(result.totalEps)} 화</span></li>
            <li className="flex justify-between"><span>총 MG:</span><span className="font-medium">{fmt(result.totalMG)} 만원</span></li>
            <li className="flex justify-between"><span>총 매출(예상):</span><span className="font-medium">{fmt(result.grossAll)} 만원</span></li>
            <li className="flex justify-between"><span>포털 수수료:</span><span className="font-medium">{fmt(result.portalFeeAmt)} 만원</span></li>
            <li className="flex justify-between"><span>순수익 (MG/수수료 적용):</span><span className="font-medium text-indigo-600">{fmt(result.netAfterFee)} 만원</span></li>
            <li className="flex justify-between"><span>월평균 순수익:</span><span className="font-medium">{fmt(result.monthlyAvgNet)} 만원</span></li>
            <li className="flex justify-between"><span>MG 잔액 (연재 종료 후):</span><span className="font-medium {result.remainingMG>0?"text-red-600":"text-green-600"}">{fmt(result.remainingMG)} 만원</span></li>
            <li className="flex justify-between"><span>첫 달 실수령액:</span><span className="font-medium">{fmt(result.firstAfterFee)} 만원</span></li>
          </ul>
        </motion.div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-gray-500">
        ※ 본 계산기는 참고용 시뮬레이션 도구입니다. 실제 정산 금액은 계약 조건 및 플랫폼 정책에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
