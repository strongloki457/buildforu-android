export default function Button({
  className = "",
  children,
  variant = "primary",
  type = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white shadow-lg shadow-brand-900/20 hover:-translate-y-0.5",
    secondary: "bg-white/80 text-slate-700 hover:bg-white",
    ghost: "bg-white/10 text-slate-700 hover:bg-white/70"
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm transition duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
