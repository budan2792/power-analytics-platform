## We use node version 22


## To start API dev environment run command "pnpm dev"


## To start WEB dev environment run command "pnpm --filter web dev"



# We added  API and WEB sub projects and now we need start in two differents terminals with next commands
## to start API use "pnpm dev:api" in terminal 1
## to start WEB use "pnpm dev:web" in terminal 2




docker run --name power-analytics-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=power_analytics \
  -p 5432:5432 \
  -d postgres:16


docker ps



## To show prisma web run command from apps/app  "pnpm exec prisma studio" or from root "pnpm --filter api exec prisma studio"



