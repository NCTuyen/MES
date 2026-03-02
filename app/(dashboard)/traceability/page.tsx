"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  Package,
  ClipboardList,
  Clock,
  MapPin,
  Layers,
  ScanBarcode,
  AlertTriangle,
} from "lucide-react"
import {
  traceProduct,
  type ProductTraceDto,
  type WorkOrderTraceDto,
  type MaterialSummaryDto,
  type ProductionEventDto,
} from "@/lib/api"
import { toast } from "sonner"

// Mock trace data (used when API fails)
const mockTraceData: ProductTraceDto = {
  productCode: "SP-A100",
  productName: "Thanh nhom A100",
  workOrders: [
    {
      workOrderId: 1,
      woNumber: "WO-001",
      status: "Producing",
      lineCode: "L1",
      lineName: "Chuyen 1",
      shiftName: "Ca 1",
      actualStartAt: "2026-03-02T06:00:00Z",
      actualEndAt: null,
      actualQty: 320,
      scrapQty: 5,
      materials: [
        { materialInputId: 1, materialCode: "NL-001", materialName: "Thanh nhom 6061", lotNumber: "LOT-NL-001", supplier: "NCC Nhom Viet", actualQty: 100, unit: "kg", inputAt: "2026-03-02T06:15:00Z" },
        { materialInputId: 2, materialCode: "NL-002", materialName: "Oc vit M8", lotNumber: "LOT-NL-002", supplier: "NCC Thep Hoa Phat", actualQty: 500, unit: "pc", inputAt: "2026-03-02T06:20:00Z" },
        { materialInputId: 3, materialCode: "NL-003", materialName: "Gioang cao su", lotNumber: "LOT-NL-003", supplier: "NCC Cao su Binh Duong", actualQty: 300, unit: "pc", inputAt: "2026-03-02T06:25:00Z" },
      ],
      events: [
        { productionLogId: 1, logTime: "2026-03-02T08:30:00Z", eventType: "Production", goodQty: 50, scrapQty: 1, serialNumber: "SN-001", operatorName: "Nguyen Van A", stationCode: "ST-01", failureCode: null, remark: null },
        { productionLogId: 2, logTime: "2026-03-02T09:45:00Z", eventType: "QC Check", goodQty: 0, scrapQty: 2, serialNumber: null, operatorName: "Tran Thi B", stationCode: "QC-01", failureCode: "SCRATCH", remark: "Xay xat be mat" },
      ],
    },
    {
      workOrderId: 3,
      woNumber: "WO-003",
      status: "Completed",
      lineCode: "L1",
      lineName: "Chuyen 1",
      shiftName: "Ca 2",
      actualStartAt: "2026-03-01T14:00:00Z",
      actualEndAt: "2026-03-01T21:30:00Z",
      actualQty: 750,
      scrapQty: 12,
      materials: [
        { materialInputId: 4, materialCode: "NL-001", materialName: "Thanh nhom 6061", lotNumber: "LOT-NL-004", supplier: "NCC Nhom Viet", actualQty: 200, unit: "kg", inputAt: "2026-03-01T14:10:00Z" },
      ],
      events: [],
    },
  ],
}

