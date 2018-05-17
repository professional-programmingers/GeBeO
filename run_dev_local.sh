#!/bin/bash
set -e
tsc
npm i
node -r tsconfig-paths/register GeBeO.js
