# 📘 PishPosh – Visual Programming via Subway Maps

**PishPosh** is a lightweight, pure-DOM visual programming environment with modular plugin architecture. Users build “programs” by placing stations (nodes) and connecting them (edges). It uses reactive signals and event-driven agents for computation and data flow.

## 🔗 Overview

```
SubwayBuilder (Web Component)
 └─ Application (core)
      ├─ GridPlugin
      ├─ ToolboxPlugin
      ├─ PanZoomPlugin
      ├─ StationPlugin
      ├─ ConnectPlugin
      ├─ ConnectionLinePlugin
      ├─ MoveStationPlugin
      ├─ AgentLibraryPlugin
      ├─ AgentsPlugin
      ├─ AgentChooserPlugin
      └─ PropertiesPanelPlugin
```

Each plugin adds one cohesive feature — from visuals and interaction to agents and metadata — allowing for clean, feature-by-feature extension.

---

## 🚂 Application Core

* **Application.js** sets up the main SVG canvas (`<svg id="svg-canvas">`) and provides:

  * `use(plugin)`: loads a plugin
  * `init()`: initializes all plugins
  * `graph`: instance of reactive `Graph` (nodes & connections)
  * Event bus with `on(event, handler)` and `emit(event, data)`

---

## 🛤️ Core Plugins

1. **GridPlugin**

   * Renders a tile-based grid behind everything
   * Updates automatically when panning/zooming happens

2. **ToolboxPlugin**

   * Renders a floating toolbar with tool icons
   * Emits `toolSelected` when user switches between select / station / connect modes

3. **PanZoomPlugin**

   * Enables click-drag panning and wheel zooming of the SVG viewBox
   * Emits `viewBoxChanged` to trigger grid redraw

4. **StationPlugin**

   * Handles creating stations (nodes) when in station-mode
   * Renders circles and labels and hooks them into the reactive graph

5. **ConnectPlugin**

   * Enables “connecting” mode:

     * Press down on a station, drag to another, then release to create a connection
   * Draws a temporary line during interaction

6. **ConnectionLinePlugin**

   * Listens on `connectionAdded/Removed`
   * Renders permanent lines and labels, reacts to station moves
   * Follows a similar reactive pattern to StationPlugin

7. **MoveStationPlugin**

   * Moves existing stations by dragging in select mode
   * Snaps movement to the grid

---

## 🤖 Agent Plugins (Programmatic Magic)

8. **AgentLibraryPlugin**

   * Registers agent types (e.g., `TimerAgent`, `GraphAgent`)
   * Agents are small event-driven objects that can `send`, `receive`, and emit data

9. **AgentsPlugin**

   * Instantiates agents for each node or connection using `Graph` metadata
   * Routes agent I/O via the application event bus (`agentCreated`, `agentOutput`, etc.)

10. **AgentChooserPlugin**

* Renders a draggable palette of available agent types
* Drag an agent type onto the map to create a new node with that agent attached

11. **PropertiesPanelPlugin**

* Displays selected station/connection properties (position, label, agent)
* Supports live editing

---

## 🧩 How to Use

**1. Installation**

```bash
npm install pishposh
# or clone the repo:
git clone https://github.com/catpea/pishposh.git
```

**2. Add to your HTML**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <subway-builder></subway-builder>
    <script type="module" src="./SubwayBuilder.js"></script>
  </body>
</html>
```

**3. Interact!**

* 🛠 Switch tools via the toolbar
* ⚪ Click in **station mode** to add nodes
* 📏 Drag in **select mode** to pan or move nodes
* 🔗 In **connect mode**, drag from one station to another
* 🧪 Use the **Agents panel** to assign agents (e.g., TimerAgent, GraphAgent)
* ✍️ Inspect and edit station/connection properties in the **Properties panel**

## 📚 Why It Matters

* **Modular structure**: combine only what you need
* **Pure DOM + SVG**: no dependencies, full control
* **Reactive & event-driven**: clear flow of data between UI and agents
* **Self-hosted computing**: nodes can introspect or mutate the graph itself (via GraphAgent)
* **Great starter/project learning**: accessible, extendable, and fun to hack
