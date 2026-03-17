import { Suspense } from "react";
import FoodBuilder from "../components/FoodBuilder";

export default function DashboardPage() {
  return (
    <Suspense>
      <FoodBuilder />
    </Suspense>
  );
}
