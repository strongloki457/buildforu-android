import { memo } from "react";

const Card = memo(function Card({ className = "", children }) {
  return <section className={`glass-panel min-w-0 rounded-lg p-3 sm:p-6 ${className}`}>{children}</section>;
});

export default Card;
