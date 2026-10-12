module probe_counter(input logic clk, rst, en, output logic [7:0] count);
  timeunit 1ns; timeprecision 1ps;
  always_ff @(posedge clk)
    if (rst) count <= '0;
    else if (en) count <= count + 8'd1;
endmodule
module probe_adder(input logic [7:0] a, b, input logic choose, output wire [7:0] y);
  timeunit 1ns; timeprecision 1ps;
  wire [8:0] sum = {1'b0, a} + {1'b0, b};
  assign y = choose ? sum[7:0] : a;
endmodule
module probe_mac #(parameter int W = 8)
  (input logic clk, rst, en, input logic signed [W-1:0] a, b,
   output logic signed [2*W-1:0] acc);
  timeunit 1ns; timeprecision 1ps;
  wire signed [2*W-1:0] product = a * b;
  logic signed [2*W-1:0] stage;
  always_ff @(posedge clk) begin
    if (rst) begin stage <= '0; acc <= '0; end
    else if (en) begin stage <= product; acc <= acc + stage; end
  end
endmodule
module probe_top(input logic clk, rst, en, choose,
                 input logic signed [7:0] a, b,
                 output wire [7:0] count, y,
                 output wire signed [15:0] acc8,
                 output wire signed [7:0] acc4);
  timeunit 1ns; timeprecision 1ps;
  probe_counter counter(.clk, .rst, .en, .count);
  probe_adder adder(.a, .b, .choose, .y);
  probe_mac #(.W(8)) mac8(.clk, .rst, .en, .a, .b, .acc(acc8));
  probe_mac #(.W(4)) mac4(.clk, .rst, .en, .a(a[3:0]), .b(b[3:0]), .acc(acc4));
endmodule
