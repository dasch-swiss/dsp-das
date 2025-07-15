# vre-open-api

This library was generated with [Nx](https://nx.dev).

## OpenAPI Client Generation

This library contains auto-generated TypeScript client code for the DSP-API based on OpenAPI specifications.

### How it works

1. **Local spec file**: `api-spec.yaml` contains the DSP-API OpenAPI specification
2. **Generation**: `npm run generate-openapi-module` creates TypeScript client code
3. **CI checks**: GitHub Actions automatically detects when the API spec is outdated

### Updating the API client

When the DSP-API changes, the spec file and client files need to be updated in a SEPARATE BRANCH:

```bash
# 1. Update the spec file
curl -o libs/vre/3rd-party-services/open-api/api-spec.yaml https://api.dev.dasch.swiss/api/docs/docs.yaml

# 2. Generate new client code
npm run generate-openapi-module

# 3. Commit both changes
git add libs/vre/3rd-party-services/open-api/
git commit -m "update OpenAPI client for DSP-API changes"
```

### CI Integration

The GitHub Actions workflow includes a `check-openapi-sync` job that:
- Downloads the latest API spec from `https://api.dev.dasch.swiss/api/docs/docs.yaml`
- Compares it with the stored `api-spec.yaml`
- Fails CI if they differ, with instructions on how to update

This ensures the generated client code stays in sync with the actual API.
