"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export function WOTable({ orders }: { orders: WorkOrderDto[] }) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Ma WO</TableHead>
            <TableHead className="font-semibold">San pham</TableHead>
            <TableHead className="font-semibold text-right">KH</TableHead>
            <TableHead className="font-semibold text-right">Thuc te</TableHead>
            <TableHead className="font-semibold">Ca</TableHead>
            <TableHead className="font-semibold">Chuyen</TableHead>
            <TableHead className="font-semibold">Trang thai</TableHead>
            <TableHead className="font-semibold">Ngay tao</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Chua co lenh san xuat nao
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.workOrderId} className="transition-colors">
                <TableCell className="font-mono text-sm font-medium">
                  {order.woNumber || `WO-${order.workOrderId}`}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.productCode || "N/A"}</span>
                    {order.productName && (
                      <span className="text-xs text-muted-foreground">{order.productName}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {order.plannedQty.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {order.actualQty.toLocaleString()}
                </TableCell>
                <TableCell>{order.shiftName || "N/A"}</TableCell>
                <TableCell>{order.lineName || order.lineCode || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getStatusColor(order.status))}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
