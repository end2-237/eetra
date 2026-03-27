#!/bin/bash

# Run Prisma migration
cd /vercel/share/v0-project
npx prisma migrate dev --name add_document_share
