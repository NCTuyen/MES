"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  output: {
    label: "San luong",
    color: "var(--color-chart-1)",
  },
  target: {
    label: "Muc tieu",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

interface ProductionChartProps {
  data: { hour: string; output: number; target: number }[]
}

export function ProductionChart({ data }: ProductionChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>San luong theo gio</CardTitle>
        <CardDescription>
          Bieu do so sanh san luong thuc te va muc tieu theo tung gio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="output" fill="var(--color-output)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} opacity={0.4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
