export type ToastTone = "success" | "error";
export type ToastKind = "success" | "failure" | "timeout";

export interface FeedbackToast {
  id: string;
  title: string;
  description: string;
  tone: ToastTone;
  kind: ToastKind;
}
