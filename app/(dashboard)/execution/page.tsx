"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Play,
  CheckCircle2,
  ScanBarcode,
  Loader2,
  Package,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import {
  startWorkOrder,
  completeWorkOrder,
  scanMaterial,
  getHourlyProduction,
  type WorkOrderDto,
  type MaterialInputDto,
  type HourlyProductionDto,
  getWorkOrders,
} from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const chartConfig = {
  goodQty: {
    label: "San luong tot",
    color: "var(--color-chart-1)",
  },
  scrapQty: {
    label: "Phe pham",
    color: "var(--color-destructive)",
  },
} satisfies ChartConfig

// Mock WO data (no GET /workorders in API)

const mockHourlyData = [
  { hour: "06:00", goodQty: 120, scrapQty: 3, eventCount: 2 },
  { hour: "07:00", goodQty: 145, scrapQty: 1, eventCount: 1 },
  { hour: "08:00", goodQty: 160, scrapQty: 2, eventCount: 0 },
  { hour: "09:00", goodQty: 138, scrapQty: 4, eventCount: 1 },
  { hour: "10:00", goodQty: 155, scrapQty: 0, eventCount: 0 },
  { hour: "11:00", goodQty: 142, scrapQty: 2, eventCount: 1 },
  { hour: "12:00", goodQty: 80, scrapQty: 1, eventCount: 3 },
  { hour: "13:00", goodQty: 148, scrapQty: 1, eventCount: 0 },
  { hour: "14:00", goodQty: 165, scrapQty: 0, eventCount: 0 },
]

