# addtime
Adder of Time https://addtime.pistonite.dev


## To use in Google Sheet Apps Script
In your Google Sheet, go to `Extensions > Apps Script`, and paste
in [this script](https://addtime.pistonite.dev/appscript.txt)

The following functions are available:
- `ADDTIME` - Adds a range of cells of time expressions
- `SUBTIME` - Subtracts 2 cells of time expressions
- `DIVTIME` - Divides 2 cells of time expressions

## To consume as TypeScript library
Simply copy the TS source to your project
```
curl https://pistonite.github.io/addtime/dist.ts > somewhere/addtime.ts 
```
Then import and use
```typescript
import { calc, ratio } from "addtime.ts";
```
