"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Target, TrendingUp, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIData {
  totalOutput: number
  target: number
  efficiency: number
  activeOrders: number
}

export function KPICards({ data }: { data: KPIData }) {
  const cards = [
    {
      title: "Tong san luong",
      value: data.totalOutput.toLocaleString(),
      unit: "san pham",
      icon: Package,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Muc tieu",
      value: data.target.toLocaleString(),
      unit: "san pham",
      icon: Target,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Hieu suat",
      value: `${data.efficiency}%`,
      unit: data.efficiency >= 90 ? "Xuat sac" : data.efficiency >= 70 ? "Dat" : "Can cai thien",
      icon: TrendingUp,
      color: data.efficiency >= 90 ? "text-success" : data.efficiency >= 70 ? "text-chart-3" : "text-destructive",
      bgColor: data.efficiency >= 90 ? "bg-success/10" : data.efficiency >= 70 ? "bg-chart-3/10" : "bg-destructive/10",
    },
    {
      title: "Lenh dang chay",
      value: data.activeOrders.toString(),
      unit: "lenh san xuat",
      icon: ClipboardList,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("flex size-9 items-center justify-center rounded-lg", card.bgColor)}>
              <card.icon className={cn("size-5", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
