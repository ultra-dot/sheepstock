"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
    total: {
        label: "Total Berat (Kg)",
        color: "#3b82f6", // Blue 500
    },
} satisfies ChartConfig

export function HarvestChart({ data }: { data: { month: string, total: number }[] }) {
    if (!data || data.length === 0) {
        return <div className="text-muted-foreground text-sm flex h-full items-center justify-center">Belum ada data panen.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[200px]">
                <BarChart data={data} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
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
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar
                        dataKey="total"
                        fill="var(--color-total)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ChartContainer>
        </ResponsiveContainer>
    )
}
