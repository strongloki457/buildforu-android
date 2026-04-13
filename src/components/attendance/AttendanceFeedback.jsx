export default function AttendanceFeedback({ feedback, fallback }) {
  if (!feedback) {
    return <p className="mt-5 text-sm text-slate-500">{fallback}</p>;
  }

  return (
    <div
      className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
        feedback.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {feedback.text}
    </div>
  );
}
