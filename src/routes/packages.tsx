import { createFileRoute } from '@tanstack/react-router';
import SignaturePackages from '@/components/SignaturePackages';

export const Route = createFileRoute('/packages')({
  component: SignaturePackages,
});
