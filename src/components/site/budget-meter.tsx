import Link from "next/link";
import { formatEuros } from "@/lib/site";

export type Budget = { totalCents: number; spentCents: number; leftCents: number; purchases: unknown[] };
const cells = 40;

export function BudgetMeter({ budget, link = true }: { budget: Budget; link?: boolean }) {
  // Any spend shows at least one coin, so a small first purchase is still visible.
  const filled = budget.spentCents ? Math.max(1, Math.round(budget.spentCents / budget.totalCents * cells)) : 0;
  const percent = (budget.spentCents / budget.totalCents * 100).toLocaleString("en", { maximumFractionDigits: 1 });
  return <div className="budget-meter">
    <span className="label coin">Budget</span>
    <div className="meter" role="img" aria-label={`${percent}% of the ${formatEuros(budget.totalCents)} budget spent`}>{Array.from({ length: cells }, (_, i) => <i key={i} className={i < filled ? "on" : undefined} />)}</div>
    <span className="label num">{formatEuros(budget.spentCents)} spent · {formatEuros(budget.leftCents)} left</span>
    {link && <Link className="label meter-link" href="/budget">Every purchase →</Link>}
  </div>;
}
