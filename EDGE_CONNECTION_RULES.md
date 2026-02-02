# Edge Connection Rules

This document describes the edge-type-specific connection validation system implemented in DocMaps.

## Overview

The connection validation system enforces semantic rules for which node types can connect via different edge types. This ensures that the visual documentation maintains logical consistency and accurately represents the relationships between components.

## Architecture

### Core Components

1. **`packages/graph/connection-rules.ts`** - Central rules engine
   - Defines connection rules organized by edge type
   - Provides validation and query functions
   - Single source of truth for all connection logic

2. **`packages/graph/handle-validator.ts`** - Validation wrapper
   - Integrates connection rules with React Flow
   - Maintains backward compatibility
   - Provides user-friendly error messages

3. **`apps/editor/components/canvas/edge-panel.tsx`** - UI validation
   - Real-time validation when users change edge types
   - Visual feedback for invalid connections
   - Prevents invalid edge type changes

## Connection Rules by Edge Type

### 1. Hierarchy Edges (Strict)

**Purpose**: Maintain honest architectural hierarchy

**Allowed Connections**:
- Product → Component
- Component → Component (subcomponents)
- Feature → Feature (subfeatures)
- TextBlock → TextBlock

**Not Allowed**:
- Feature → Product (violates hierarchy)
- Component → Product (violates hierarchy)

**Rationale**: Hierarchy edges represent parent-child structural relationships. Allowing upward connections would break the hierarchical model.

### 2. Dependency Edges (Loose)

**Purpose**: Show behavioral dependencies across node types

**Allowed Connections**:
- Any node type → Any node type

**Rationale**: Dependencies are about behavior, not structure. A component can depend on a feature, a feature can depend on another feature, etc. This flexibility is essential for accurately representing real-world dependencies.

### 3. Integration Edges (Unrestricted)

**Purpose**: Show boundary-crossing integrations

**Allowed Connections**:
- Any node type → Any node type (including groups)

**Rationale**: Integration edges explicitly ignore hierarchy. They represent how different systems or components integrate with each other, which can happen at any level.

### 4. Extension Edges (Augmentative)

**Purpose**: Show extension and augmentation relationships

**Allowed Connections**:
- Feature → Component
- Component → Component
- Component → Feature
- Feature/Component/TextBlock → Product (middleware, plugins)

**Rationale**: Extensions are cross-level by nature. Plugins, middleware, and extensions can augment components at various levels.

### 5. Alternative Edges (Unrestricted)

**Purpose**: Represent optional paths and choices

**Allowed Connections**:
- Any node type → Any node type (including groups)

**Rationale**: Alternatives represent choices, not structural claims. Any component can be an alternative to another.

### 6. Grouping Edges (Unrestricted)

**Purpose**: Visual organization

**Allowed Connections**:
- Any node type → Any node type (including groups)

**Rationale**: Grouping is purely a layout hint, not a semantic claim about relationships.

## API Reference

### Core Functions

#### `isValidConnection(sourceType, targetType, edgeType)`

Check if a connection is valid for a given edge type.

```typescript
import { isValidConnection } from '@docmaps/graph/connection-rules';

const valid = isValidConnection('product', 'component', 'hierarchy');
// Returns: true
```

#### `getValidTargetTypes(sourceType, edgeType)`

Get all valid target types for a source type and edge type.

```typescript
import { getValidTargetTypes } from '@docmaps/graph/connection-rules';

const targets = getValidTargetTypes('product', 'hierarchy');
// Returns: ['component']
```

#### `getValidEdgeTypes(sourceType, targetType)`

Get all edge types that allow a connection between two node types.

```typescript
import { getValidEdgeTypes } from '@docmaps/graph/connection-rules';

const edgeTypes = getValidEdgeTypes('component', 'feature');
// Returns: ['dependency', 'integration', 'extension', 'alternative', 'grouping']
```

#### `getConnectionInvalidReason(sourceType, targetType, edgeType)`

Get a human-readable reason why a connection is invalid.

```typescript
import { getConnectionInvalidReason } from '@docmaps/graph/connection-rules';

const reason = getConnectionInvalidReason('feature', 'product', 'hierarchy');
// Returns: "hierarchy edges cannot connect feature to product. Strict parent-child structural relationships"
```

### Validation Functions

#### `validateConnection(connection, nodes, edges, edgeType?)`

Validate a connection in the context of the current graph.

```typescript
import { validateConnection } from '@docmaps/graph/handle-validator';

const result = validateConnection(
  { source: 'node1', target: 'node2' },
  nodes,
  edges,
  'hierarchy'
);

if (!result.isValid) {
  console.error(result.reason);
}
```

## User Experience

### Creating Connections

1. User drags from a source node to a target node
2. System validates the connection with the default edge type (hierarchy)
3. If invalid, shows an error toast with the reason
4. If valid, creates the edge

### Changing Edge Types

1. User selects an existing edge
2. Opens the edge properties panel
3. Changes the edge type dropdown
4. System validates the new edge type
5. If invalid, shows a warning banner with explanation
6. User can see which edge types are valid for the connection

### Visual Feedback

- **Valid connections**: Green ring around target node
- **Invalid connections**: Red ring with opacity, error message
- **Edge panel warnings**: Red banner with alert icon and detailed explanation

## Implementation Notes

### Backward Compatibility

The system maintains backward compatibility by:
- Making the `edgeType` parameter optional in validation functions
- Falling back to checking if ANY edge type allows the connection
- Preserving existing function signatures

### Performance

- Rules are defined as static data structures
- Validation is O(1) for most operations
- No runtime rule compilation or complex logic

### Extensibility

To add a new edge type:

1. Add the edge type to `packages/graph/edge-types.ts`
2. Define connection rules in `packages/graph/connection-rules.ts`
3. Rules automatically apply throughout the application

To add a new node type:

1. Add the node type to `packages/graph/handle-config.ts`
2. Update connection rules to include the new type
3. Add handle configuration for the new node type

## Testing Recommendations

### Unit Tests

Test the core validation logic:

```typescript
describe('Connection Rules', () => {
  it('should allow hierarchy from product to component', () => {
    expect(isValidConnection('product', 'component', 'hierarchy')).toBe(true);
  });

  it('should not allow hierarchy from feature to product', () => {
    expect(isValidConnection('feature', 'product', 'hierarchy')).toBe(false);
  });

  it('should allow dependency between any types', () => {
    expect(isValidConnection('feature', 'product', 'dependency')).toBe(true);
  });
});
```

### Integration Tests

Test the UI validation:

1. Create nodes of different types
2. Attempt to connect them with various edge types
3. Verify error messages appear correctly
4. Verify valid connections are allowed

## Future Enhancements

Potential improvements:

1. **Configurable Rules**: Allow users to customize connection rules per map
2. **Rule Suggestions**: Suggest appropriate edge types based on node types
3. **Batch Validation**: Validate all edges when importing maps
4. **Visual Rule Explorer**: UI to browse and understand connection rules
5. **Rule Warnings**: Soft warnings for unusual but valid connections

## Migration Guide

For existing maps with invalid connections:

1. The system will show validation errors when editing
2. Users can change the edge type to a valid one
3. Or adjust the node types to make the connection valid
4. No automatic migration is performed to preserve user intent
