module matrix_tb;
    timeunit 1ns; timeprecision 1ps;
    logic clk=0, load_weight=1;
    logic signed [7:0] a0=2, a1=-3, w00=4, w01=-2, w10=5, w11=7;
    wire signed [15:0] y0,y1;
    systolic_array dut(.*);
    always #5 clk=~clk;
    initial begin
`ifdef RTL_WAVEFORM
`ifdef RTL_FST
        $dumpfile("waveform.fst");
`else
        $dumpfile("waveform.vcd");
`endif
        $dumpvars(0,matrix_tb);
`endif
        #6; load_weight=0;
        // 2*4 + (-3)*5 = -7; 2*(-2) + (-3)*7 = -25.
        assert(y0 == -7 && y1 == -25) else $fatal(1,"Matrix result mismatch: %0d, %0d",y0,y1);
        a0=-8; a1=6; #1;
        assert(y0 == -2 && y1 == 58) else $fatal(1,"Second matrix result mismatch");
        $finish;
    end
endmodule
