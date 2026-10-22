import Brief from "./Brief";
import { latest, narrative } from "../lib/api";
export default function Home() {
  return <Brief brief={latest()} narrative={narrative()} />;
}
