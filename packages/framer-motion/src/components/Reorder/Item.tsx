import { PanInfo } from "gestures/pan/PanSession"
import * as React from "react"
import { FunctionComponent, ReactHTML, forwardRef, useContext } from "react"
import { ReorderContext } from "../../context/ReorderContext"
import { motion } from "../../render/dom/motion"
import { HTMLMotionProps } from "../../render/html/types"
import { invariant } from "../../utils/errors"
import { useConstant } from "../../utils/use-constant"
import { useMotionValue } from "../../value/use-motion-value"
import { useTransform } from "../../value/use-transform"
import { isMotionValue } from "../../value/utils/is-motion-value"

export interface Props<V> {
    /**
     * A HTML element to render this component as. Defaults to `"li"`.
     *
     * @public
     */
    as?: keyof ReactHTML

    /**
     * The value in the list that this component represents.
     *
     * @public
     */
    value: V

    /**
     * A subset of layout options primarily used to disable layout="size"
     *
     * @public
     * @default true
     */
    layout?: true | "position"

    /**
     * Reference to the parent scrollable element. This is used to scroll the parent when the item is dragged to the top or bottom.
     *
     * @public
     * @default undefined
     */
    scrollParentRef?: React.RefObject<any>
}

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
    return isMotionValue(value) ? value : useMotionValue(defaultValue)
}

type ReorderItemProps<V> = Props<V> &
    HTMLMotionProps<any> &
    React.PropsWithChildren<{}>

export function ReorderItem<V>(
    {
        children,
        style = {},
        value,
        as = "li",
        onDrag,
        layout = true,
        scrollParentRef,
        ...props
    }: ReorderItemProps<V>,
    externalRef?: React.ForwardedRef<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        React.PropsWithChildren<HTMLMotionProps<any> & { ref?: React.Ref<any> }>
    >

    function scrollParent(direction: "up" | "down") {
        if (scrollParentRef?.current === null) return

        console.log({
            scrollParentRef,
        })

        if (direction === "up") {
            scrollParentRef.current.scrollTop -= 10
        } else if (direction === "down") {
            scrollParentRef.current.scrollTop += 10
        }
    }

    const context = useContext(ReorderContext)
    const point = {
        x: useDefaultMotionValue(style.x),
        y: useDefaultMotionValue(style.y),
    }

    const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
        latestX || latestY ? 1 : "unset"
    )

    invariant(Boolean(context), "Reorder.Item must be a child of Reorder.Group")

    const { axis, registerItem, updateOrder } = context!

    const handleDrag = (
        event: MouseEvent | TouchEvent | PointerEvent,
        gesturePoint: PanInfo
    ) => {
        const { velocity } = gesturePoint
        velocity[axis] && updateOrder(value, point[axis].get(), velocity[axis])

        // Scroll logic for parent scrollable element
        if (scrollParentRef && event.target instanceof HTMLElement) {
            const parent = event.target.parentElement
            const threshold = 50 // px from border to start scrolling
            const { top, bottom } = event.target.getBoundingClientRect()

            if (!parent) return
            if (top <= parent.getBoundingClientRect().top + threshold) {
                scrollParent("up")
            } else if (
                bottom >=
                parent.getBoundingClientRect().bottom - threshold
            ) {
                scrollParent("down")
            }
        }

        onDrag && onDrag(event, gesturePoint)
    }

    return (
        <Component
            drag={axis}
            {...props}
            dragSnapToOrigin
            style={{ ...style, x: point.x, y: point.y, zIndex }}
            layout={layout}
            onDrag={handleDrag}
            onLayoutMeasure={(measured) => registerItem(value, measured)}
            ref={externalRef}
            ignoreStrict
        >
            {children}
        </Component>
    )
}

export const Item = forwardRef(ReorderItem) as <V>(
    props: ReorderItemProps<V> & { ref?: React.ForwardedRef<any> }
) => ReturnType<typeof ReorderItem>
