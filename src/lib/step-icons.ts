"use client";
import {
  type LucideIcon,
  ClipboardPlus,
  CheckCircle,
  Truck,
  Wrench,
  PackageCheck,
  ShoppingCart,
  Archive,
  Component,
  ClipboardCheck,
  Search,
} from "lucide-react";

export const STEP_ICONS: Record<string, LucideIcon> = {
  "Build Created": ClipboardPlus,
  "Build Complete": CheckCircle,
  "Received for Service": Truck,
  Diagnostics: Search,
  Repair: Wrench,
  "Ready for Pickup": PackageCheck,
  "Parts Ordered": ShoppingCart,
  "Parts Received": Archive,
  Assembly: Component,
  Validation: ClipboardCheck,
};
