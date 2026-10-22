import Brief from "../../Brief";
import { brief, archiveIds } from "../../../lib/briefs";
export const dynamicParams = false;
export function generateStaticParams() {
  return archiveIds().map((id) => ({ id }));
}
export default async function Page({ params }) {
  const { id } = await params;
  return <><p className="archived"><a href="/">← Latest brief</a> · Archived edition</p><Brief brief={brief(id)} archive={archiveIds()} /></>;
}
