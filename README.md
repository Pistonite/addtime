# addtime
Adder of Time https://pistonite.github.io/addtime


## To use in Google Sheet Apps Script
In your Google Sheet, go to `Extensions > Apps Script`, and paste
in [this script](https://pistonite.github.io/addtime/appscript.txt)

You will have access to the `ADDTIME` function which adds a range of cells,
and the `SUBTIME` function that subtracts 2 cells

## To consume as TypeScript library
Download the source to your project
```
curl https://pistonite.github.io/addtime/time.ts > somewhere/addtime.ts 
```
Then map the path in your `tsconfig.json`
```json
{
    "compilerOptions": {
        "paths": {
            "addtime": ["base/rel/path/to/somewhere/addtime.ts"]
        }
    },
    "include": ["path/to/somewhere"]
}
```
Finally import and use
```typescript
import { calc } from "addtime";
```
