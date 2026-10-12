module mac_pe (
    input logic clk, load_weight,
    input logic signed [7:0] data_in, weight_in,
    input logic signed [15:0] acc_in,
    output logic signed [15:0] acc_out
);
    timeunit 1ns; timeprecision 1ps;
    logic signed [7:0] weight;
    wire signed [15:0] product = data_in * weight;
    always_ff @(posedge clk) begin
        if (load_weight) weight <= weight_in;
    end
    assign acc_out = acc_in + product;
endmodule
