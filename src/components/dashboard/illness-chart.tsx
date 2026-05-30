"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// We use dynamic colors since diseases might vary, but we define a config for the tooltip
const chartConfig = {
    value: {
        label: "Jumlah Kasus",
    },
} satisfies ChartConfig

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#d946ef', '#f43f5e'];

export function IllnessChart({ data }: { data: { name: string, value: number }[] }) {
    if (!data || data.length === 0) {
        return <div className="text-muted-foreground text-sm flex h-full items-center justify-center">Belum ada riwayat penyakit.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="w-full h-full pb-0 [&_.recharts-pie-label-text]:fill-foreground min-h-[200px]">
                <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="90%"
                        strokeWidth={2}
                        stroke="white"
                        paddingAngle={2}
                        cornerRadius={6}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </ResponsiveContainer>
    )
}
