'use client';
export default function AdBox({ slotId }: { slotId?: string }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/5 text-center text-sm text-muted-foreground">
      {/* Replace with your Google AdSense code or component */}
      <div style={{minHeight: 90}} className="flex items-center justify-center">
        <span>Ad placeholder — replace with AdSense</span>
      </div>
    </div>
  );
}
