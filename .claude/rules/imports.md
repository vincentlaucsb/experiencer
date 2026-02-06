# Import Rules

## React Imports
```typescript
// React 18/19 - automatic JSX transform
// Only import specific hooks/functions needed
import { useState, useContext } from 'react';

// NOT needed in most files:
// import React from 'react';
```

## Third-party Libraries
```typescript
// Named exports preferred
import { v4 as uuid } from 'uuid';
import { Popover } from 'react-tiny-popover';
import { createPortal } from 'react-dom';
```

## UUID Generation
Always use v4 from uuid package:
```typescript
import { v4 as uuid } from 'uuid';
const newId = uuid();

// NEVER:
// import uuid from 'uuid/v4';
```

## Helper Functions
Use local helper, not Node's deprecated util:
```typescript
import { isNullOrUndefined } from './Helpers';

// NEVER:
// import { isNullOrUndefined } from 'util';
```
