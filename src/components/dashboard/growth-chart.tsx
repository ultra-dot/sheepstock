"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
    adg: {
        label: "Berat Rata-rata (Kg)",
        color: "#10b77f", // Emerald 500
    },
} satisfies ChartConfig

export function GrowthChart({ data }: { data: { month: string, adg: number }[] }) {
    if (!data || data.length === 0) {
        return <div className="text-muted-foreground text-sm flex h-full items-center justify-center">Belum ada data penimbangan.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[200px]">
                <LineChart data={data} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        tickFormatter={(value) => value.slice(0, 3)}
                        fontSize={12}
                        className="fill-slate-500"
                    />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        fontSize={12}
                        className="fill-slate-500"
                        domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="adg"
                        stroke="var(--color-adg)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "var(--color-adg)", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ChartContainer>
        </ResponsiveContainer>
    )
}
