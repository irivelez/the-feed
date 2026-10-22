import Brief from "./Brief";
import { latest } from "../lib/api";
export default function Home() {
  return <Brief brief={latest()} />;
}
