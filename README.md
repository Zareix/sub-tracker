# sub-tracker

## Docker

```shell
docker run --name sub-tracker \
  -p 3000:3000 \
  -e BETTER_AUTH_SECRET="<AUTH_SECRET>" \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e ADMIN_EMAIL="raphael@example.com" \
  -e DATABASE_PATH="/data/db.sqlite" \
  -e UPLOADS_FOLDER="/data/uploads" \
  -e FIXER_API_KEY="<FIXER_API_KEY>" \
  -v ./db.sqlite:/data/db.sqlite \
  -v ./temp/uploads:/data/uploads \
  -d ghcr.io/zareix/sub-tracker
```
