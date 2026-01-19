import { Instructions } from "@/components/instructions/Instructions";

interface InstructionsStepProps {
  onBack?: () => void;
}

export function InstructionsStep({ onBack }: InstructionsStepProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-1">Инструкции по подключению</h1>
        <p className="text-zinc-400 text-sm">Выберите ваше устройство и следуйте инструкциям</p>
      </div>

      <Instructions />
    </div>
  );
}
