import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * 加载状态组件
 */
export default function LoadingState() {
  return (
    <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">正在加载代币数据...</p>
    </Card>
  );
} 