function TimelineItem({
  icon: Icon,
  title,
  description,
  time,
  isLast,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  time: string
  isLast?: boolean
  color: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex size-10 items-center justify-center rounded-full ${color} shrink-0`}>
          <Icon className="size-5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
      </div>
      <div className="flex flex-col gap-1 pb-6">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
        <span className="text-xs text-muted-foreground/70">
          {new Date(time).toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  )
}

function WOTraceCard({ wo }: { wo: WorkOrderTraceDto }) {
  const materials = wo.materials || []
  const events = wo.events || []
  const totalTimelineItems = 1 + materials.length + events.length + 1 // WO header + materials + events + location
  let itemIndex = 0

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-chart-1" />
              {wo.woNumber || `WO-${wo.workOrderId}`}
              <Badge variant="outline" className="font-mono text-xs">
                ID: {wo.workOrderId}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {wo.lineName || wo.lineCode} | {wo.shiftName || "N/A"} | SL: {wo.actualQty} (Phe: {wo.scrapQty})
            </CardDescription>
          </div>
          <Badge className={
            wo.status === "Completed"
              ? "bg-success/15 text-success border-success/30"
              : wo.status === "Producing"
                ? "bg-chart-1/15 text-chart-1 border-chart-1/30"
                : "bg-chart-3/15 text-chart-3 border-chart-3/30"
          }>
            {wo.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {/* WO Start */}
          <TimelineItem
            icon={ClipboardList}
            title={`Bat dau san xuat ${wo.woNumber}`}
            description={`${wo.lineName || wo.lineCode}, ${wo.shiftName || "N/A"}`}
            time={wo.actualStartAt || wo.actualEndAt || new Date().toISOString()}
            color="bg-chart-1/15 text-chart-1"
            isLast={++itemIndex >= totalTimelineItems}
          />

          {/* Materials */}
          {materials.map((mat: MaterialSummaryDto) => (
            <TimelineItem
              key={mat.materialInputId}
              icon={ScanBarcode}
              title={`Nguyen lieu: ${mat.materialName || mat.materialCode}`}
              description={`Lo: ${mat.lotNumber || "N/A"} | NCC: ${mat.supplier || "N/A"} | SL: ${mat.actualQty} ${mat.unit || ""}`}
              time={mat.inputAt}
              color="bg-chart-3/15 text-chart-3"
              isLast={++itemIndex >= totalTimelineItems}
            />
          ))}

          {/* Production Events */}
          {events.map((evt: ProductionEventDto) => (
            <TimelineItem
              key={evt.productionLogId}
              icon={evt.failureCode ? AlertTriangle : Package}
              title={`${evt.eventType || "Event"}: +${evt.goodQty} tot, -${evt.scrapQty} phe`}
              description={`${evt.operatorName || "N/A"} @ ${evt.stationCode || "N/A"}${evt.failureCode ? ` | Loi: ${evt.failureCode}` : ""}${evt.remark ? ` | ${evt.remark}` : ""}`}
              time={evt.logTime}
              color={evt.failureCode ? "bg-destructive/15 text-destructive" : "bg-chart-4/15 text-chart-4"}
              isLast={++itemIndex >= totalTimelineItems}
            />
          ))}

          {/* End / Location */}
          {wo.actualEndAt ? (
            <TimelineItem
              icon={Clock}
              title="Hoan thanh san xuat"
              description={`Thoi gian ket thuc: ${new Date(wo.actualEndAt).toLocaleTimeString("vi-VN")}`}
              time={wo.actualEndAt}
              color="bg-success/15 text-success"
              isLast
            />
          ) : (
            <TimelineItem
              icon={MapPin}
              title={`Dang san xuat tai ${wo.lineName || wo.lineCode}`}
              description="Chua hoan thanh"
              time={new Date().toISOString()}
              color="bg-chart-2/15 text-chart-2"
              isLast
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TraceabilityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [traceResult, setTraceResult] = useState<ProductTraceDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [apiStatus, setApiStatus] = useState<"live" | "mock" | null>(null)

  // GET /trace?product_code=<code>
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error("Vui long nhap ma san pham")
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await traceProduct(searchQuery.trim())
      if (res.success && res.data) {
        setTraceResult(res.data)
        setApiStatus("live")
      } else {
        // API returned no data, use mock
        setTraceResult(mockTraceData)
        setApiStatus("mock")
        toast.info(res.message || "Khong tim thay - hien thi du lieu mau")
      }
    } catch (err) {
      // API error, fallback to mock
      setTraceResult(mockTraceData)
      setApiStatus("mock")
      toast.warning(`API loi, hien thi du lieu mau: ${err instanceof Error ? err.message : ""}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Truy vet san pham
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            GET /trace?product_code= - Tim kiem va truy vet nguon goc san pham
          </p>
        </div>
        {apiStatus && (
          <span className={`text-xs px-2 py-1 rounded-full ${apiStatus === "live" ? "bg-success/15 text-success" : "bg-chart-3/15 text-chart-3"}`}>
            {apiStatus === "live" ? "API Live" : "Mock Data"}
          </span>
        )}
      </div>

      {/* Search Bar */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Nhap Ma san pham (product_code) VD: SP-A100..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Tim kiem
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && traceResult && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="size-5 text-chart-1" />
                {traceResult.productCode}
                {traceResult.productName && (
                  <span className="text-sm font-normal text-muted-foreground">
                    - {traceResult.productName}
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {traceResult.workOrders?.length || 0} lenh san xuat lien quan
              </p>
            </div>
          </div>

          {(!traceResult.workOrders || traceResult.workOrders.length === 0) ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Search className="size-12 opacity-40" />
                <p className="text-sm">Khong tim thay lenh san xuat nao cho san pham nay</p>
              </CardContent>
            </Card>
          ) : (
            traceResult.workOrders.map((wo) => (
              <WOTraceCard key={wo.workOrderId} wo={wo} />
            ))
          )}
        </div>
      )}

      {searched && !traceResult && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Search className="size-12 opacity-40" />
            <p className="text-sm">Khong tim thay ket qua nao cho &ldquo;{searchQuery}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!searched && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Layers className="size-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">Truy vet nguon goc san pham</p>
              <p className="text-sm mt-1">
                Nhap ma san pham (product_code) de xem timeline chi tiet ve WO, nguyen lieu, va su kien san xuat
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
