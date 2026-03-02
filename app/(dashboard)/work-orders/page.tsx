"use client"

import { useState, useCallback, useEffect } from "react"
import { type WorkOrderDto, getWorkOrders } from "@/lib/api"
import { WOTable } from "@/components/work-orders/wo-table"
import { CreateWODialog } from "@/components/work-orders/create-wo-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Initial mock data for display; real data is loaded via GET /workorders when available.
// New WOs created via the API (POST /workorders) will trigger a refetch.
const initialOrders: WorkOrderDto[] = [
  { workOrderId: 1, woNumber: "WO-001", productCode: "SP-A100", productName: "Thanh nhom A100", lineCode: "L1", lineName: "Chuyen 1", shiftName: "Ca 1", plannedQty: 500, actualQty: 320, scrapQty: 5, status: "Producing", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-02T06:00:00Z", actualEndAt: null, remark: null, createdAt: "2026-03-02T06:00:00Z" },
  { workOrderId: 2, woNumber: "WO-002", productCode: "SP-B200", productName: "Oc vit B200", lineCode: "L2", lineName: "Chuyen 2", shiftName: "Ca 1", plannedQty: 300, actualQty: 0, scrapQty: 0, status: "New", plannedStartAt: null, plannedEndAt: null, actualStartAt: null, actualEndAt: null, remark: null, createdAt: "2026-03-02T07:00:00Z" },
  { workOrderId: 3, woNumber: "WO-003", productCode: "SP-C150", productName: "Gioang C150", lineCode: "L1", lineName: "Chuyen 1", shiftName: "Ca 2", plannedQty: 750, actualQty: 750, scrapQty: 12, status: "Completed", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-01T14:00:00Z", actualEndAt: "2026-03-01T21:30:00Z", remark: null, createdAt: "2026-03-01T14:00:00Z" },
  { workOrderId: 4, woNumber: "WO-004", productCode: "SP-D300", productName: "Bu lon D300", lineCode: "L3", lineName: "Chuyen 3", shiftName: "Ca 1", plannedQty: 200, actualQty: 85, scrapQty: 2, status: "Producing", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-03-02T08:00:00Z", actualEndAt: null, remark: null, createdAt: "2026-03-02T08:00:00Z" },
  { workOrderId: 5, woNumber: "WO-005", productCode: "SP-E250", productName: "Long den E250", lineCode: "L2", lineName: "Chuyen 2", shiftName: "Ca 2", plannedQty: 400, actualQty: 0, scrapQty: 0, status: "New", plannedStartAt: null, plannedEndAt: null, actualStartAt: null, actualEndAt: null, remark: null, createdAt: "2026-03-02T09:00:00Z" },
  { workOrderId: 6, woNumber: "WO-006", productCode: "SP-F180", productName: "Dai oc F180", lineCode: "L4", lineName: "Chuyen 4", shiftName: "Ca 3", plannedQty: 600, actualQty: 600, scrapQty: 8, status: "Completed", plannedStartAt: null, plannedEndAt: null, actualStartAt: "2026-02-28T22:00:00Z", actualEndAt: "2026-03-01T05:30:00Z", remark: null, createdAt: "2026-02-28T22:00:00Z" },
]

function isStatus(status: string | null, match: string) {
  if (!status) return false
  return status === match
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrderDto[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getWorkOrders()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch work orders", err)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleCreated = useCallback(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => {
        if (activeTab === "new") return isStatus(o.status, "New")
        if (activeTab === "producing") return isStatus(o.status, "InProgress")
        if (activeTab === "completed") return isStatus(o.status, "Completed")
        return true
      })

  const counts = {
    all: orders.length,
    new: orders.filter((o) => isStatus(o.status, "New")).length,
    producing: orders.filter((o) => isStatus(o.status, "InProgress")).length,
    completed: orders.filter((o) => isStatus(o.status, "Completed")).length,
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Lenh san xuat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quan ly toan bo lenh san xuat (Work Orders)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            POST /workorders
          </Badge>
          <CreateWODialog onCreated={handleCreated} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tat ca ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="new">
            Moi ({counts.new})
          </TabsTrigger>
          <TabsTrigger value="producing">
            Dang SX ({counts.producing})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Hoan thanh ({counts.completed})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <WOTable orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
