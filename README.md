# sub-tracker

## Docker

```shell
docker run --name sub-tracker \
  -p 3000:3000 \
  -e AUTH_SECRET="<AUTH_SECRET>" \
  -e DATABASE_PATH="/data/db.sqlite" \
  -e UPLOADS_FOLDER="/data/uploads" \
  -e FIXER_API_KEY="<FIXER_API_KEY>" \
  -v ./db.sqlite:/data/db.sqlite \
  -v ./temp/uploads:/data/uploads \
  -d ghcr.io/zariex/sub-tracker
```
