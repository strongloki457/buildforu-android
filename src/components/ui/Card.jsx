export default function Card({ className = "", children }) {
  return <section className={`glass-panel rounded-[28px] p-6 ${className}`}>{children}</section>;
}
