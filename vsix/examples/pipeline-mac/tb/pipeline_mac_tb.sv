module pipeline_mac_tb;
  timeunit 1ns; timeprecision 1ps;
  logic clk = 0, rst = 1, en = 0;
  logic signed [7:0] a = 0, b = 0;
  wire signed [5:0] signed4_acc;
  wire signed [9:0] signed8_acc;
  wire [5:0] unsigned4_acc;
  pipeline_mac_signed #(.W(4), .ACC_W(6)) signed4
    (.clk, .rst, .en, .a(a[3:0]), .b(b[3:0]), .acc(signed4_acc));
  pipeline_mac_signed #(.W(8), .ACC_W(10)) signed8
    (.clk, .rst, .en, .a, .b, .acc(signed8_acc));
  pipeline_mac_unsigned #(.W(4), .ACC_W(6)) unsigned4
    (.clk, .rst, .en, .a(a[3:0]), .b(b[3:0]), .acc(unsigned4_acc));
  always #5 clk = ~clk;
  function automatic longint wrap_unsigned(input longint value, input int width);
    return value & ((64'd1 << width) - 1);
  endfunction
  function automatic longint wrap_signed(input longint value, input int width);
    longint raw;
    raw = wrap_unsigned(value, width);
    return (raw & (64'd1 << (width-1))) ? raw - (64'd1 << width) : raw;
  endfunction
  longint s4_stage = 0, s8_stage = 0, u4_stage = 0;
  longint s4_acc = 0, s8_acc = 0, u4_acc = 0;
  longint s4_product, s8_product, u4_product;
  int cycle = 0;
  task automatic step(input bit reset, enable, input int aa, bb);
    @(negedge clk); rst = reset; en = enable; a = 8'(aa); b = 8'(bb);
    s4_product = wrap_signed(aa,4) * wrap_signed(bb,4);
    s8_product = wrap_signed(aa,8) * wrap_signed(bb,8);
    u4_product = wrap_unsigned(aa,4) * wrap_unsigned(bb,4);
    @(posedge clk);
    if (reset) begin
      s4_stage=0; s8_stage=0; u4_stage=0;
      s4_acc=0; s8_acc=0; u4_acc=0;
    end else if (enable) begin
      // NBA adds the PREVIOUS stage, not this cycle's product.
      s4_acc=wrap_signed(s4_acc+s4_stage,6);
      s8_acc=wrap_signed(s8_acc+s8_stage,10);
      u4_acc=wrap_unsigned(u4_acc+u4_stage,6);
      s4_stage=s4_product; s8_stage=s8_product; u4_stage=u4_product;
    end
    #1; cycle++;
    assert ($signed(signed4.product)==s4_product && $signed(signed4.stage)==s4_stage && $signed(signed4_acc)==s4_acc)
      else $fatal(1,"signed4 reference mismatch at cycle %0d",cycle);
    assert ($signed(signed8.product)==s8_product && $signed(signed8.stage)==s8_stage && $signed(signed8_acc)==s8_acc)
      else $fatal(1,"signed8 reference mismatch at cycle %0d",cycle);
    assert ($unsigned(unsigned4.product)==u4_product && $unsigned(unsigned4.stage)==u4_stage && $unsigned(unsigned4_acc)==u4_acc)
      else $fatal(1,"unsigned4 reference mismatch at cycle %0d",cycle);
  endtask
  initial begin
    $dumpfile("wave.vcd"); $dumpvars(0,pipeline_mac_tb);
    step(1,1,7,7);       // reset wins over enable
    step(0,1,7,7);       // fill stage; acc still zero
    step(0,1,7,7);       // signed6: 49 represents -15
    step(0,0,-2,3);      // product changes; registered values hold
    step(0,1,-2,3);      // add OLD 49; stage becomes -6 / unsigned42
    step(0,1,-8,-8);
    step(0,1,15,15);     // signed4 -1*-1 vs unsigned4 15*15
    step(0,1,-1,2);
    step(1,0,0,0);       // reset also wins when enable is low
    step(0,0,7,7);       // hold zero
    step(0,1,127,127);   // signed8 product16129; fill pipeline
    step(0,1,127,127);   // signed10 wraps to -255
    step(0,1,127,127);   // signed10 wraps to -510
    $display("E3_REFERENCE_PASS: %0d cycles, three instances",cycle);
    $finish;
  end
endmodule
