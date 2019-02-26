#!/bin/bash
HTTP_PORT=3000 node src/index.operator.js 2<&1 &
HTTP_PORT=3001 node src/index.user.js 2<&1 &
HTTP_PORT=3002 node src/index.user.js 2<&1 &
HTTP_PORT=3003 node src/index.user.js 2<&1 &

