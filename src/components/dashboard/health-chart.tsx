"use client"

import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A simple pie chart"

const chartConfig = {
    healthy: {
        label: "Sehat",
        color: "#10b77f", // Emerald / Primary Stitch
    },
    sick: {
        label: "Sakit",
        color: "#f43f5e", // Rose 500
    },
} satisfies ChartConfig

export function HealthChart({ healthy, sick }: { healthy: number, sick: number }) {
    const chartData = [
        { name: "healthy", value: healthy, fill: "#10b77f" },
        { name: "sick", value: sick, fill: "#f43f5e" },
    ]

    if (healthy === 0 && sick === 0) {
        return <div className="text-muted-foreground text-sm flex h-full items-center justify-center">Belum ada data ternak.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
                config={chartConfig}
                className="w-full h-full pb-0 [&_.recharts-pie-label-text]:fill-foreground"
            >
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="75%"
                        outerRadius="100%"
                        strokeWidth={0}
                        paddingAngle={5}
                        cornerRadius={10}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </ResponsiveContainer>
    )
}
