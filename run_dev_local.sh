#!/bin/bash
set -e
ng build
tsc --project src/server/tsconfig.json
npm i
node -r ./tsconfig-paths-bootstrap.js src/server/GeBeO.js