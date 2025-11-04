# Contributing to BPSR Creature Tracker

Thank you for your interest in contributing to the Blue Protocol Star Resonance Creature Tracker! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BPSR_BossTrackerDesktop.git
   cd BPSR_BossTrackerDesktop
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```

## Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **const** and **let**, avoid **var**
- Follow existing code patterns
- Add comments for complex logic

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Examples:
  - `Fix overlay click-through behavior`
  - `Add notification for low HP bosses`
  - `Update README with new features`

## Pull Request Process

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub with:
   - Clear description of changes
   - Screenshots if UI changes
   - Testing steps

## Testing

Before submitting a PR:
- Test in development mode (`npm run dev`)
- Build and test the portable version (`npm run build:portable`)
- Ensure no console errors
- Test on Windows 10/11 if possible

## Reporting Bugs

When reporting bugs, please include:
- Operating System and version
- Application version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console logs (if relevant)

## Feature Requests

Feature requests are welcome! Please:
- Check existing issues first
- Describe the feature clearly
- Explain the use case
- Consider if it fits the project scope

## Questions?

Feel free to open an issue for questions or discussions about the project.

Thank you for contributing! 🎉
