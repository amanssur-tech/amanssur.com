## The problem

Data is only useful if someone can read it. The same numbers can be shown in a way that answers a question at a glance, or in a way that looks impressive and says nothing. Plenty of dashboards fail at the second: they are built to look finished, not to be understood.

I wanted a place to show the first. Any dataset, any question, turned into a chart that actually carries the answer, and legible whether it is read on a desktop or a phone.

## What it does

The dashboard is a growing collection of case studies. Each one is a self-contained page with its own chart type and its own question, and adding another one does not touch the rest.

The current set ranges from a bar chart comparing counts across cities to a parallel coordinates plot of five air-quality measures: line charts over time, a randomised bar chart that redraws itself every three seconds, a three-panel view of sales by time of day, and a dumbbell chart that toggles to a bubble scatterplot. One of the studies deliberately pairs a misleading chart with its corrected version, because knowing why a chart lies is part of knowing how to draw one.

The set is not fixed, and neither is the subject. The dataset is whatever the question needs, the chart type follows the question, and the standard stays the same: pick the encoding that fits, and make it hold up at 390 pixels as well as at 1440.

Every page carries the same shell: English and German, light and dark.

<a href="/portfolio/viz-case-studies.webp"><img src="/portfolio/viz-case-studies.webp" alt="The case study library: a grid of cards, each with a different chart preview, a description and tags" /></a>

*The library. Each card is a self-contained study with its own chart type and its own question; the set grows by adding a route, not by editing the others.*

<a href="/portfolio/viz-line-chart.webp"><img src="/portfolio/viz-line-chart.webp" alt="A line chart of two series over six years, with a legend, a shared y-axis and a marker at every annual value" /></a>

*One of the studies: a line chart over six years, with a legend, a shared y-axis and a marker at each annual value.*

## How it is built

D3 draws, React owns the page. The seam is one hook, `useD3`, which takes a render callback, hands it the container element and runs the cleanup it returns before the next render. It waits ten milliseconds before drawing, because React 19 and Framer Motion are still moving the layout when the effect fires, and drawing into a container that is mid-animation produces charts at the wrong size.

Underneath sit nine renderers in `src/charts`, each a plain function that takes a container and data and owns its own SVG. A new chart type is a new renderer plus a route; nothing else has to change.

The build splits React, the router, D3 and i18n into separate chunks, so the D3 chunk only arrives on a page that actually draws something. The landing page never downloads the charting code.

## Decisions and tradeoffs

**A hand-written hook instead of a chart library.** Recharts or visx would have removed the lifecycle work. They would also have put their own API between me and the SVG, and the SVG is the thing this project exists to show. The cost is real: I own cleanup, resize and the delay above, and every renderer has to be disciplined about removing what it added.

**Bundled JSON instead of a backend.** The datasets are small files shipped with the build. That keeps the demo deployable as static files and the numbers stable enough to screenshot. It also means nothing here proves I can handle a live source, a cache or a failure mode, because it does not.

**One route per study instead of one long page.** A single scrolling page would have been faster to build and easier to share. Separate routes keep each chart on its own, so a heavy chart cannot drag the others down, and every study can be linked to directly.

## What it is not

It is not a BI product. There is no authentication, no persistence, no live data and no server. The test suite is two Playwright smoke tests: the dashboard loads, and the case-study index is reachable. That catches a broken deploy and comes nowhere near calling the charts tested. If this were a client build, the next three things would be a data layer with loading and error states, visual regression tests on the charts themselves, and an accessibility pass on colour and contrast.
