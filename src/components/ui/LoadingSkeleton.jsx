export function SkeletonBlock({ className = "" }) {
  return <div className={`shimmer rounded-2xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <SkeletonBlock className="h-52" />
        <SkeletonBlock className="h-72" />
      </div>
      <div className="space-y-6">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-80" />
      </div>
    </div>
  );
}
