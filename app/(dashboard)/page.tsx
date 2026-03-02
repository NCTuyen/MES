"use client"

import { useEffect, useState } from "react"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ProductionChart } from "@/components/dashboard/production-chart"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { getHourlyProduction, type WorkOrderDto, type HourlyProductionDto } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// Mock work orders (no GET /workorders endpoint in API)
const mockOrders: WorkOrderDto[] = [
  { workOrderId: 1, woNumber: "WO-001", productCode: "SP-A100", productName: "Thanh nhom A100", lineCode: "L1", lineName: "Chuyen 1", shiftName: "Ca 1", plannedQty: 500, actualQty: 320, scrapQty: 5, status: "Producing", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-02T06:00:00Z", actualEndAt: null, remark: null, createdAt: "2026-03-02T06:00:00Z" },
  { workOrderId: 2, woNumber: "WO-002", productCode: "SP-B200", productName: "Oc vit B200", lineCode: "L2", lineName: "Chuyen 2", shiftName: "Ca 1", plannedQty: 300, actualQty: 0, scrapQty: 0, status: "New", plannedStartAt: null, plannedEndAt: null, actualStartAt: null, actualEndAt: null, remark: null, createdAt: "2026-03-02T07:00:00Z" },
  { workOrderId: 3, woNumber: "WO-003", productCode: "SP-C150", productName: "Gioang C150", lineCode: "L1", lineName: "Chuyen 1", shiftName: "Ca 2", plannedQty: 750, actualQty: 750, scrapQty: 12, status: "Completed", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-01T14:00:00Z", actualEndAt: "2026-03-01T21:30:00Z", remark: null, createdAt: "2026-03-01T14:00:00Z" },
  { workOrderId: 4, woNumber: "WO-004", productCode: "SP-D300", productName: "Bu lon D300", lineCode: "L3", lineName: "Chuyen 3", shiftName: "Ca 1", plannedQty: 200, actualQty: 85, scrapQty: 2, status: "Producing", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-02T08:00:00Z", actualEndAt: null, remark: null, createdAt: "2026-03-02T08:00:00Z" },
  { workOrderId: 5, woNumber: "WO-005", productCode: "SP-E250", productName: "Long den E250", lineCode: "L2", lineName: "Chuyen 2", shiftName: "Ca 2", plannedQty: 400, actualQty: 0, scrapQty: 0, status: "New", plannedStartAt: null, plannedEndAt: null, actualStartAt: null, actualEndAt: null, remark: null, createdAt: "2026-03-02T09:00:00Z" },
]

const mockHourlyData = [
  { hour: "06:00", output: 120, target: 150 },
  { hour: "07:00", output: 145, target: 150 },
  { hour: "08:00", output: 160, target: 150 },
  { hour: "09:00", output: 138, target: 150 },
  { hour: "10:00", output: 155, target: 150 },
  { hour: "11:00", output: 142, target: 150 },
  { hour: "12:00", output: 80, target: 150 },
  { hour: "13:00", output: 148, target: 150 },
  { hour: "14:00", output: 165, target: 150 },
  { hour: "15:00", output: 152, target: 150 },
  { hour: "16:00", output: 140, target: 150 },
  { hour: "17:00", output: 130, target: 150 },
]

export default function DashboardPage() {
  const [orders] = useState<WorkOrderDto[]>(mockOrders)
  const [hourlyData, setHourlyData] = useState(mockHourlyData)
  const [loading, setLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<"loading" | "live" | "mock">("loading")

  useEffect(() => {
    async function fetchHourly() {
      try {
        // Try fetching hourly production for WO 1 from the real API
        const res = await getHourlyProduction(1)
        if (res.success && res.data && res.data.length > 0) {
          setHourlyData(
            res.data.map((d: HourlyProductionDto) => ({
              hour: d.hour || "",
              output: d.goodQty,
              target: 150, // default target per hour
            }))
          )
          setApiStatus("live")
        } else {
          setApiStatus("mock")
        }
      } catch {
        setApiStatus("mock")
      } finally {
        setLoading(false)
      }
    }
    fetchHourly()
  }, [])

  const activeOrders = orders.filter((o) => o.status === "Producing").length
  const totalOutput = hourlyData.reduce((sum, h) => sum + h.output, 0)
  const totalTarget = hourlyData.reduce((sum, h) => sum + h.target, 0)
  const efficiency = totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-[400px] lg:col-span-3" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Bang dieu khien
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tong quan tinh hinh san xuat hom nay
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${apiStatus === "live" ? "bg-success/15 text-success" : "bg-chart-3/15 text-chart-3"}`}>
          {apiStatus === "live" ? "API Live" : "Mock Data"}
        </span>
      </div>

      <KPICards
        data={{
          totalOutput,
          target: totalTarget,
          efficiency,
          activeOrders,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProductionChart data={hourlyData} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrders orders={orders} />
        </div>
      </div>
    </div>
  )
}
