"""Bounded, conservative RTL semantic graph. No evaluation or synthesis."""
import pyslang as s


def internal_operations(root, instance_id, point, scope_operations=False):
    base = {'version': 1, 'kind': 'rtl-semantic', 'instanceId': instance_id,
            'status': 'unsupported', 'reason': '', 'nodes': [], 'edges': []}
    class Unsupported(Exception):
        pass
    selected = []
    root.visit(lambda n: selected.append(n) if isinstance(n, s.ast.InstanceSymbol) and n.hierarchicalPath == instance_id else None)
    if len(selected) != 1:
        base['reason'] = 'Select one elaborated module instance.'
        return base
    instance = selected[0]
    nodes, edges, signals, drivers, dependencies = [], [], {}, {}, {}
    clocks = set()
    inputs = set()
    modules = []

    def reject(reason):
        raise Unsupported(reason)

    def strength(member):
        try:
            return any(x is not None for x in member.driveStrength)
        except TypeError:
            reject('Explicit drive strength metadata is unsupported by the compiler bindings.')

    def add(kind, label, t, location, **extra):
        if len(nodes) >= 256:
            reject('Internal graph exceeds 256 nodes; select a smaller module.')
        if not t.isSimpleBitVector or t.bitWidth > 16384:
            reject('Only simple integral signals up to 16384 bits are supported.')
        node = {'id': 'n' + str(len(nodes)), 'kind': kind, 'label': label,
                'signalType': {'text': str(t), 'simpleIntegral': True, 'width': t.bitWidth,
                               'signed': t.isSigned, 'fourState': t.isFourState}, **extra}
        if location:
            node['source'] = point(location)
        nodes.append(node)
        return node['id']

    def edge(source, target, role):
        if len(edges) >= 1024:
            reject('Internal graph exceeds 1024 edges.')
        edges.append({'source': source, 'target': target, 'role': role})

    def expr(e, depth=0):
        if depth > 64:
            reject('Expression nesting exceeds 64 levels.')
        nested = lambda x: expr(x, depth + 1)
        location = e.sourceRange.start
        if isinstance(e, s.ast.NamedValueExpression):
            if e.symbol.hierarchicalPath not in signals:
                reject('References outside this module or parameters as expressions are unsupported.')
            return signals[e.symbol.hierarchicalPath]
        if isinstance(e, (s.ast.IntegerLiteral, s.ast.UnbasedUnsizedIntegerLiteral)):
            return add('constant', str(e.value), e.type, location)
        if isinstance(e, s.ast.ConversionExpression):
            operand = nested(e.operand)
            node = add('conversion', 'implicit conversion' if e.isImplicit else 'cast', e.type, location)
            edge(operand, node, 'operand'); return node
        if isinstance(e, s.ast.BinaryExpression) and str(e.op).split('.')[-1] in ('Add', 'Multiply'):
            left, right = nested(e.left), nested(e.right)
            node = add('operator', '+' if str(e.op).endswith('.Add') else '×', e.type, location)
            edge(left, node, 'left'); edge(right, node, 'right'); return node
        if isinstance(e, s.ast.ConcatenationExpression):
            operands = [nested(x) for x in e.operands]
            node = add('operator', 'concat', e.type, location)
            for i, operand in enumerate(operands): edge(operand, node, 'part ' + str(i))
            return node
        if isinstance(e, s.ast.RangeSelectExpression) and str(e.selectionKind).endswith('.Simple'):
            if not isinstance(e.left, s.ast.IntegerLiteral) or not isinstance(e.right, s.ast.IntegerLiteral):
                reject('Only literal fixed range selects are supported.')
            value = nested(e.value)
            node = add('select', '[' + str(e.left.value) + ':' + str(e.right.value) + ']', e.type, location)
            edge(value, node, 'operand'); return node
        if isinstance(e, s.ast.ConditionalExpression) and len(e.conditions) == 1:
            if e.conditions[0].pattern is not None: reject('Pattern conditions are unsupported.')
            condition, yes, no = nested(e.conditions[0].expr), nested(e.left), nested(e.right)
            node = add('control', '?:', e.type, location)
            edge(condition, node, 'condition'); edge(yes, node, 'true'); edge(no, node, 'false'); return node
        reject('Unsupported expression: ' + str(e.kind).split('.')[-1])

    def target(e):
        if not isinstance(e, s.ast.NamedValueExpression) or e.symbol.hierarchicalPath not in signals:
            reject('Only whole local signal assignments are supported.')
        return e.symbol

    def driver(symbol):
        key = symbol.hierarchicalPath
        if key in inputs: reject('Writing input ports is unsupported.')
        if key in drivers: reject('Multiple writers for ' + symbol.name)
        drivers[key] = True

    def combinational(symbol, rhs):
        driver(symbol)
        dependencies[symbol.hierarchicalPath] = set()
        rhs.visit(lambda n: dependencies[symbol.hierarchicalPath].add(n.symbol.hierarchicalPath)
                  if isinstance(n, s.ast.NamedValueExpression) else None)
        value = expr(rhs); edge(value, signals[symbol.hierarchicalPath], 'assignment')

    def child_boundary(child):
        if len(modules) >= 64: reject('Scope exceeds 64 child modules.')
        boundary = {'instanceId': child.hierarchicalPath, 'name': child.name,
                    'module': child.definition.name, 'source': point(child.location), 'ports': []}
        connections = {c.port.name: c for c in child.portConnections}
        for port in child.body.portList:
            if not isinstance(port, s.ast.PortSymbol) or str(port.direction).split('.')[-1] not in ('In', 'Out'):
                reject('Child interface/inout/ref ports are unsupported.')
            if port.initializer is not None: reject('Child port defaults are unsupported.')
            direction = 'input' if str(port.direction).endswith('.In') else 'output'
            connection = connections.get(port.name)
            expression = connection.expression if connection is not None else None
            node = add('module-port', port.name, port.type, port.location)
            boundary['ports'].append({'nodeId': node, 'name': port.name, 'direction': direction, 'connected': expression is not None})
            if expression is None: continue
            if direction == 'input':
                edge(expr(expression), node, 'module input')
            else:
                if not isinstance(expression, s.ast.AssignmentExpression):
                    reject('Child output requires a whole local signal binding.')
                symbol = target(expression.left)
                if symbol.type.bitWidth != port.type.bitWidth:
                    reject('Child output width conversion is unsupported.')
                driver(symbol)
                edge(node, signals[symbol.hierarchicalPath], 'module output')
        modules.append(boundary)

    def statement(stmt, depth=0):
        if depth > 64: reject('Statement nesting exceeds 64 levels.')
        if isinstance(stmt, s.ast.BlockStatement): return statement(stmt.body, depth + 1)
        if isinstance(stmt, s.ast.StatementList):
            updates = {}
            for child in stmt.list:
                part = statement(child, depth + 1)
                if updates.keys() & part.keys(): reject('Repeated sequential assignments in one block are unsupported.')
                updates.update(part)
            return updates
        if isinstance(stmt, s.ast.ExpressionStatement) and isinstance(stmt.expr, s.ast.AssignmentExpression):
            a = stmt.expr
            if not a.isNonBlocking or a.isCompound or a.timingControl:
                reject('Only plain nonblocking assignments without delays are supported.')
            symbol = target(a.left)
            return {symbol.hierarchicalPath: (symbol, expr(a.right))}
        if isinstance(stmt, s.ast.ConditionalStatement) and len(stmt.conditions) == 1:
            if stmt.conditions[0].pattern is not None or not str(stmt.check).endswith('.None_'):
                reject('Pattern or unique/priority conditions are unsupported.')
            condition = expr(stmt.conditions[0].expr)
            yes = statement(stmt.ifTrue, depth + 1)
            no = statement(stmt.ifFalse, depth + 1) if stmt.ifFalse else {}
            result = {}
            for key in yes.keys() | no.keys():
                symbol = (yes.get(key) or no[key])[0]
                mux = add('control', 'if / else', symbol.type, stmt.sourceRange.start)
                edge(condition, mux, 'condition')
                edge(yes[key][1] if key in yes else signals[key], mux, 'true' if key in yes else 'true / hold')
                edge(no[key][1] if key in no else signals[key], mux, 'false' if key in no else 'false / hold')
                result[key] = (symbol, mux)
            return result
        reject('Unsupported statement: ' + str(stmt.kind).split('.')[-1])

    try:
        members = list(instance.body)
        if len(members) > 512: reject('Module exceeds 512 direct members.')
        for member in members:
            if isinstance(member, s.ast.PortSymbol) and member.initializer is not None:
                reject('Port defaults/startup initializers are unsupported.')
            if isinstance(member, s.ast.PortSymbol):
                direction = str(member.direction).split('.')[-1]
                if direction not in ('In', 'Out'):
                    reject('Only input/output ports are supported; inout/ref ports are excluded.')
                if direction == 'In' and member.internalSymbol is not None:
                    inputs.add(member.internalSymbol.hierarchicalPath)
            if isinstance(member, (s.ast.InstanceSymbol, s.ast.GenerateBlockSymbol, s.ast.GenerateBlockArraySymbol, s.ast.InstanceArraySymbol)):
                if not scope_operations: reject('Select a leaf module to view internal operations.')
                if not isinstance(member, s.ast.InstanceSymbol):
                    reject('Generate scopes and instance arrays are not supported by scope operations yet.')
            if isinstance(member, (s.ast.VariableSymbol, s.ast.NetSymbol)):
                if member.initializer is not None and not isinstance(member, s.ast.NetSymbol):
                    reject('Variable startup initializers are unsupported.')
                if isinstance(member, s.ast.NetSymbol) and member.delay:
                    reject('Delayed nets are unsupported.')
                if isinstance(member, s.ast.NetSymbol) and (str(member.netType.netKind).split('.')[-1] not in ('Wire', 'UWire') or strength(member)):
                    reject('Resolved net types and explicit drive strengths are unsupported.')
                signals[member.hierarchicalPath] = add('signal', member.name, member.type, member.location,
                                                      signalPath=member.hierarchicalPath, signalName=member.name, declarationId=member.hierarchicalPath)
        for member in members:
            if isinstance(member, s.ast.NetSymbol) and member.initializer is not None:
                combinational(member, member.initializer)
            elif isinstance(member, s.ast.ContinuousAssignSymbol):
                if member.delay: reject('Delayed continuous assignments are unsupported.')
                if strength(member): reject('Explicit drive strengths are unsupported.')
                combinational(target(member.assignment.left), member.assignment.right)
            elif isinstance(member, s.ast.ProceduralBlockSymbol):
                body = member.body
                if (not str(member.procedureKind).endswith('.AlwaysFF') or not isinstance(body, s.ast.TimedStatement)
                    or not isinstance(body.timing, s.ast.SignalEventControl) or not str(body.timing.edge).endswith('.PosEdge')
                    or body.timing.iffCondition is not None or not isinstance(body.timing.expr, s.ast.NamedValueExpression)):
                    reject('Only single posedge always_ff with a named clock is supported; async reset/always_comb are excluded.')
                clock = target(body.timing.expr)
                if clock.type.bitWidth != 1: reject('Clock must be one bit.')
                clocks.add(clock.hierarchicalPath)
                if len(clocks) > 1: reject('Multiple clocks in a module are unsupported.')
                for key, (symbol, value) in statement(body.stmt).items():
                    driver(symbol)
                    reg = add('register', symbol.name + ' · next state', symbol.type, member.location)
                    edge(value, reg, 'next state'); edge(signals[clock.hierarchicalPath], reg, 'clock ↑')
                    edge(reg, signals[key], 'state output')
            elif scope_operations and isinstance(member, s.ast.InstanceSymbol):
                child_boundary(member)
            elif not isinstance(member, (s.ast.VariableSymbol, s.ast.NetSymbol, s.ast.PortSymbol, s.ast.ParameterSymbol)):
                reject('Unsupported module member: ' + str(member.kind).split('.')[-1])
        visiting, done = set(), set()
        def cycle(key):
            if key in visiting: reject('Combinational cycle is unsupported.')
            if key in done: return
            visiting.add(key)
            for child in dependencies.get(key, set()):
                if child in dependencies: cycle(child)
            visiting.remove(key); done.add(key)
        for key in dependencies: cycle(key)
        base.update(status='supported', reason='', nodes=nodes, edges=edges)
        if scope_operations: base['modules'] = modules
    except Unsupported as error:
        base['reason'] = str(error)
    return base
