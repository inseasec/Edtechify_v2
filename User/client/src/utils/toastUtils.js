import toast from "react-hot-toast";

export function showSuccessToast(message) {
  toast.success(message);
}

export function showErrorToast(message) {
  const text =
    typeof message === "string"
      ? message
      : message?.message
        ? String(message.message)
        : "Something went wrong";
  toast.error(text);
}
