import "./globals.css";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <Toaster richColors position="top-right" />
    </div>
  );
}
