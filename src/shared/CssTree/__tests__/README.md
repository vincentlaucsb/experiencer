/**
 * CssNode Test Suite - Organized by Topic
 * 
 * This directory contains comprehensive tests for the CssNode class,
 * organized by functionality for better maintainability and discoverability.
 * 
 * Test Files:
 * ============
 * 
 * 1. CssNode.core.test.tsx
 *    - Constructor and basic property access
 *    - Basic node creation (add, addNode)
 *    - Property getters/setters (name, selector, indent, description)
 *    - Duplicate name validation
 * 
 * 2. CssNode.tree.test.tsx
 *    - Tree structure operations (add, delete, copySkeleton)
 *    - Tree traversal (children, isRoot, treeRoot)
 *    - Complex tree manipulations (deep deletes, multi-level operations)
 * 
 * 3. CssNode.navigation.test.tsx
 *    - Finding nodes (findNode, mustFindNode)
 *    - Path operations (fullPath, fullSelector)
 *    - Complex selector generation (comma selectors, pseudo-elements)
 * 
 * 4. CssNode.properties.test.tsx
 *    - Property management (setProperty, deleteProperty)
 *    - Batch property operations (setProperties, updateProperties)
 *    - Property effects on stylesheet output
 * 
 * 5. CssNode.serialization.test.tsx
 *    - Tree serialization (dump, load)
 *    - Deep cloning (deepCopy)
 *    - Round-trip consistency (dump/load/dump cycles)
 * 
 * 6. CssNode.stylesheet.test.tsx
 *    - CSS stylesheet generation
 *    - Complex selectors and pseudo-elements
 *    - Custom indentation
 *    - Nested and multiple child handling
 * 
 * 7. ReadonlyCssNode.ts
 *    - Immutability enforcement (defensive copies, readonly types)
 *    - Property access through wrapper
 *    - Anti-mutation guarantees
 * 
 * Test Coverage Statistics:
 * =========================
 * Total Test Suites:  7
 * Total Tests:        114+
 * Target Coverage:    >90% statements, >85% branches
 * 
 * Running Tests:
 * ==============
 * npm test -- CssNode          # Run all CssNode tests
 * npm test -- CssNode.core     # Run specific test file
 * npm test -- CssNode --coverage # Generate coverage report
 */
