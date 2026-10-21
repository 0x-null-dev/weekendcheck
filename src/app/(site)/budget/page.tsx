import type { Metadata } from "next";
import Link from "next/link";
import { formatWeekRange } from "@/lib/demo-data";
import { getPublicData } from "@/lib/public-data";
import { BudgetMeter } from "@/components/site/budget-meter";
import { formatEuros } from "@/lib/site";

export const metadata: Metadata = {
  title: "Budget",
  description: "Alex sets aside €1,000 to pay for the products he reviews. Every purchase is listed here.",
  alternates: { canonical: "/budget" },
};
export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const { budget } = await getPublicData();
  const count = budget.purchases.length;
  return <div className="wrap page">
    <header className="page-head"><p className="label">Budget</p><h1>The {formatEuros(budget.totalCents).replace(".00", "")} budget.</h1><p className="lede">When a product needs a paid plan, I pay for it so I can review the real thing. Every purchase is listed here.</p></header>
    <div className="budget-figures">
      <div><span className="label">Spent</span><b className="coin">{formatEuros(budget.spentCents)}</b></div>
      <div><span className="label">Left</span><b>{formatEuros(budget.leftCents)}</b></div>
      <div><span className="label">Purchases</span><b>{count}</b></div>
    </div>
    <BudgetMeter budget={budget} link={false} />
    <section className="receipt" aria-labelledby="receipt-title">
      <h2 id="receipt-title" className="label">Receipt</h2>
      {count ? <table>
        <thead><tr><th scope="col">Week</th><th scope="col">Product</th><th scope="col" className="amount">Amount</th></tr></thead>
        <tbody>{budget.purchases.map((purchase, index) => <tr key={index}>
          <td>{formatWeekRange(purchase.weekStartsOn)}</td>
          <td>{purchase.slug ? <Link href={`/projects/${purchase.slug}`}>{purchase.name} →</Link> : <>{purchase.name} <span className="fact-note">review coming</span></>}</td>
          <td className="amount">{formatEuros(purchase.costCents)}</td>
        </tr>)}</tbody>
        <tfoot><tr><th scope="row" colSpan={2}>Total spent</th><td className="amount">{formatEuros(budget.spentCents)}</td></tr></tfoot>
      </table> : <p className="empty">Nothing bought yet. The first paid plan will show up here.</p>}
      <p className="fact-note">Amounts are in euros. Purchases in other currencies are converted at the rate on the day I paid.</p>
    </section>
  </div>;
}
