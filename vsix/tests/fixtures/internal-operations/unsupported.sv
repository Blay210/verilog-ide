module probe_unsupported(input logic clk, rst, a, output logic q, y);
  always_ff @(posedge clk or posedge rst)
    if (rst) q <= 0; else q <= a;
  always_comb begin y = a; end
endmodule
