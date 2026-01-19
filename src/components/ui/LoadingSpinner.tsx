interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Загрузка...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin`} />
      </div>
      <p className="text-zinc-500 mt-6 animate-pulse">{message}</p>
    </div>
  );
}
