module pipeline_mac_signed #(parameter int W = 4, ACC_W = 6)
  (input logic clk, rst, en, input logic signed [W-1:0] a, b,
   output logic signed [ACC_W-1:0] acc);
  timeunit 1ns; timeprecision 1ps;
  wire signed [2*W-1:0] product = a * b;
  logic signed [2*W-1:0] stage;
  always_ff @(posedge clk) begin
    if (rst) begin stage <= '0; acc <= '0; end
    else if (en) begin stage <= product; acc <= acc + stage; end
  end
endmodule

module pipeline_mac_unsigned #(parameter int W = 4, ACC_W = 6)
  (input logic clk, rst, en, input logic [W-1:0] a, b,
   output logic [ACC_W-1:0] acc);
  timeunit 1ns; timeprecision 1ps;
  wire [2*W-1:0] product = a * b;
  logic [2*W-1:0] stage;
  always_ff @(posedge clk) begin
    if (rst) begin stage <= '0; acc <= '0; end
    else if (en) begin stage <= product; acc <= acc + stage; end
  end
endmodule

