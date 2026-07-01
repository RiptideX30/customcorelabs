import { createFileRoute } from "@tanstack/react-router";
import App from "@/components/App";
import { z } from "zod";

const searchSchema = z.object({
  path: z.string().optional(),
  tier: z.enum(["esports", "apex", "horizon"]).optional(),
});

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: (search) => searchSchema.parse(search),
});
