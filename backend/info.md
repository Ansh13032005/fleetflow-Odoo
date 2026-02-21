# Backend Application Info

This directory contains the NestJS backend application for Fleetflow.

## Architecture
- `src/modules/`: Feature-grouped business modules
- `src/common/`: Shared NestJS elements like decorators, guards, interceptors
- `src/config/`: Loading environment configs
- `src/database/`: Prisma database client integration
- `src/jobs/`: CRON and background tasks
