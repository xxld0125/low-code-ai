/**
 * ResizablePanel组件
 * 基于react-resizable-panels的shadcn/ui风格组件
 */

import * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { cn } from '@/lib/utils'

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = ResizablePrimitive.PanelGroup.displayName

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.Panel
    ref={ref}
    className={cn('flex flex-col overflow-hidden', className)}
    {...props}
  />
))
ResizablePanel.displayName = ResizablePrimitive.Panel.displayName

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    withHandle?: boolean
  }
>(({ className, withHandle, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 [&[data-orientation=vertical]>div]:rotate-90',
      '[&[data-orientation=vertical]>.resize-trigger]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5 shrink-0"
        >
          <circle cx="6" cy="6" r="1" />
          <circle cx="6" cy="2.5" r="1" />
          <circle cx="6" cy="9.5" r="1" />
        </svg>
      </div>
    )}
  </div>
))
ResizableHandle.displayName = 'ResizableHandle'

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
