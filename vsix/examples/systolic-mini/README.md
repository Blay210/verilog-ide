# Small weight-stationary connectivity example

Open this folder, choose Structure → Update → matrix_basic → matrix_tb.dut.
Four mac_pe blocks share clock/load, two data inputs fan out, and partial0/partial1 connect the two accumulation stages. Each PE stores its own weight; results are combinational after weight loading. This fixture is not a full pipelined streaming systolic array and has no input skewing or output harvester.

Double-click a module card or press Enter/Space to inspect that instance. Schematic is the default display and includes supported current-module logic with opaque child boundaries. The Display selector also offers Connections and Detailed leaf logic; Update preserves your choice. Connections show only compiler-confirmed whole-signal bindings. Constants, slices and expressions remain available in the details; they are not fabricated as direct wires. Layout follows connectivity columns and does not promise physical 2×2 placement. Parameters, module shortcuts and connection details are collapsed below the canvas.

Simulation → matrix_basic checks two signed dot products using assertions. Outputs are generated under `.rtl/`; sources are never rewritten by structure exploration.
