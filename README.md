# sub-tracker

## Docker

```shell
docker run --name sub-tracker \
  -p 3000:3000 \
  -e TZ="Europe/Paris" \
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

```yaml
services:
  subtracker:
    image: ghcr.io/zareix/sub-tracker:v1.0.0
    environment:
      - TZ=Europe/Paris
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} # generate with `openssl rand -hex 32`
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - BETTER_AUTH_URL=https://subtracker.example.com
      - DATABASE_PATH=/data/db.sqlite
      - UPLOADS_FOLDER=/data/uploads
      - FIXER_API_KEY=${FIXER_API_KEY} # get it from fixer.io
      - S3_BUCKET=${S3_BUCKET} # optional
      - S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} # optional
      - S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} # optional
      - S3_REGION=${S3_REGION} # optional
      - S3_ENDPOINT=${S3_ENDPOINT} # optional
      - GOOGLE_SEARCH_ID=${GOOGLE_SEARCH_ID} # optional
      - GOOGLE_SEARCH_KEY=${GOOGLE_SEARCH_KEY} # optional
      - EMAIL_SERVER=${EMAIL_SERVER} # optional
      - EMAIL_FROM=${EMAIL_FROM} # optional
    ports:
      - 3000:3000
    volumes:
      - /data/apps/subtracker:/data
```

## Config

| Name                 | Description                                                                | Default value     |
| -------------------- | -------------------------------------------------------------------------- | ----------------- |
| TZ                   | Timezone                                                                   | -                 |
| BETTER_AUTH_SECRET   | Secret key for [better-auth](https://github.com/better-auth/better-auth)   | -                 |
| ADMIN_EMAIL          | Admin email for default admin user                                         | -                 |
| BETTER_AUTH_URL      | Your app URL for [better-auth](https://github.com/better-auth/better-auth) | -                 |
| DATABASE_PATH        | Path to the database file                                                  | /app/db/db.sqlite |
| UPLOADS_FOLDER       | Path to the uploads folder                                                 | /app/uploads      |
| FIXER_API_KEY        | API key for [fixer.io](https://fixer.io)                                   | -                 |
| S3_BUCKET            | S3 bucket name                                                             | -                 |
| S3_ACCESS_KEY_ID     | S3 access key ID                                                           | -                 |
| S3_SECRET_ACCESS_KEY | S3 secret access key                                                       | -                 |
| S3_REGION            | S3 region                                                                  | -                 |
| S3_ENDPOINT          | S3 endpoint                                                                | -                 |
| GOOGLE_SEARCH_ID     | Google Custom Search Engine ID                                             | -                 |
| GOOGLE_SEARCH_KEY    | Google API key for Custom Search Engine                                    | -                 |
| EMAIL_SERVER         | SMTP server address                                                        | -                 |
| EMAIL_FROM           | From email address                                                         | -                 |

> [!NOTE]  
> Default admin password is `password`.

> [!TIP]  
> You can generate a random `BETTER_AUTH_SECRET` with `openssl rand -hex 32`.
