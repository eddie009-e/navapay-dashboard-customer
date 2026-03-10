import { Loader2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
      <div className="animate-spin">
        <Loader2 className="w-10 h-10 text-primary" />
      </div>
    </div>
  );
}
