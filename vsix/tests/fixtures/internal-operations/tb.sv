module probe_tb;
  timeunit 1ns; timeprecision 1ps;
  logic clk = 0, rst = 1, en = 0, choose = 1;
  logic signed [7:0] a = 7, b = 3;
  wire [7:0] count, y;
  wire signed [15:0] acc8;
  wire signed [7:0] acc4;
  probe_top dut(.clk, .rst, .en, .choose, .a, .b, .count, .y, .acc8, .acc4);
  always #5 clk = ~clk;
  initial begin
    $dumpfile("wave.vcd"); $dumpvars(0, probe_tb);
    @(negedge clk); rst = 0; en = 1;
    @(negedge clk);
    @(posedge clk); #1;
    assert(acc8 == 21 && acc4 == 21 && count == 2) else $fatal(1, "pipeline accumulation");
    @(negedge clk); en = 0;
    @(posedge clk); #1;
    assert(acc8 == 21 && acc4 == 21 && count == 2) else $fatal(1, "enable hold");
    @(negedge clk); en = 1; a = -2;
    @(posedge clk); #1;
    assert(acc8 == 42 && acc4 == 42) else $fatal(1, "previous stage");
    @(posedge clk); #1;
    assert(acc8 == 36 && acc4 == 36 && count == 4) else $fatal(1, "signed product");
    $finish;
  end
endmodule
