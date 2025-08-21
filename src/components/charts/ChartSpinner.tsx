import { AbsoluteCenter, Box, Image } from "@chakra-ui/react"
import type { Chart } from "../../types/Chart"
import { ChartCard } from "../../components/charts/ChartCard"
import "./ChartSpinner.css"

interface ChartSpinnerProps {
    charts: Chart[],
    pick: Chart
}

function ChartSpinner({ charts, pick }: ChartSpinnerProps) {
    // very clean code!
    const numSide = 50;
    const rollOrder = [];
    for (let i = 0; i < numSide; i++) {
        const random_index = Math.floor(Math.random() * charts.length);
        const chart = charts[random_index];
        rollOrder.push(chart);
    }
    rollOrder.push(pick);
    for (let i = 0; i < numSide; i++) {
        const random_index = Math.floor(Math.random() * charts.length);
        const chart = charts[random_index];
        rollOrder.push(chart);
    }

    return <>
        <div className="bg-img">
            {pick.image_url && <Image height="100%" src={pick.image_url} alt={pick.name_en} filter="auto" blur="2xl"
                opacity="0.5"
                data-state="open" _open={{ animation: "fade-in-50 10s cubic-bezier(0.9, 0, 0.9, 0)" }}
            />}
        </div>
        <div className="spinner">
            <AbsoluteCenter overflow="visible" data-state="open"
                _open={{ animation: "slide-in 10s cubic-bezier(0.3, 0.2, 0.3, 1), fade-in-100 1s ease-out" }}>

                {rollOrder.map((chart: Chart, index: number) => {
                    const offset = index - numSide;
                    const isPick = offset === 0;
                    return <Box width="30vw" data-state="open" zIndex={isPick ? 10001 : 10000} _open={
                        isPick ?
                            { animation: "grow 2s ease-in-out forwards", animationDelay: "10s" } :
                            { animation: "fade-out 2s ease-in-out forwards", animationDelay: "10s" }
                    }>
                        <ChartCard chart={chart} />
                    </Box>
                })}

            </AbsoluteCenter >
        </div>
    </>
}

export default ChartSpinner
