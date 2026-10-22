import Brief from "./Brief";
import { latest, archiveIds } from "../lib/briefs";
export default function Home() {
  return <Brief brief={latest()} archive={archiveIds()} />;
}
