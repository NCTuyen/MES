"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createWorkOrder } from "@/lib/api"
import { toast } from "sonner"

interface CreateWODialogProps {
  onCreated: () => void
}

export function CreateWODialog({ onCreated }: CreateWODialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    woNumber: "",
    productId: "",
    lineId: "",
    shiftId: "",
    plannedQty: "",
    remark: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productId || !form.plannedQty || !form.lineId) {
      toast.error("Vui long dien day du thong tin bat buoc")
      return
    }

    setLoading(true)
    try {
      const res = await createWorkOrder({
        woNumber: form.woNumber || undefined,
        productId: parseInt(form.productId),
        lineId: parseInt(form.lineId),
        shiftId: form.shiftId ? parseInt(form.shiftId) : undefined,
        plannedQty: parseFloat(form.plannedQty),
        remark: form.remark || undefined,
        createdBy: "operator",
      })
      if (res.success) {
        toast.success(`Tao lenh san xuat thanh cong! ${res.data?.woNumber || ""}`)
      } else {
        toast.error(res.message || "Tao lenh san xuat that bai")
      }
      setOpen(false)
      setForm({ woNumber: "", productId: "", lineId: "", shiftId: "", plannedQty: "", remark: "" })
      onCreated()
    } catch (err) {
      toast.error(`Khong the tao lenh san xuat: ${err instanceof Error ? err.message : "Loi khong xac dinh"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="size-4" />
          Tao WO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tao lenh san xuat moi</DialogTitle>
          <DialogDescription>
            Nhap thong tin de tao lenh san xuat moi (POST /workorders)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="woNumber">So WO (tuy chon)</Label>
            <Input
              id="woNumber"
              placeholder="VD: WO-20260302-001"
              value={form.woNumber}
              onChange={(e) => setForm({ ...form, woNumber: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="productId">Product ID *</Label>
            <Input
              id="productId"
              type="number"
              placeholder="VD: 1"
              min={1}
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plannedQty">So luong ke hoach *</Label>
            <Input
              id="plannedQty"
              type="number"
              placeholder="VD: 500"
              min={1}
              value={form.plannedQty}
              onChange={(e) => setForm({ ...form, plannedQty: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="shiftId">Ca san xuat</Label>
            <Select value={form.shiftId} onValueChange={(v) => setForm({ ...form, shiftId: v })}>
              <SelectTrigger id="shiftId">
                <SelectValue placeholder="Chon ca san xuat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Ca 1 (06:00 - 14:00)</SelectItem>
                <SelectItem value="2">Ca 2 (14:00 - 22:00)</SelectItem>
                <SelectItem value="3">Ca 3 (22:00 - 06:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lineId">Line ID *</Label>
            <Select value={form.lineId} onValueChange={(v) => setForm({ ...form, lineId: v })}>
              <SelectTrigger id="lineId">
                <SelectValue placeholder="Chon chuyen san xuat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Chuyen 1</SelectItem>
                <SelectItem value="2">Chuyen 2</SelectItem>
                <SelectItem value="3">Chuyen 3</SelectItem>
                <SelectItem value="4">Chuyen 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">Ghi chu</Label>
            <Input
              id="remark"
              placeholder="Ghi chu them..."
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Huy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Tao lenh
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
