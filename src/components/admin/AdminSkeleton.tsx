function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-foreground/10 ${className}`} />;
}

export function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between">
        <Bar className="h-9 w-32" />
        <Bar className="h-5 w-40" />
      </div>
      <Bar className="mt-8 h-8 w-full" />
      <div className="mt-4 space-y-4">
        <Bar className="h-14 w-full" />
        <Bar className="h-14 w-full" />
        <Bar className="h-14 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Bar className="h-4 w-28" />
          <Bar className="h-10 w-full" />
        </div>
      ))}
      <Bar className="h-40 w-full" />
    </div>
  );
}
