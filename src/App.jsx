import React, { useState } from 'react'

function App() {
  const [input, setInput] = useState({
    months: 12,
    releasesPerMonth: 4,
    mgType: "누적 MG",
    mgAmount: 600,
    revenue: 1000,
    portalFee: 50,
    rsRate: 50,
    mgOffsetType: "선차감",
    firstMonthRevenue: 0
  });

  const parseNumber = (v) => parseFloat(v) || 0;
  const totalRevenue = parseNumber(input.revenue) * parseNumber(input.months);
  const totalFee = totalRevenue * (parseNumber(input.portalFee) / 100);
  const postFeeRevenue = totalRevenue - totalFee;
  const rsValue = postFeeRevenue * (parseNumber(input.rsRate) / 100);
  const mgValue = input.mgType === "누적 MG" ? parseNumber(input.mgAmount) : parseNumber(input.mgAmount) * parseNumber(input.releasesPerMonth) * parseNumber(input.months);
  const offsetType = input.mgOffsetType;
  const mgOffset = offsetType === "선차감" ? Math.max(0, rsValue - mgValue) : rsValue;
  const remainingMg = offsetType === "선차감" ? Math.max(0, mgValue - rsValue) : Math.max(0, mgValue - rsValue);
  const firstRs = parseNumber(input.firstMonthRevenue) * (1 - parseNumber(input.portalFee) / 100) * (parseNumber(input.rsRate) / 100);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🖋️ Acon3d Webtoon Revenue Simulator</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h2>입력</h2>
          {Object.entries(input).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "0.5rem" }}>
              <label>
                {key}:
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                  style={{ marginLeft: "0.5rem" }}
                />
              </label>
            </div>
          ))}
        </div>
        <div>
          <h2>결과</h2>
          <p>총 MG 금액: {mgValue.toLocaleString()} 만원</p>
          <p>총 매출 (예상): {totalRevenue.toLocaleString()} 만원</p>
          <p>포탈 수수료: {totalFee.toLocaleString()} 만원</p>
          <p>포탈 차감 후 금액: {postFeeRevenue.toLocaleString()} 만원</p>
          <p>작가 RS 수익: {rsValue.toLocaleString()} 만원</p>
          <p>MG 잔액 (종료 후): {remainingMg.toLocaleString()} 만원</p>
          <p>첫 달 RS 수익 (예상): {firstRs.toLocaleString()} 만원</p>
        </div>
      </div>
    </div>
  );
}

export default App;