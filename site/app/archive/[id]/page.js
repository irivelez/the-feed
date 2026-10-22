import Brief from "../../Brief";
import { brief, archiveIds } from "../../../lib/api";
export const dynamicParams = false;
export function generateStaticParams() {
  return archiveIds().map((id) => ({ id }));
}
export default async function Page({ params }) {
  const { id } = await params;
  return <Brief brief={brief(id)} archived />;
}
