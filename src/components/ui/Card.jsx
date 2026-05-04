export default function Card({ className = "", children }) {
  return <section className={`glass-panel rounded-lg p-4 sm:p-6 ${className}`}>{children}</section>;
}
