"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    occupancy: {
        label: "Ekor",
        color: "url(#chart-gradient)",
    },
} satisfies ChartConfig

type PopulationData = {
    cage: string;
    occupancy: number;
}

export function PopulationChart({ data }: { data: PopulationData[] }) {
    if (!data || data.length === 0) {
        return <div className="text-muted-foreground text-sm flex h-full items-center justify-center">Belum ada data kandang.</div>
    }

    const itemHeight = 40;
    const minHeight = 160;
    const computedHeight = Math.max(minHeight, data.length * itemHeight);

    return (
        <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
            <div style={{ height: computedHeight, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, left: 0, right: 30, bottom: 5 }}>
                            <defs>
                                <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#10b77f" />
                                    <stop offset="100%" stopColor="#066e4c" />
                                </linearGradient>
                            </defs>
                            <XAxis
                                type="number"
                                hide
                            />
                            <YAxis
                                dataKey="cage"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                className="text-xs font-bold text-slate-500 fill-slate-500"
                                width={85}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="occupancy" fill="url(#chart-gradient)" radius={[0, 4, 4, 0]} barSize={20} minPointSize={4}>
                                <LabelList dataKey="occupancy" position="right" className="fill-slate-600 dark:fill-slate-400 text-xs font-bold" />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
