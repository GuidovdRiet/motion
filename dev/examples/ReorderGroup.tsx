import * as React from "react"
import { useState } from "react"
import { Group } from "../../packages/framer-motion/src/components/Reorder/Group"
import { Item } from "../../packages/framer-motion/src/components/Reorder/Item"

const initialItems = [
    "🍅 Tomato",
    "🥒 Cucumber",
    "🧀 Cheese",
    "🥬 Lettuce",
    "🍖 Meat",
    "🍞 Bread",
    "🍔 Burger",
    "🍟 Fries",
    "🍕 Pizza",
    "🥦 Broccoli",
    "🥕 Carrot",
    "🥑 Avocado",
    "🥥 Coconut",
    "🍍 Pineapple",
    "🍓 Strawberry",
]

const itemStyle = {
    borderRadius: "10px",
    marginBottom: "10px",
    width: "100%",
    padding: "4px 0px",
    position: "relative",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
    cursor: "grab",
    listStyle: "none",
    margin: 0,
}

const groupStyle = {
    backgroundColor: "#ffaa00",
    listStyle: "none",
    padding: "0 20px",
    margin: 0,
    maxHeight: "350px",
    overflow: "auto",
}

function List() {
    const [items, setItems] = useState(initialItems)
    const scrollParentRef = React.useRef(null)

    return (
        <Group
            axis="y"
            values={items}
            onReorder={setItems}
            style={groupStyle}
            ref={scrollParentRef}
        >
            {items.map((item) => (
                <Item
                    key={item}
                    value={item}
                    style={itemStyle}
                    scrollParentRef={scrollParentRef}
                >
                    {item}
                </Item>
            ))}
        </Group>
    )
}

export function App() {
    return <List />
}
