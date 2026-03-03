"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WorkOrderDto } from "@/lib/api"
import { cn } from "@/lib/utils"

function getStatusColor(status: string | null) {
  switch (status) {
    case "New":
    case "Mới":
      return "bg-chart-3/15 text-chart-3 border-chart-3/30"
    case "InProgress":
    case "Đang sản xuất":
      return "bg-chart-1/15 text-chart-1 border-chart-1/30"
    case "Completed":
    case "Đã hoàn thành":
      return "bg-success/15 text-success border-success/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "New": return "Moi"
    case "InProgress": return "Dang SX"
    case "Completed": return "Hoan thanh"
    default: return status || "N/A"
  }
}

export function RecentOrders({ orders }: { orders: WorkOrderDto[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Lenh san xuat gan day</CardTitle>
        <CardDescription>Danh sach cac lenh san xuat moi nhat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chua co lenh san xuat nao
            </p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div
                key={order.workOrderId}
                className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/50"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {order.woNumber || `WO-${order.workOrderId}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {order.productCode} - {order.lineName || order.lineCode || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    {order.actualQty}/{order.plannedQty}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getStatusColor(order.status))}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
