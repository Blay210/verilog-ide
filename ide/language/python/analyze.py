"""slang adapter. Inputs are data only; no project Python or simulator is executed."""
import json
import os
import sys
import locale
import re
import time
from array import array
from bisect import bisect_right
import pyslang as slang
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class SourcePositions:
    """Bounded coordinates for one immutable compiler source manager, not files."""
    def __init__(self, manager, max_bytes=4 * 1024 * 1024, max_buffers=64, max_points=4096):
        self.manager = manager
        self.max_bytes, self.max_buffers, self.max_points = max_bytes, max_buffers, max_points
        self.bytes = 0
        self.buffers, self.points = {}, {}

    def point(self, location):
        location = self.manager.getFullyOriginalLoc(location)
        key = (location.buffer, location.offset)
        value = self.points.get(key)
        if value is None:
            buffer = self.buffers.get(location.buffer)
            if buffer is None:
                filename = str(self.manager.getFullPath(location.buffer))
                text = self.manager.getSourceText(location.buffer)
                data = text.encode('utf-8')
                ascii_only = data.isascii()
                cost = len(data) + (8 if ascii_only else 16) * (data.count(b'\n') + 1)
                if len(self.buffers) < self.max_buffers and self.bytes + cost <= self.max_bytes:
                    starts = array('Q', [0])
                    units = starts if ascii_only else array('Q', [0])
                    if ascii_only:
                        starts.extend(match.end() for match in re.finditer(b'\n', data))
                    else:
                        previous = byte_offset = unit_offset = 0
                        for match in re.finditer('\n', text):
                            line = text[previous:match.end()]
                            byte_offset += len(line.encode('utf-8'))
                            unit_offset += len(line.encode('utf-16-le')) // 2
                            starts.append(byte_offset); units.append(unit_offset)
                            previous = match.end()
                    buffer = (filename, data, starts, units, ascii_only)
                    self.buffers[location.buffer] = buffer
                    self.bytes += cost
                else:
                    # Huge/dense buffers keep the original conversion without
                    # growing a request cache. Partial UTF-8 uses replacement.
                    prefix = data[:location.offset].decode('utf-8', errors='replace')
                    value = (filename, len(prefix.encode('utf-16-le')) // 2,
                             prefix.count('\n'), len(prefix.rsplit('\n', 1)[-1].encode('utf-16-le')) // 2)
            if value is None:
                filename, data, starts, units, ascii_only = buffer
                offset = min(location.offset, len(data))
                line = bisect_right(starts, offset) - 1
                character = offset - starts[line] if ascii_only else len(data[starts[line]:offset].decode('utf-8', errors='replace').encode('utf-16-le')) // 2
                value = (filename, units[line] + character, line, character)
            if len(self.points) < self.max_points:
                self.points[key] = value
        filename, offset, line, character = value
        # Callers receive independent dictionaries, as in the original bridge.
        return {'file': filename, 'offset': offset, 'line': line, 'character': character}


class ScopeEnumValues:
    """Presentation values for exact native enum identities in one lookup scope."""
    def __init__(self, max_types=64, max_values=4096, max_bytes=1024 * 1024):
        self.max_types, self.max_values, self.max_bytes = max_types, max_values, max_bytes
        self.entries = {}
        self.values = self.bytes = 0

    def get(self, enum_type):
        row = self.entries.get(id(enum_type))
        if row is None or row[0] is not enum_type:
            return None
        # Every result owns its list/dicts, including callers using the bridge
        # directly. Keep the native identity alive so Python IDs cannot recycle.
        return [{'name': name, 'value': value} for name, value in row[1]]

    def put(self, enum_type, values):
        if id(enum_type) in self.entries or len(self.entries) >= self.max_types or self.values + len(values) > self.max_values:
            return False
        size = 0
        for value in values:
            size += len(value['name'].encode('utf-8')) + len(value['value'].encode('utf-8'))
            if self.bytes + size > self.max_bytes:
                return False
        self.entries[id(enum_type)] = (enum_type, tuple((value['name'], value['value']) for value in values))
        self.values += len(values)
        self.bytes += size
        return True


def dependencies(tree, manager):
    graph = {'declarations': [], 'references': []}
    sequence = 0
    def source(location):
        location = manager.getFullyExpandedLoc(location)
        while manager.getIncludedFrom(location.buffer):
            location = manager.getIncludedFrom(location.buffer)
        return str(manager.getFullPath(location.buffer))
    def visit(node):
        nonlocal sequence
        if not isinstance(node, slang.syntax.SyntaxNode):
            return
        sequence += 1
        kind = str(node.kind).split('.')[-1]
        if kind == 'PackageDeclaration':
            graph['declarations'].append({'name': node.header.name.valueText, 'file': source(node.sourceRange.start), 'offset': sequence})
        elif kind == 'PackageImportItem':
            graph['references'].append({'name': node.package.valueText, 'file': source(node.sourceRange.start), 'offset': sequence, 'explicit': True})
        elif kind == 'ScopedName' and str(node.left.kind).endswith('.IdentifierName') and node.separator.valueText == '::':
            graph['references'].append({'name': node.left.getFirstToken().valueText, 'file': source(node.sourceRange.start), 'offset': sequence, 'explicit': False})
    tree.root.visit(visit)
    return graph


def hierarchy(root, manager, point):
    count = 0
    def spelling(expression):
        if isinstance(expression, slang.ast.ConversionExpression) and expression.isImplicit:
            return spelling(expression.operand)
        if expression.syntax is None:
            if isinstance(expression, slang.ast.RangeSelectExpression):
                return spelling(expression.value) + '[' + spelling(expression.left) + ':' + spelling(expression.right) + ']'
            if isinstance(expression, slang.ast.ElementSelectExpression):
                return spelling(expression.value) + '[' + spelling(expression.selector) + ']'
            if isinstance(expression, slang.ast.IntegerLiteral):
                return str(expression.value)
        start = manager.getFullyOriginalLoc(expression.sourceRange.start)
        end = manager.getFullyOriginalLoc(expression.sourceRange.end)
        if start and end and start.buffer == end.buffer:
            return manager.getSourceText(start.buffer).encode('utf-8')[start.offset:end.offset].decode('utf-8', errors='replace').strip()
        return str(expression.kind).split('.')[-1]

    def bindings(instance, top):
        connections = {c.port.name: c for c in instance.portConnections}
        ports = []
        for port in instance.body.portList:
            direction = str(getattr(port, 'direction', 'interface')).split('.')[-1].lower()
            binding = {'kind': 'top' if top else 'unconnected', 'text': '', 'references': []}
            connection = connections.get(port.name)
            if direction == 'interface':
                binding.update(kind='interface', text='Interface/modport binding: inspect source')
            elif connection is not None and connection.expression is not None:
                expression = connection.expression
                # Output binding is represented as an implicit assignment to the
                # parent expression. Its synthetic RHS is the child's port value.
                if isinstance(expression, slang.ast.AssignmentExpression):
                    expression = expression.left
                start = manager.getFullyOriginalLoc(expression.sourceRange.start)
                text = spelling(expression)
                references = {}
                def reference(node):
                    if isinstance(node, (slang.ast.NamedValueExpression, slang.ast.HierarchicalValueExpression)):
                        symbol = node.symbol
                        if symbol.location:
                            references[symbol.hierarchicalPath] = {'name': symbol.name, 'path': symbol.hierarchicalPath, 'location': point(symbol.location)}
                expression.visit(reference)
                if text in ('.*', '.' + port.name) and len(references) == 1:
                    text = next(iter(references.values()))['name']
                binding.update(kind='expression', text=text or str(expression.kind).split('.')[-1], references=list(references.values()))
                direct = expression
                while isinstance(direct, slang.ast.ConversionExpression) and direct.isImplicit and direct.type.bitWidth == direct.operand.type.bitWidth:
                    direct = direct.operand
                if isinstance(direct, slang.ast.NamedValueExpression) and isinstance(direct.symbol, (slang.ast.VariableSymbol, slang.ast.NetSymbol)) and direct.type.isSimpleBitVector and port.type.isSimpleBitVector and direct.type.bitWidth == port.type.bitWidth:
                    binding['directSignal'] = direct.symbol.hierarchicalPath
                if start:
                    binding['location'] = point(start)
            ports.append({'name': port.name, 'direction': {'in': 'input', 'out': 'output'}.get(direction, direction),
                          'type': str(getattr(port, 'type', 'interface')), 'location': point(port.location), 'connection': binding,
                          **({'internalSignal': port.internalSymbol.hierarchicalPath} if isinstance(port, slang.ast.PortSymbol) and port.internalSymbol is not None and port.type.isSimpleBitVector else {}),
                          **({'signalType': signal_type(port.type)} if hasattr(port, 'type') else {})})
        return ports

    def node(symbol, parent='', depth=0, top=False, segments=()):
        nonlocal count
        if isinstance(symbol, (slang.ast.GenerateBlockSymbol, slang.ast.GenerateBlockArraySymbol)) and symbol.isUninstantiated:
            return None
        instance = isinstance(symbol, slang.ast.InstanceSymbol)
        generate = isinstance(symbol, slang.ast.GenerateBlockSymbol)
        array = isinstance(symbol, (slang.ast.GenerateBlockArraySymbol, slang.ast.InstanceArraySymbol))
        if not (instance or generate or array):
            return None
        count += 1
        if count > 10000 or depth > 128:
            raise ValueError('Hierarchy exceeds 10000 nodes or 128 levels; select a smaller design.')
        identifier = symbol.hierarchicalPath
        members = list(symbol.body if instance else symbol)
        result = {'id': identifier, 'name': identifier[len(parent):].lstrip('.') if parent and (identifier.startswith(parent + '.') or identifier.startswith(parent + '[')) else identifier,
                  'kind': 'instance' if instance else 'generate' if generate else 'array',
                  'location': point(symbol.location), 'parameters': [], 'ports': [], 'children': []}
        # Use compiler symbol spelling, not escaped pretty-print hierarchical IDs.
        local = result['name'] if result['name'].startswith('[') else (symbol.name or result['name'])
        parts = (*segments[:-1], segments[-1] + local) if segments and local.startswith('[') else (*segments, local)
        result['instancePath'] = list(parts)
        enums = []
        for member in members:
            if not isinstance(member, (slang.ast.VariableSymbol, slang.ast.NetSymbol)):
                continue
            t = member.type.canonicalType
            if not t.isEnum or not 0 < t.bitWidth <= 256:
                continue
            values = []
            for constant in t:
                value = constant.value
                if not isinstance(value.value, slang.SVInt) or value.hasUnknown():
                    values = []
                    break
                bits = format(int(value.value) & ((1 << t.bitWidth) - 1), '0%db' % t.bitWidth)
                values.append({'name': constant.name, 'bits': bits})
                if len(values) > 256:
                    values = []
                    break
            if values:
                enums.append({'name': member.name, 'width': t.bitWidth, 'values': values})
        if enums:
            result['enumSignals'] = enums
        for member in members:
            if isinstance(member, (slang.ast.ParameterSymbol, slang.ast.TypeParameterSymbol)):
                result['parameters'].append({'name': member.name, 'value': str(member.value) if isinstance(member, slang.ast.ParameterSymbol) else str(member.targetType.type),
                                             'overridden': member.isOverridden, 'local': member.isLocalParam, 'location': point(member.location)})
            child = node(member, identifier, depth + 1, segments=parts)
            if child is not None:
                result['children'].append(child)
        if instance:
            result.update(module=symbol.definition.name, definition=point(symbol.definition.location), ports=bindings(symbol, top))
        return result
    return [node(instance, top=True) for instance in root.topInstances]


def complete(compilation, defaults, query, manager, point, source_files, index=None):
    """Enumerate candidates, but let slang perform visibility/import/name resolution."""
    index = {} if index is None else index
    paths = index.setdefault('paths', {})
    def canonical(file):
        key = os.path.normcase(os.path.normpath(file))
        if key in paths:
            return paths[key]
        value = os.path.normcase(os.path.realpath(file))
        if len(paths) < 4096:
            paths[key] = value
        return value
    # A caller can retarget an unlisted path alias without changing compiler
    # inputs. Resolve the query spelling afresh; only compiler identities cache.
    filename = os.path.normcase(os.path.realpath(query['file']))
    offset = query['offset']
    # Overlays include other open tabs too. Only compiled sources and headers that
    # were actually included belong to this compilation's visibility context.
    if 'known_files' not in index:
        known_files = {canonical(file) for file in source_files}
        known_files.update(canonical(str(manager.getFullPath(buffer))) for buffer in manager.getAllBuffers() if manager.getIncludedFrom(buffer))
        index['known_files'] = known_files
    known_files = index['known_files']
    if filename not in known_files:
        return []
    qualifier = query.get('qualifier')
    allowed = {'InstanceBody', 'Package', 'Subroutine', 'StatementBlock', 'GenerateBlock', 'CompilationUnit'}

    def in_file(location):
        return location['file'] and canonical(location['file']) == filename

    def inventory(model, key):
        if key not in index:
            found_names, found_scopes = set(), []
            buffer_files = {}
            def original_file(location):
                location = manager.getFullyOriginalLoc(location)
                if location.buffer not in buffer_files:
                    buffer_files[location.buffer] = canonical(str(manager.getFullPath(location.buffer)))
                return location, buffer_files[location.buffer]
            def collect(symbol):
                if not isinstance(symbol, slang.ast.Symbol):
                    return
                # Definition names are appended separately. Root instances and
                # instance bodies do not introduce local completion variables.
                if not isinstance(symbol, slang.ast.InstanceBodySymbol):
                    top_instance = isinstance(symbol, slang.ast.InstanceSymbol) and symbol.parentScope.containingInstance is None
                    if not top_instance and re.fullmatch(r'[A-Za-z_][A-Za-z0-9_$]*', symbol.name):
                        found_names.add(symbol.name)
                if isinstance(symbol, slang.ast.Scope):
                    syntax = symbol.syntax
                    if syntax is not None:
                        source_range = syntax.sourceRange
                        start, start_file = original_file(source_range.start)
                        end, end_file = original_file(source_range.end)
                        if start_file == end_file:
                            found_scopes.append((start_file, start, end, symbol))
            model.getRoot().visit(collect)
            index[key] = (found_names, found_scopes)
        return index[key]
    def containing(ranges):
        # Only map source coordinates for scopes in the requested file. Other
        # buffers keep native immutable locations until they are actually used.
        result = []
        for file, start, end, symbol in ranges:
            if file != filename:
                continue
            first, last = point(start)['offset'], point(end)['offset']
            if first <= offset <= last:
                result.append((last - first, symbol))
        return result
    primary_names, primary_ranges = inventory(compilation, 'primary')
    names, scopes = set(primary_names), containing(primary_ranges)
    if not any(str(scope.kind).split('.')[-1] != 'CompilationUnit' for _, scope in scopes):
        # Uninstantiated modules still need editing support, using their defaults.
        default_names, default_ranges = inventory(defaults, 'defaults')
        names.update(default_names)
        scopes.extend(containing(default_ranges))
    # fromBuffers creates one compilation unit whose syntax can span several files.
    # Its start/end cannot serve as a same-file range, but file-level imports and
    # declarations must still be available when the caret is outside a module.
    if not scopes:
        scopes.extend((float('inf'), unit) for unit in compilation.getCompilationUnits())
    if 'package_names' not in index:
        package_names = set()
        for package in compilation.getPackages():
            if package.name != 'std':
                package.visit(lambda symbol: package_names.add(symbol.name) if isinstance(symbol, slang.ast.Symbol) and re.fullmatch(r'[A-Za-z_][A-Za-z0-9_$]*', symbol.name) else None)
                package_names.add(package.name)
        index['package_names'] = package_names
    names.update(index['package_names'])
    if qualifier and (not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_$]*', qualifier) or compilation.getPackage(qualifier) is None):
        return []
    if not scopes:
        return []
    if any(str(scope.kind).split('.')[-1] == 'ClassType' for _, scope in scopes):
        return []
    # A single module without trailing newline can have the same source range
    # as its compilation unit. The unit is still outer, not another elaboration
    # whose visible symbols should intersect the module-local candidates.
    local_scopes = [(size, scope) for size, scope in scopes if str(scope.kind).split('.')[-1] != 'CompilationUnit']
    if local_scopes:
        scopes = local_scopes
    smallest = min(size for size, _ in scopes)
    innermost = [scope for size, scope in scopes if size == smallest]
    contexts = []
    boundaries = []
    for scope in innermost:
        kind = str(scope.kind).split('.')[-1]
        # A class or other unsupported nested scope must not leak its outer scope.
        if kind not in allowed:
            return []
        lookup_location = slang.ast.LookupLocation.max
        # Preserve declaration order. Select the next actual symbol's lookup index,
        # rather than inferring SystemVerilog ordering rules from text.
        following = []
        for member in scope:
            if not member.location:
                continue
            location = point(member.location)
            if in_file(location) and location['offset'] >= offset:
                following.append((location['offset'], member))
        if following:
            next_offset, next_member = min(following, key=lambda entry: entry[0])
            lookup_location = slang.ast.LookupLocation.before(next_member)
            boundary = (next_offset, next_member.name)
        else:
            boundary = None
        contexts.append((scope, lookup_location))
        boundaries.append((id(scope), boundary))
    cache_key = (filename, qualifier, tuple(boundaries))
    resolved = index.setdefault('resolved', {})
    if cache_key in resolved:
        return resolved[cache_key][0]
    results = []
    for scope, lookup_location in contexts:
        found = {}
        # Reuse is restricted to this immutable compiler generation and exact
        # scope/parameterization/declaration boundary/qualifier, never by prefix.
        enum_values = ScopeEnumValues()
        for name in sorted(names):
            symbol = scope.lookupName((qualifier + '::' if qualifier else '') + name, lookup_location, slang.ast.LookupFlags.NoUndeclaredError)
            if symbol is None or not symbol.location:
                continue
            entry = describe_symbol(symbol, point)
            if entry is not None and canonical(entry['location']['file']) in known_files:
                # A typedef/enum import may resolve to another declaration; the
                # candidate name is the spelling available at the query location.
                entry['name'] = name
                t = getattr(symbol, 'type', None)
                if t is not None and t.canonicalType.isEnum:
                    enum_type = t.canonicalType
                    values = enum_values.get(enum_type)
                    if values is None:
                        values = []
                        for member in enum_type:
                            if len(values) >= 256 or not isinstance(member.value.value, slang.SVInt) or member.value.hasUnknown():
                                values = []
                                break
                            spelling = None
                            visible = scope.lookupName(member.name, lookup_location, slang.ast.LookupFlags.NoUndeclaredError)
                            if visible is not None and visible.location and point(visible.location) == point(member.location):
                                spelling = member.name
                            else:
                                for package in compilation.getPackages():
                                    if package.name == 'std':
                                        continue
                                    qualified_name = package.name + '::' + member.name
                                    visible = scope.lookupName(qualified_name, lookup_location, slang.ast.LookupFlags.NoUndeclaredError)
                                    if visible is not None and visible.location and point(visible.location) == point(member.location):
                                        spelling = qualified_name
                                        break
                            if spelling is None:
                                values = []
                                break
                            values.append({'name': spelling, 'value': str(member.value)})
                        enum_values.put(enum_type, values)
                    if values:
                        entry['enumValues'] = values
                found[name] = entry
        results.append(found)
    # Multiple parameterizations at the same source location must agree.
    visible = [value for name, value in results[0].items() if all(result.get(name) == value for result in results[1:])]
    # Definitions live in a separate namespace from module-local signals.
    # Only the compiled project (including its unsaved overlays) contributes them.
    if not qualifier:
        definitions = {}
        for definition in compilation.getDefinitions():
            location = point(definition.location)
            if canonical(location['file']) in known_files:
                definitions.setdefault(definition.name, []).append((definition, location))
        visible_names = {entry['name'] for entry in visible}
        # Packages are a project namespace, not ordinary module-local symbols.
        # lookupName('pkg') need not resolve an unimported package even though
        # pkg::member is legal. Enumerate real compiled packages explicitly.
        for package in compilation.getPackages():
            if package.name == 'std' or package.name in visible_names:
                continue
            entry = describe_symbol(package, point)
            if entry is not None and canonical(entry['location']['file']) in known_files:
                visible.append(entry)
                visible_names.add(package.name)
        for name, entries in sorted(definitions.items()):
            if len(entries) == 1 and name not in visible_names:
                definition, location = entries[0]
                visible.append({'name': name, 'kind': 'module', 'instantiable': True, 'detail': definition.getKindString() + ' ' + name, 'location': location})
    cost = len(json.dumps(visible, ensure_ascii=False).encode('utf-8'))
    budget = 8 * 1024 * 1024
    if cost <= budget:
        while resolved and (len(resolved) >= 128 or index.get('resolved_bytes', 0) + cost > budget):
            _, old_cost = resolved.pop(next(iter(resolved)))
            index['resolved_bytes'] -= old_cost
        resolved[cache_key] = (visible, cost)
        index['resolved_bytes'] = index.get('resolved_bytes', 0) + cost
    return visible


def signal_type(t):
    simple = t.isSimpleBitVector
    result = {'text': str(t), 'simpleIntegral': simple}
    if simple:
        result.update(width=t.bitWidth, signed=t.isSigned, fourState=t.isFourState)
    return result


def describe_symbol(symbol, point):
    kind = str(symbol.kind).split('.')[-1]
    categories = {'Variable': 'variable', 'Net': 'variable', 'FormalArgument': 'variable', 'Port': 'variable',
                  'Parameter': 'constant', 'EnumValue': 'constant', 'Genvar': 'constant',
                  'TypeAlias': 'type', 'TypeParameter': 'type', 'ClassType': 'type',
                  'Subroutine': 'function', 'Instance': 'module', 'Package': 'package'}
    if kind not in categories:
        return None
    try:
        detail = str(getattr(symbol, 'type', ''))
    except RuntimeError:
        # Invalid enum initializers can leave a native error type whose display
        # conversion raises. Do not turn one broken symbol into a failed query.
        return None
    if kind == 'Subroutine':
        detail = str(symbol.returnType) + ' ' + symbol.name + '(' + ', '.join(str(arg.type) + ' ' + arg.name for arg in symbol.arguments) + ')'
    elif kind in ('TypeAlias', 'TypeParameter', 'ClassType'):
        detail = 'type ' + symbol.name
    elif kind == 'Instance':
        detail = symbol.definition.name + ' ' + symbol.name
    elif kind == 'Package':
        detail = 'package ' + symbol.name
    else:
        detail = kind.lower() + ' ' + detail + ' ' + symbol.name
    result = {'name': symbol.name, 'kind': categories[kind], 'detail': detail, 'location': point(symbol.location)}
    if kind in ('Variable', 'Net', 'FormalArgument', 'Port', 'Parameter', 'EnumValue'):
        result['signalType'] = signal_type(symbol.type)
    if kind == 'Subroutine':
        arguments = []
        for arg in symbol.arguments:
            direction = str(arg.direction).split('.')[-1].lower()
            direction = {'in': 'input', 'out': 'output', 'inout': 'inout', 'ref': 'ref'}.get(direction, direction)
            initializer = getattr(arg.syntax, 'initializer', None) if arg.syntax is not None else None
            label = direction + ' ' + str(arg.type) + ' ' + arg.name
            if initializer is not None:
                label += ' ' + str(initializer).strip()
            arguments.append({'name': arg.name, 'label': label})
        result['callable'] = {'kind': str(symbol.subroutineKind).split('.')[-1].lower(), 'returnType': str(symbol.returnType), 'arguments': arguments}
    return result


def analyze(request, retained=None):
    if os.name == 'nt':
        # Native std::filesystem string conversion must use UTF-8, not the system ACP.
        locale.setlocale(locale.LC_ALL, '.UTF8')
    manager = slang.SourceManager()
    for directory in request['includeDirs']:
        manager.addUserDirectories(os.path.abspath(directory))
    buffers = {}
    for overlay in request['overlays']:
        # readHeader canonicalizes junctions; use that same cache key for overlays.
        filename = os.path.realpath(overlay['file'])
        buffers[os.path.normcase(filename)] = manager.assignText(filename, overlay['text'])
    sources = []
    for filename in request['sources']:
        filename = os.path.abspath(filename)
        key = os.path.normcase(os.path.realpath(filename))
        sources.append(buffers[key] if key in buffers else manager.readSource(filename))
    preprocessor = slang.parsing.PreprocessorOptions()
    # Bindings hold string_views: keep the Python strings alive for compilation.
    predefines = [key + '=' + value for key, value in request['defines'].items()]
    preprocessor.predefines = predefines
    tree = slang.syntax.SyntaxTree.fromBuffers(sources, manager, slang.Bag([preprocessor]))
    if request.get('operation') == 'dependencies':
        return dependencies(tree, manager)
    compilation_options = slang.ast.CompilationOptions()
    selected_tops = {request['top']} if request.get('top') else set()
    compilation_options.topModules = selected_tops
    compilation = slang.ast.Compilation(slang.Bag([compilation_options]))
    compilation.addSyntaxTree(tree)
    root = compilation.getRoot()

    # slang uses UTF-8 bytes; LSP and JavaScript use UTF-16 code units.
    positions = SourcePositions(manager)
    point = positions.point

    def ports(instance):
        result = []
        for port in instance.body.portList:
            direction = str(getattr(port, 'direction', 'interface')).split('.')[-1].lower()
            result.append({'name': port.name, 'direction': {'in': 'input', 'out': 'output'}.get(direction, direction),
                           'type': str(getattr(port, 'type', 'interface')), 'location': point(port.location),
                           **({'signalType': signal_type(port.type)} if hasattr(port, 'type') else {})})
        return result

    def parameters(instance):
        result = []
        for member in instance.body:
            if isinstance(member, (slang.ast.ParameterSymbol, slang.ast.TypeParameterSymbol)) and not member.isLocalParam:
                value_parameter = isinstance(member, slang.ast.ParameterSymbol)
                result.append({'name': member.name, 'type': str(member.type) if value_parameter else 'type',
                               'defaultValue': str(member.value) if value_parameter else str(member.targetType.type)})
        return result

    instances = []
    covered_instances = None
    def visit(symbol):
        if isinstance(symbol, slang.ast.InstanceSymbol) and symbol.syntax is not None:
            start = point(symbol.syntax.sourceRange.start)
            # Preserve actual selected-top elaborations (including ambiguity).
            # Default elaboration only fills source locations absent from them.
            key = (os.path.normcase(start['file']), start['offset'])
            if covered_instances is not None and key in covered_instances:
                return
            end = point(symbol.syntax.sourceRange.end)
            if os.path.normcase(end['file']) != os.path.normcase(start['file']):
                # Parser recovery can consume the next source buffer when a
                # closer is absent. Editor ranges are single-file: cap this
                # compiler-confirmed instance at its original buffer's EOF.
                origin = manager.getFullyOriginalLoc(symbol.syntax.sourceRange.start)
                text = manager.getSourceText(origin.buffer)
                end = {'file': start['file'], 'offset': len(text.encode('utf-16-le')) // 2,
                       'line': text.count('\n'), 'character': len(text.rsplit('\n', 1)[-1].encode('utf-16-le')) // 2}
            instances.append({'name': symbol.name, 'module': symbol.definition.name,
                              'start': start, 'end': end,
                              'ports': ports(symbol)})
            parent = symbol.syntax.parent
            if parent is not None and str(parent.kind).split('.')[-1] == 'HierarchyInstantiation' and parent.parameters is not None:
                instances[-1].update(parameterStart=point(parent.parameters.sourceRange.start), parameterEnd=point(parent.parameters.sourceRange.end))
    root.visit(visit)
    engine = slang.DiagnosticEngine(manager)
    diagnostics = []
    for diagnostic in compilation.getAllDiagnostics():
        if not diagnostic.location:
            continue
        severity = str(engine.getSeverity(diagnostic.code, diagnostic.location)).split('.')[-1].lower()
        if severity == 'ignored':
            continue
        diagnostics.append({'location': point(diagnostic.location), 'severity': 'error' if severity in ('fatal', 'error') else 'warning' if severity == 'warning' else 'note',
                            'message': engine.formatMessage(diagnostic), 'code': str(diagnostic.code)})
    if request.get('operation') == 'hierarchy':
        return {'roots': [] if any(d['severity'] == 'error' for d in diagnostics) else hierarchy(root, manager, point), 'diagnostics': diagnostics}
    if request.get('operation') in ('internalOperations', 'scopeOperations'):
        from internal_operations import internal_operations
        if any(d['severity'] == 'error' for d in diagnostics):
            return {'version': 1, 'kind': 'rtl-semantic', 'instanceId': request['instanceId'],
                    'status': 'unsupported', 'reason': 'Fix compilation errors before viewing internal operations.',
                    'nodes': [], 'edges': [], 'diagnostics': diagnostics}
        return {**internal_operations(root, request['instanceId'], point, request.get('operation') == 'scopeOperations'), 'diagnostics': diagnostics}
    # Elaborate every module with its default parameters for declaration signatures.
    # Instance signatures above retain actual parameter overrides.
    options = slang.ast.CompilationOptions()
    top_names = {definition.name for definition in compilation.getDefinitions()}
    options.topModules = top_names
    defaults = slang.ast.Compilation(slang.Bag([options]))
    defaults.addSyntaxTree(tree)
    covered_instances = {(os.path.normcase(i['start']['file']), i['start']['offset']) for i in instances}
    defaults.getRoot().visit(visit)
    modules = [{'name': instance.definition.name, 'kind': instance.definition.getKindString(),
                'location': point(instance.definition.location), 'ports': ports(instance), 'parameters': parameters(instance)}
               for instance in defaults.getRoot().topInstances]
    # Unrelated editor overlays are registered buffers too: only compiled sources
    # and compiler-confirmed includes belong to this analysis. Macro buffers are
    # synthetic and must never become filesystem watch paths.
    files = {os.path.abspath(file) for file in request['sources']}
    files.update(str(manager.getFullPath(buffer)) for buffer in manager.getAllBuffers() if manager.getIncludedFrom(buffer))
    # Capture compiler-input identity once for this immutable model. Previously
    # the same paths were resolved again for tracking and the first query.
    identities = {file: os.path.realpath(file) for file in files}
    files.update(identities.values())
    # IncludeMetadata contains the expanded name (including macro includes).
    # Missing paths come from compiler diagnostic arguments, never parsed prose.
    # Other errors retain conservative directory watches too.
    # Watch all plausible search alternatives so creating a nearer header cannot
    # leave an old, successfully resolved include in the published analysis.
    def include_candidates(name, location):
        directories = {os.getcwd(), *request['includeDirs']}
        location = manager.getFullyExpandedLoc(location)
        while location:
            filename = str(manager.getFullPath(location.buffer))
            if os.path.isabs(filename):
                directories.add(os.path.dirname(filename))
            location = manager.getIncludedFrom(location.buffer)
        return {os.path.abspath(os.path.join(directory, name)) for directory in directories}
    candidates = set()
    for include in tree.getIncludeDirectives():
        candidates.update(include_candidates(include.path, include.syntax.sourceRange.start))
    for diagnostic in tree.diagnostics:
        if str(diagnostic.code) == 'DiagCode(CouldNotOpenIncludeFile)' and diagnostic.args:
            candidates.update(include_candidates(str(diagnostic.args[0]), diagnostic.location))
    canonical_files = {os.path.normcase(file) for file in identities.values()}
    files.update(file for file in candidates if os.path.lexists(file) and os.path.normcase(os.path.realpath(file)) in canonical_files)
    result = {'modules': modules, 'instances': instances, 'diagnostics': diagnostics,
              'inputs': {'files': sorted(files), 'candidates': sorted(candidates),
                         'conservative': any(d['severity'] == 'error' for d in diagnostics)}}
    paths = {}
    for file, real in identities.items():
        for name in (file, real):
            if len(paths) < 4096:
                paths[os.path.normcase(os.path.normpath(name))] = os.path.normcase(real)
    completion_index = {'paths': paths, 'known_files': canonical_files}
    if request.get('query'):
        result['completions'] = complete(compilation, defaults, request['query'], manager, point, request['sources'], completion_index)
    if retained is not None:
        # Keep string_views, source manager and both elaborations alive together.
        # These are immutable input generations, not an incremental compiler API.
        retained.append({'compilation': compilation, 'defaults': defaults, 'manager': manager,
                         'point': point, 'sources': request['sources'], 'index': completion_index, 'keepalive': (tree, predefines, buffers, request)})
    return result


def read_package_approval(file, timeout=15):
    # Atomic publication prevents partial JSON, but Windows readers can still
    # encounter a transient sharing denial around a newly renamed file.
    deadline = time.monotonic() + timeout
    while True:
        try:
            with open(file, encoding='utf-8') as source:
                return json.load(source)
        except (FileNotFoundError, PermissionError) as error:
            if time.monotonic() >= deadline:
                raise TimeoutError('Semantic package approval did not arrive or was not readable') from error
            time.sleep(0.01)


def run_request(request):
    if request.get('operation') == 'package-session':
        if request.get('protocol') != 1:
            raise ValueError('Invalid semantic package protocol')
        channel = request['packageChannel']
        # The Core owns graph validation and ordering. Publish data atomically,
        # then wait for its approval before creating any test compilation.
        graph = analyze({**request, 'operation': 'dependencies'})
        with open(channel['graph'] + '.tmp', 'w', encoding='utf-8') as destination:
            json.dump({'protocol': 1, 'graph': graph}, destination, ensure_ascii=False)
        os.replace(channel['graph'] + '.tmp', channel['graph'])
        sys.stdout.write('\x1eRTL_PACKAGE_READY_V1\n')
        sys.stdout.flush()
        del graph
        # Bound an abandoned approval wait even if the owning Node process dies.
        continuation = read_package_approval(channel['continue'])
        if continuation.get('protocol') != 1 or not isinstance(continuation.get('approval'), str) or continuation['request'].get('operation') not in (
                None, 'batch', 'hierarchy', 'internalOperations', 'scopeOperations'):
            raise ValueError('Invalid semantic package continuation')
        common = {key: value for key, value in request.items()
                  if key not in ('operation', 'sources', 'protocol', 'packageChannel')}
        return {'protocol': 1, 'approval': continuation['approval'],
                'result': run_request({**common, **continuation['request']})}
    if request.get('operation') == 'batch':
        # Fresh managers, syntax trees and compilations isolate same-named tops,
        # macros and includes. Only Python/module startup is shared, for this call.
        return {'analyses': [analyze({**request, **group, 'operation': None})
                             for group in request['groups']]}
    return analyze(request)


def resident_bytes():
    if os.name == 'nt':
        import ctypes
        from ctypes import wintypes
        class Counters(ctypes.Structure):
            _fields_ = [('cb', wintypes.DWORD), ('faults', wintypes.DWORD)] + [
                (name, ctypes.c_size_t) for name in ('peak', 'working', 'peakPaged', 'paged', 'peakNonpaged', 'nonpaged', 'pagefile', 'peakPagefile')]
        counters = Counters()
        counters.cb = ctypes.sizeof(counters)
        current = ctypes.windll.kernel32.GetCurrentProcess
        current.restype = wintypes.HANDLE
        measure = ctypes.windll.psapi.GetProcessMemoryInfo
        measure.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
        if not measure(current(), ctypes.byref(counters), counters.cb):
            raise OSError('Compiler resident memory measurement failed')
        return counters.working
    import resource
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return peak if sys.platform == 'darwin' else peak * 1024


def editor_session(request):
    """One worker; fresh compiler models per revision, no finalized AST mutation."""
    # Windows redirected stdin otherwise follows the active ANSI code page.
    # Node writes UTF-8, including Korean/spaced project and source paths.
    sys.stdin.reconfigure(encoding='utf-8')
    def emit(message):
        sys.stdout.write('\x1eRTL_EDITOR_V1 ' + json.dumps(message, ensure_ascii=True) + '\n')
        sys.stdout.flush()
    directory = os.path.dirname(os.path.realpath(sys.argv[1]))
    retained, groups = [], []
    revision = 0

    def build_model(value, command_id):
        nonlocal groups
        groups = value['groups']
        if not 1 <= len(groups) <= 4 or any(len(group['sources']) > 2048 for group in groups):
            raise ValueError('Editor session group/source limit exceeded')
        results = [analyze({**value, **group, 'operation': None}, retained) for group in groups]
        source_bytes = sum(sum(len(entry['manager'].getSourceText(buffer).encode('utf-8'))
                               for buffer in entry['manager'].getAllBuffers()) for entry in retained)
        rss = resident_bytes()
        reusable = source_bytes <= 32 * 1024 * 1024 and rss <= 512 * 1024 * 1024
        emit({'kind': 'ready', 'id': command_id, 'revision': revision, 'analyses': results,
              'reusable': reusable, 'sourceBytes': source_bytes, 'rssBytes': rss})
        return reusable

    def lookup(query):
        # Keep per-query native references local so rebuild can collect the old
        # model and all its scope/enum/source indexes before preparing another.
        canonical = lambda file: os.path.normcase(os.path.realpath(file))
        matching = [i for i, group in enumerate(groups) if canonical(query['file']) in {canonical(f) for f in group.get('testSources', [])}]
        agreed = None
        for i in matching or range(len(retained)):
            entry = retained[i]
            symbols = complete(entry['compilation'], entry['defaults'], query, entry['manager'], entry['point'], entry['sources'], entry['index'])
            if agreed is None:
                agreed = symbols
            else:
                identities = {json.dumps(symbol, sort_keys=True) for symbol in symbols}
                agreed = [symbol for symbol in agreed if json.dumps(symbol, sort_keys=True) in identities]
        return agreed or []

    if not build_model(request, 0):
        return
    request = None
    while True:
        line = sys.stdin.readline(16385)
        if not line:
            return
        if len(line) > 16384 or not line.endswith('\n'):
            raise ValueError('Editor query limit exceeded')
        command = json.loads(line)
        if command.get('kind') == 'close':
            return
        if not isinstance(command.get('id'), int) or command['id'] <= 0:
            raise ValueError('Invalid editor query')
        if command.get('kind') == 'rebuild':
            if command.get('revision') != revision + 1 or revision >= 64:
                raise ValueError('Invalid editor revision')
            name = 'model-' + str(command['id']) + '.json'
            filename = os.path.join(directory, name)
            if command.get('input') != name or os.path.realpath(filename) != filename:
                raise ValueError('Invalid editor model input')
            # No native objects or user macro state cross a model generation.
            retained.clear()
            groups = []
            import gc
            gc.collect()
            with open(filename, encoding='utf-8') as source:
                request = json.load(source)
            revision += 1
            if not build_model(request, command['id']):
                return
            request = None
            continue
        if command.get('kind') != 'complete' or command.get('revision') != revision:
            raise ValueError('Invalid editor query revision')
        query = command['query']
        if not isinstance(query.get('file'), str) or not isinstance(query.get('offset'), int) or query['offset'] < 0:
            raise ValueError('Invalid editor position')
        symbols = lookup(query)
        rss = resident_bytes()
        emit({'kind': 'complete', 'id': command['id'], 'revision': revision, 'symbols': symbols, 'rssBytes': rss})
        symbols = None
        if rss > 512 * 1024 * 1024:
            return  # Release a context that grew during lazy compiler lookups.


if __name__ == '__main__':
    with open(sys.argv[1], encoding='utf-8') as source:
        request = json.load(source)
    if request.get('operation') == 'editor-session':
        editor_session(request)
    else:
        result = run_request(request)
        with open(sys.argv[2], 'w', encoding='utf-8') as destination:
            json.dump(result, destination, ensure_ascii=False)
