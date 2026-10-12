"""E0 development probe, not a production graph provider or simulator.

Usage: private Python -I -B scripts/probe-internal-operations.py SOURCE TOP OUTPUT
Outputs compiler metadata only. It never evaluates signal values or edits RTL.
"""
import json
import sys
import pyslang as slang


def probe(source, top):
    manager = slang.SourceManager()
    tree = slang.syntax.SyntaxTree.fromFile(source, manager)
    options = slang.ast.CompilationOptions()
    options.topModules = {top}
    compilation = slang.ast.Compilation(slang.Bag([options]))
    compilation.addSyntaxTree(tree)
    root = compilation.getRoot()

    def kind(value):
        return str(value).split('.')[-1]

    def point(location):
        location = manager.getFullyOriginalLoc(location)
        if not location:
            return None
        prefix = manager.getSourceText(location.buffer).encode('utf-8')[:location.offset].decode('utf-8')
        return {'file': str(manager.getFullPath(location.buffer)),
                'line': prefix.count('\n'),
                'character': len(prefix.rsplit('\n', 1)[-1].encode('utf-16-le')) // 2}

    def typed(node):
        t = node.type
        result = {'type': str(t), 'simpleIntegral': t.isSimpleBitVector}
        if t.isSimpleBitVector:
            result.update(width=t.bitWidth, signed=t.isSigned, fourState=t.isFourState)
        return result

    def expression(node):
        result = {'kind': kind(node.kind), **typed(node), 'source': point(node.sourceRange.start)}
        if isinstance(node, slang.ast.NamedValueExpression):
            result.update(symbol=node.symbol.hierarchicalPath, name=node.symbol.name)
        elif isinstance(node, slang.ast.BinaryExpression):
            result.update(operator=kind(node.op), left=expression(node.left), right=expression(node.right))
        elif isinstance(node, slang.ast.ConversionExpression):
            result.update(implicit=node.isImplicit, operand=expression(node.operand))
        elif isinstance(node, slang.ast.ConcatenationExpression):
            result['operands'] = [expression(x) for x in node.operands]
        elif isinstance(node, slang.ast.RangeSelectExpression):
            result.update(value=expression(node.value), left=expression(node.left), right=expression(node.right))
        elif isinstance(node, slang.ast.ConditionalExpression):
            result.update(conditions=[expression(x.expr) for x in node.conditions],
                          left=expression(node.left), right=expression(node.right))
        elif isinstance(node, (slang.ast.IntegerLiteral, slang.ast.UnbasedUnsizedIntegerLiteral)):
            result['constant'] = str(node.value)
        return result

    def statement(node):
        result = {'kind': kind(node.kind), 'source': point(node.sourceRange.start)}
        if isinstance(node, slang.ast.TimedStatement):
            timing = node.timing
            result.update(timing=kind(timing.kind), body=statement(node.stmt))
            if isinstance(timing, slang.ast.SignalEventControl):
                result.update(edge=kind(timing.edge), clock=expression(timing.expr), iff=timing.iffCondition is not None)
        elif isinstance(node, slang.ast.ConditionalStatement):
            result.update(conditions=[expression(x.expr) for x in node.conditions],
                          ifTrue=statement(node.ifTrue), ifFalse=statement(node.ifFalse) if node.ifFalse else None)
        elif isinstance(node, slang.ast.BlockStatement):
            result['body'] = statement(node.body)
        elif isinstance(node, slang.ast.StatementList):
            result['statements'] = [statement(x) for x in node.list]
        elif isinstance(node, slang.ast.ExpressionStatement) and isinstance(node.expr, slang.ast.AssignmentExpression):
            assignment = node.expr
            result.update(nonblocking=assignment.isNonBlocking,
                          left=expression(assignment.left), right=expression(assignment.right))
        return result

    signals, assignments, processes = [], [], []
    def visit(node):
        if isinstance(node, (slang.ast.VariableSymbol, slang.ast.NetSymbol)):
            signal = {'path': node.hierarchicalPath, 'source': point(node.location), **typed(node)}
            if node.initializer is not None:
                signal.update(initializer=expression(node.initializer),
                              initializerMeaning='continuous' if isinstance(node, slang.ast.NetSymbol) else 'startup')
            signals.append(signal)
        elif isinstance(node, slang.ast.ContinuousAssignSymbol):
            assignments.append({'scope': node.hierarchicalPath,
                                'left': expression(node.assignment.left), 'right': expression(node.assignment.right)})
        elif isinstance(node, slang.ast.ProceduralBlockSymbol):
            body = statement(node.body)
            # Candidate process shape only: E1 must additionally validate all
            # nested statements, writers and expressions before accepting it.
            candidate = (kind(node.procedureKind) == 'AlwaysFF' and body.get('timing') == 'SignalEvent'
                         and body.get('edge') == 'PosEdge' and not body.get('iff')
                         and body.get('clock', {}).get('kind') == 'NamedValue')
            processes.append({'scope': node.hierarchicalPath, 'procedure': kind(node.procedureKind),
                              'candidate': candidate, 'reason': None if candidate else 'Only a single posedge always_ff is an E1 candidate',
                              'body': body})
    root.visit(visit)
    engine = slang.DiagnosticEngine(manager)
    diagnostics = []
    for diagnostic in compilation.getAllDiagnostics():
        severity = kind(engine.getSeverity(diagnostic.code, diagnostic.location))
        diagnostics.append({'severity': severity, 'message': engine.formatMessage(diagnostic)})
    return {'schema': 'e0-probe-v1', 'top': top, 'signals': signals,
            'assignments': assignments, 'processes': processes, 'diagnostics': diagnostics}


if __name__ == '__main__':
    result = probe(sys.argv[1], sys.argv[2])
    with open(sys.argv[3], 'w', encoding='utf-8') as output:
        json.dump(result, output, ensure_ascii=False, indent=2)
    if any(d['severity'] in ('Error', 'Fatal') for d in result['diagnostics']):
        raise SystemExit(1)
