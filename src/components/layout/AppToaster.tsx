import { CircleCheck, OctagonX } from "lucide-react";
import {
  Toast,
  ToastContent,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  useToastManager,
} from "@/components/ui/toast";

function ToastList() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast
      key={item.id}
      toast={item}
      className="rounded-[9px] border-0 bg-[#182539] text-white shadow-[0_6px_22px_#172a4526]"
    >
      <ToastContent className="gap-[9px] px-[18px] py-3">
        {item.type === "error" ? (
          <OctagonX size={17} strokeWidth={1.7} />
        ) : (
          <CircleCheck size={17} strokeWidth={1.7} />
        )}
        <ToastTitle className="text-xs leading-relaxed font-normal" />
      </ToastContent>
    </Toast>
  ));
}

/** Bottom-centered toast stack; add messages from anywhere via `toast.add()`. */
export default function AppToaster() {
  return (
    <ToastProvider toastManager={toast} timeout={3000}>
      <ToastPortal>
        <ToastViewport className="sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
