# Release Process & Auto-Updates

This document explains how the automated release process works and how to create new releases.

## Automated Build & Release

The project uses GitHub Actions to automatically build and release new versions when changes are pushed to the `main` branch.

### How It Works

1. **Trigger**: Push to `main` branch or create a version tag
2. **Build**: GitHub Actions builds both portable and installer versions on Windows
3. **Release**: Automatically creates a GitHub release with the current version from `package.json`
4. **Assets**: Uploads the following files:
   - `BPSR-Creature-Tracker.exe` (Portable)
   - `BPSR-Tracker-Setup.exe` (Installer)
   - `latest.yml` (Auto-updater manifest)

### Auto-Update System

The application uses `electron-updater` to check for new releases:

- **Check Frequency**: On app startup and manually via the UI
- **Update Source**: GitHub Releases
- **Supported Builds**: Both portable and installer versions
- **User Control**: Users can choose to download now or later

## Creating a New Release

### Method 1: Version Bump (Recommended)

1. Update the version in `package.json`:
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. Update `CHANGELOG.md` with new changes:
   ```markdown
   ## [1.1.0] - 2025-11-05
   ### Added
   - New feature description
   ### Fixed
   - Bug fix description
   ```

3. Commit and push to main:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Release v1.1.0"
   git push origin main
   ```

4. GitHub Actions will automatically:
   - Build the application
   - Create a release tagged `v1.1.0`
   - Upload build artifacts
   - Generate `latest.yml` for auto-updates

### Method 2: Manual Tag

If you prefer to create releases manually:

```bash
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

## Workflow File

The build workflow is defined in `.github/workflows/build-release.yml`:

```yaml
on:
  push:
    branches:
      - main  # Only builds on main branch
    tags:
      - 'v*'  # Or when version tags are pushed
```

## Testing Before Release

Before pushing to main, always:

1. Test locally:
   ```bash
   npm run dev
   ```

2. Build and test portable version:
   ```bash
   npm run build:portable
   ```

3. Verify auto-update configuration in `package.json`

## Troubleshooting

### Release Not Created

- Check GitHub Actions logs in the "Actions" tab
- Ensure the version in `package.json` is different from the last release
- Verify you have push access to the repository

### Auto-Update Not Working

- Check that `latest.yml` was uploaded to the release
- Verify the `publish` configuration in `package.json`
- Ensure the GitHub repository is public (or provide a token for private repos)

### Build Failures

- Check the build logs in GitHub Actions
- Ensure all dependencies are in `package.json`
- Verify the build scripts work locally

## Manual Release Override

If you need to create a release without the workflow:

1. Build locally:
   ```bash
   npm run build:portable
   npm run build:installer
   ```

2. Create release manually on GitHub
3. Upload files from `dist/` folder
4. Don't forget to upload `latest.yml`!

## Security Notes

- The `GITHUB_TOKEN` is automatically provided by GitHub Actions
- No manual token configuration required
- Releases are public by default (suitable for open source)

## Configuration Reference

### package.json
```json
{
  "version": "1.0.0",  // Auto-incremented version
  "build": {
    "publish": [{
      "provider": "github",
      "owner": "Visqi",
      "repo": "BPSR_BossTrackerDesktop"
    }]
  }
}
```

### auto-updater.js
The auto-updater automatically uses the GitHub releases:
- Checks for `latest.yml` in the latest release
- Downloads the new portable executable
- Prompts user to install

## Support

For issues with the release process, check:
- GitHub Actions logs
- `package.json` configuration
- Build scripts in `package.json`
