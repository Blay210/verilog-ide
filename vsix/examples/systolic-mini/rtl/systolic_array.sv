// Small weight-stationary connectivity fixture, not a cycle-accurate streaming array.
module systolic_array (
    input logic clk, load_weight,
    input logic signed [7:0] a0, a1, w00, w01, w10, w11,
    output wire signed [15:0] y0, y1
);
    timeunit 1ns; timeprecision 1ps;
    wire signed [15:0] partial0, partial1;
    mac_pe pe00(.clk(clk), .load_weight(load_weight), .data_in(a0), .weight_in(w00), .acc_in(16'sd0), .acc_out(partial0));
    mac_pe pe01(.clk(clk), .load_weight(load_weight), .data_in(a0), .weight_in(w01), .acc_in(16'sd0), .acc_out(partial1));
    mac_pe pe10(.clk(clk), .load_weight(load_weight), .data_in(a1), .weight_in(w10), .acc_in(partial0), .acc_out(y0));
    mac_pe pe11(.clk(clk), .load_weight(load_weight), .data_in(a1), .weight_in(w11), .acc_in(partial1), .acc_out(y1));
endmodule
