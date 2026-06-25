import type { Metadata } from "next";
import { PollBuilder } from "./_components/PollBuilder";

export const metadata: Metadata = {
  title: "Create New Poll | Poll Precision",
  description: "Design your poll and configure settings before publishing.",
};

export default function BuilderPage() {
  return <PollBuilder />;
}
