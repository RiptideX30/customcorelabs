import { createFileRoute } from '@tanstack/react-router';
import IntakeForm from '@/components/IntakeForm';

export const Route = createFileRoute('/start-a-project')({
  component: IntakeForm,
});
