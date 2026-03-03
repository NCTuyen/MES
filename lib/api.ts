const API_BASE = "https://mesapi20260302151159-dgfvekdfczcfgug2.southeastasia-01.azurewebsites.net"

// ─── Generic fetch wrapper ─────────────────────────────────────────────────────
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API Error ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

// ─── API Response Wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

// ─── WorkOrder types (match WorkOrderDto from Swagger) ──────────────────────────
export interface WorkOrderDto {
  workOrderId: number
  woNumber: string | null
  productCode: string | null
  productName: string | null
  lineCode: string | null
  lineName: string | null
  shiftName: string | null
  plannedQty: number
  actualQty: number
  scrapQty: number
  status: string | null
  plannedStartAt: string | null
  plannedEndAt: string | null
  actualStartAt: string | null
  actualEndAt: string | null
  remark: string | null
  createdAt: string
}

export interface CreateWorkOrderRequest {
  woNumber?: string | null
  productId: number
  lineId: number
  shiftId?: number | null
  plannedQty: number
  plannedStartAt?: string | null
  plannedEndAt?: string | null
  remark?: string | null
  createdBy?: string | null
}

export interface StartWorkOrderRequest {
  workOrderId: number
  operatorId?: string | null
  operatorName?: string | null
  stationCode?: string | null
  machineCode?: string | null
}

export interface CompleteWorkOrderRequest {
  workOrderId: number
  remark?: string | null
}

// ─── Material types (match Swagger) ─────────────────────────────────────────────
export interface ScanMaterialRequest {
  workOrderId: number
  materialCode?: string | null
  materialName?: string | null
  lotNumber?: string | null
  batchNumber?: string | null
  supplier?: string | null
  actualQty: number
  plannedQty: number
  unit?: string | null
  stationCode?: string | null
  inputBy?: string | null
}

export interface MaterialInputDto {
  materialInputId: number
  workOrderId: number
  woNumber: string | null
  materialCode: string | null
  materialName: string | null
  lotNumber: string | null
  batchNumber: string | null
  supplier: string | null
  actualQty: number
  unit: string | null
  inputAt: string
  inputBy: string | null
}

// ─── Hourly Production types ────────────────────────────────────────────────────
export interface HourlyProductionDto {
  hour: string | null
  goodQty: number
  scrapQty: number
  eventCount: number
}

// ─── Trace types ────────────────────────────────────────────────────────────────
export interface MaterialSummaryDto {
  materialInputId: number
  materialCode: string | null
  materialName: string | null
  lotNumber: string | null
  supplier: string | null
  actualQty: number
  unit: string | null
  inputAt: string
}

export interface ProductionEventDto {
  productionLogId: number
  logTime: string
  eventType: string | null
  goodQty: number
  scrapQty: number
  serialNumber: string | null
  operatorName: string | null
  stationCode: string | null
  failureCode: string | null
  remark: string | null
}

export interface WorkOrderTraceDto {
  workOrderId: number
  woNumber: string | null
  status: string | null
  lineCode: string | null
  lineName: string | null
  shiftName: string | null
  actualStartAt: string | null
  actualEndAt: string | null
  actualQty: number
  scrapQty: number
  materials: MaterialSummaryDto[] | null
  events: ProductionEventDto[] | null
}

export interface ProductTraceDto {
  productCode: string | null
  productName: string | null
  workOrders: WorkOrderTraceDto[] | null
}

// ─── API Functions ──────────────────────────────────────────────────────────────

// POST /workorders - Create new work order
export function createWorkOrder(data: CreateWorkOrderRequest) {
  return apiFetch<ApiResponse<WorkOrderDto>>("/workorders", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// GET /workorders - List work orders
export function getWorkOrders() {
  return apiFetch<ApiResponse<WorkOrderDto[]>>("/workorders")
}

// POST /workorders/start - Start a work order
export function startWorkOrder(data: StartWorkOrderRequest) {
  return apiFetch<ApiResponse<WorkOrderDto>>("/workorders/start", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// POST /workorders/complete - Complete a work order
export function completeWorkOrder(data: CompleteWorkOrderRequest) {
  return apiFetch<ApiResponse<WorkOrderDto>>("/workorders/complete", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// POST /material/scan - Scan material
export function scanMaterial(data: ScanMaterialRequest) {
  return apiFetch<ApiResponse<MaterialInputDto>>("/material/scan", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// GET /production/hourly?woid=<id> - Get hourly production data
export function getHourlyProduction(woid?: number) {
  return apiFetch<ApiResponse<HourlyProductionDto[]>>(`/production/hourly${woid ? `?woid=${woid}` : ""}`)
}

// POST /production/record - Record production quantity
export interface RecordProductionRequest {
  workOrderId: number
  goodQty: number
  scrapQty: number
  operator: string
}

export function recordProduction(data: RecordProductionRequest) {
  return apiFetch<ApiResponse<any>>("/production/record", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// GET /trace?product_code=<code> - Trace product
export function traceProduct(productCode: string) {
  return apiFetch<ApiResponse<ProductTraceDto>>(`/trace?product_code=${encodeURIComponent(productCode)}`)
}