export default function ExecutionPage() {
  const [orders, setOrders] = useState<WorkOrderDto[]>([])
  const [selectedWO, setSelectedWO] = useState<string>("")
  const [materialCode, setMaterialCode] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [scanning, setScanning] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [scannedMaterials, setScannedMaterials] = useState<MaterialInputDto[]>([])
  const [hourlyData, setHourlyData] = useState<any[]>(mockHourlyData)
  const [apiStatus, setApiStatus] = useState<"live" | "mock">("mock")

  const activeOrders = orders.filter(
    (o) => o.status === "New" || o.status === "InProgress"
  )
  const currentOrder = orders.find((o) => o.workOrderId.toString() === selectedWO)

  // Fetch hourly production from real API when WO is selected
  const fetchHourly = useCallback(async (woId: number) => {
    try {
      const res = await getHourlyProduction(woId)
      if (res.success && res.data && res.data.length > 0) {
        setHourlyData(res.data)
        setApiStatus("live")
      } else {
        setHourlyData(mockHourlyData)
        setApiStatus("mock")
      }
    } catch {
      setHourlyData(mockHourlyData)
      setApiStatus("mock")
    }
  }, [])

  useEffect(() => {
    if (selectedWO) {
      fetchHourly(parseInt(selectedWO))
    }
  }, [selectedWO, fetchHourly])

  // POST /workorders/start
  async function handleStart() {
    if (!selectedWO || !currentOrder) return
    setActionLoading("start")
    try {
      const res = await startWorkOrder({
        workOrderId: currentOrder.workOrderId,
        operatorName: "To truong",
      })
      if (res.success) {
        toast.success(`Da bat dau ${res.data?.woNumber || currentOrder.woNumber}!`)
        setOrders((prev) =>
          prev.map((o) =>
            o.workOrderId.toString() === selectedWO
              ? { ...o, status: "InProgress", actualStartAt: new Date().toISOString() }
              : o
          )
        )
      } else {
        toast.error(res.message || "Khong the bat dau WO")
      }
    } catch (err) {
      toast.warning(`API loi - cap nhat local: ${err instanceof Error ? err.message : ""}`)
      setOrders((prev) =>
        prev.map((o) =>
          o.workOrderId.toString() === selectedWO
            ? { ...o, status: "InProgress", actualStartAt: new Date().toISOString() }
            : o
        )
      )
    } finally {
      setActionLoading(null)
    }
  }

  // POST /workorders/complete
  async function handleComplete() {
    if (!selectedWO || !currentOrder) return
    setActionLoading("complete")
    try {
      const res = await completeWorkOrder({
        workOrderId: currentOrder.workOrderId,
      })
      if (res.success) {
        toast.success(`Da hoan thanh ${res.data?.woNumber || currentOrder.woNumber}!`)
        setOrders((prev) =>
          prev.map((o) =>
            o.workOrderId.toString() === selectedWO
              ? { ...o, status: "Completed", actualEndAt: new Date().toISOString() }
              : o
          )
        )
        setSelectedWO("")
      } else {
        toast.error(res.message || "Khong the hoan thanh WO")
      }
    } catch (err) {
      toast.warning(`API loi - cap nhat local: ${err instanceof Error ? err.message : ""}`)
      setOrders((prev) =>
        prev.map((o) =>
          o.workOrderId.toString() === selectedWO
            ? { ...o, status: "Completed", actualEndAt: new Date().toISOString() }
            : o
        )
      )
      setSelectedWO("")
    } finally {
      setActionLoading(null)
    }
  }

  // POST /material/scan
  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!materialCode || !selectedWO || !currentOrder) return
    setScanning(true)
    try {
      const res = await scanMaterial({
        workOrderId: currentOrder.workOrderId,
        materialCode: materialCode,
        materialName: 'Name of ' + materialCode,
        lotNumber: lotNumber || undefined,
        actualQty: 1,
        plannedQty: currentOrder?.plannedQty || 1,
        unit: "pc",
        inputBy: "operator",
      })
      if (res.success && res.data) {
        toast.success(`Da quet thanh cong: ${res.data.materialCode || materialCode}`)
        setScannedMaterials((prev) => [res.data, ...prev])
      } else {
        toast.error(res.message || "Quet that bai")
      }
    } catch (err) {
      toast.warning(`API loi - luu local: ${err instanceof Error ? err.message : ""}`)
      // Fallback: add to local state
      const mockResult: MaterialInputDto = {
        materialInputId: Date.now(),
        workOrderId: currentOrder.workOrderId,
        woNumber: currentOrder.woNumber,
        materialCode: materialCode,
        materialName: null,
        lotNumber: lotNumber || null,
        batchNumber: null,
        supplier: null,
        actualQty: 1,
        unit: "pc",
        inputAt: new Date().toISOString(),
        inputBy: "operator",
      }
      setScannedMaterials((prev) => [mockResult, ...prev])
    }
    setMaterialCode("")
    setLotNumber("")
    setScanning(false)
  }

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

  const totalGood = hourlyData.reduce((sum, h) => sum + h.goodQty, 0)
  const totalScrap = hourlyData.reduce((sum, h) => sum + h.scrapQty, 0)
  const targetPerHour = 150
  const totalTarget = hourlyData.length * targetPerHour

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Thuc thi san xuat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Giao dien danh cho To truong - Quan ly va thao tac truc tiep
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${apiStatus === "live" ? "bg-success/15 text-success" : "bg-chart-3/15 text-chart-3"}`}>
          {apiStatus === "live" ? "API Live" : "Mock Data"}
        </span>
      </div>

      {/* WO Selection + Action Buttons */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Chon lenh san xuat</CardTitle>
            <CardDescription>Chon WO dang hoat dong de thao tac</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select value={selectedWO} onValueChange={setSelectedWO}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Chon lenh san xuat..." />
              </SelectTrigger>
              <SelectContent>
                {activeOrders.map((order) => (
                  <SelectItem key={order.workOrderId} value={order.workOrderId.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{order.woNumber}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{order.productCode}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentOrder && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">San pham:</span>
                  <span className="text-sm font-medium">{currentOrder.productCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ten:</span>
                  <span className="text-sm font-medium">{currentOrder.productName || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">KH / Thuc te:</span>
                  <span className="text-sm font-mono font-medium">{currentOrder.actualQty}/{currentOrder.plannedQty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chuyen:</span>
                  <span className="text-sm font-medium">{currentOrder.lineName || currentOrder.lineCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trang thai:</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      currentOrder.status === "InProgress"
                        ? "bg-chart-1/15 text-chart-1 border-chart-1/30"
                        : "bg-chart-3/15 text-chart-3 border-chart-3/30"
                    )}
                  >
                    {currentOrder.status === "InProgress" ? "Dang SX" : "Moi"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Large Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                className="h-16 text-lg gap-2 bg-chart-1 hover:bg-chart-1/90 text-primary-foreground"
                disabled={!selectedWO || currentOrder?.status === "InProgress" || actionLoading !== null}
                onClick={handleStart}
              >
                {actionLoading === "start" ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Play className="size-6" />
                )}
                Bat dau
              </Button>
              <Button
                size="lg"
                className="h-16 text-lg gap-2 bg-success hover:bg-success/90 text-success-foreground"
                disabled={!selectedWO || currentOrder?.status !== "InProgress" || actionLoading !== null}
                onClick={handleComplete}
              >
                {actionLoading === "complete" ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-6" />
                )}
                Hoan thanh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Material Scanning */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScanBarcode className="size-5" />
              Quet ma nguyen lieu
            </CardTitle>
            <CardDescription>
              POST /material/scan - Quet ma QR hoac nhap ma Lot nguyen lieu
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!selectedWO ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <AlertCircle className="size-8" />
                <p className="text-sm">Vui long chon lenh san xuat truoc</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleScan} className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="materialCode" className="sr-only">Ma nguyen lieu</Label>
                      <Input
                        id="materialCode"
                        placeholder="Ma nguyen lieu (materialCode)..."
                        value={materialCode}
                        onChange={(e) => setMaterialCode(e.target.value)}
                        className="h-12 text-base font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="w-48">
                      <Label htmlFor="lotNumber" className="sr-only">So Lot</Label>
                      <Input
                        id="lotNumber"
                        placeholder="Lot number..."
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                        className="h-12 text-base font-mono"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 gap-2 px-6"
                      disabled={!materialCode || scanning}
                    >
                      {scanning ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ScanBarcode className="size-4" />
                      )}
                      Quet
                    </Button>
                  </div>
                </form>

                <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
                    <span>Nguyen lieu da quet ({scannedMaterials.length})</span>
                  </div>
                  {scannedMaterials.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-6 border border-dashed border-border rounded-lg">
                      Chua co nguyen lieu nao duoc quet
                    </div>
                  ) : (
                    scannedMaterials.map((m) => (
                      <div
                        key={m.materialInputId}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="size-4 text-chart-1" />
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium">{m.materialCode}</span>
                            {m.lotNumber && (
                              <span className="text-xs text-muted-foreground">Lot: {m.lotNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono">{m.actualQty} {m.unit}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(m.inputAt).toLocaleTimeString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Production Monitoring */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="grid grid-cols-3 gap-4 lg:col-span-1 lg:grid-cols-1">
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
              <Package className="size-6 text-chart-1 mb-1" />
              <span className="text-2xl font-bold font-mono">{totalGood.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">San luong tot</span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
              <Target className="size-6 text-chart-2 mb-1" />
              <span className="text-2xl font-bold font-mono">{totalScrap.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Phe pham</span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
              <TrendingUp className="size-6 text-success mb-1" />
              <span className="text-2xl font-bold font-mono">
                {totalTarget > 0 ? Math.round((totalGood / totalTarget) * 100) : 0}%
              </span>
              <span className="text-xs text-muted-foreground">Hieu suat</span>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              San luong theo gio
              {selectedWO && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (GET /production/hourly?woid={selectedWO})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={hourlyData} accessibilityLayer>
                <defs>
                  <linearGradient id="fillGood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-goodQty)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-goodQty)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="goodQty"
                  fill="url(#fillGood)"
                  stroke="var(--color-goodQty)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
