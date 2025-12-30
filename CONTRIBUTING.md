# Contributing to ABC Emergency Map Card

Thank you for your interest in contributing! This document provides guidelines for contributing to the ABC Emergency Map Card project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Documentation Guidelines](#documentation-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Git
- A Home Assistant development environment (recommended)

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lovelace-abc-emergency-map.git
   cd lovelace-abc-emergency-map
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Start development build:**
   ```bash
   pnpm run dev
   ```

5. **Link to Home Assistant:**
   - Copy `dist/abc-emergency-map-card.js` to your HA `config/www/` directory
   - Or use a symlink for automatic updates during development

---

## Making Changes

### Branch Naming

Use descriptive branch names:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-offline-support` |
| Bug fix | `fix/description` | `fix/polygon-rendering` |
| Documentation | `docs/description` | `docs/configuration-guide` |
| Refactor | `refactor/description` | `refactor/tile-providers` |

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code change that neither fixes nor adds
- `test` - Adding tests
- `chore` - Build process or tooling

**Examples:**
```
feat(animations): add configurable pulse duration
fix(zones): correct radius calculation for passive zones
docs(readme): add troubleshooting section
```

---

## Pull Request Process

1. **Create an issue first** (for non-trivial changes)
   - Discuss the approach before coding
   - Link your PR to the issue

2. **Ensure your code:**
   - Passes linting: `pnpm run lint`
   - Passes type checking: `pnpm run typecheck`
   - Builds successfully: `pnpm run build`

3. **Update documentation** if needed
   - README for user-facing changes
   - Code comments for complex logic

4. **Submit the PR:**
   - Use a clear title
   - Describe what changed and why
   - Include screenshots for UI changes
   - Link related issues

5. **Respond to review feedback** promptly

---

## Documentation Guidelines

### Documentation Structure

```
docs/
├── getting-started.md      # Quick start guide
├── configuration.md        # Complete config reference
├── features.md             # Feature documentation
├── generic-geojson.md      # Developer integration guide
├── troubleshooting.md      # Common issues
├── australian-warning-system.md  # Alert level reference
└── examples/               # Configuration examples
    ├── README.md
    ├── minimal.yaml
    └── ...
```

### Documentation Style Guide

#### Markdown Formatting

- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language identifiers:
  ```yaml
  type: custom:abc-emergency-map-card
  ```
- Use tables for structured data
- Use horizontal rules (`---`) for major section breaks

#### Code Examples

- Always specify the language (yaml, typescript, bash)
- Include comments explaining non-obvious parts
- Test all YAML examples for validity
- Use realistic entity names (not `entity_1`, `entity_2`)

#### Tables

Use proper alignment:
```markdown
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | - | Card title |
```

#### Links

- Use relative links within docs: `[Configuration](configuration.md)`
- Use absolute links for external resources
- Verify all links work before submitting

### Writing Guidelines

#### Target Audience
- Primary: Home Assistant users with intermediate technical knowledge
- Secondary: Developers integrating custom GeoJSON sources

#### Tone
- Helpful and professional
- Clear and concise
- Avoid jargon without explanation

#### Required Sections (for new docs)

1. Title with brief description
2. Table of contents (for longer docs)
3. Prerequisites (if applicable)
4. Step-by-step instructions
5. Examples
6. Related links / See Also

### Testing Documentation

Before submitting:
- [ ] Verify YAML examples are valid
- [ ] Check all internal links
- [ ] Review on mobile viewport
- [ ] Spell check
- [ ] Have someone else follow the instructions

---

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over type aliases for objects
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Formatting

- Use Prettier defaults (configured in project)
- Run `pnpm run lint` before committing
- Fix all ESLint warnings

### File Organization

```
src/
├── abc-emergency-map-card.ts   # Main card component
├── editor.ts                   # Visual config editor
├── types.ts                    # TypeScript interfaces
├── styles.ts                   # CSS-in-JS styles
├── tile-providers.ts           # Tile provider configs
├── entity-markers.ts           # Entity marker logic
├── incident-polygons.ts        # Polygon rendering
├── zone-renderer.ts            # Zone rendering
├── history-trails.ts           # History trail logic
├── bounds-manager.ts           # Auto-fit bounds
└── leaflet-loader.ts           # Dynamic Leaflet loading
```

---

## Testing

### Manual Testing

1. Test in Home Assistant with real data
2. Test with ABC Emergency Integration
3. Test without incidents (empty state)
4. Test on mobile devices
5. Test with different browsers

### Test Cases to Verify

- [ ] Card loads without errors
- [ ] Polygons render correctly
- [ ] Animations work (pulse, transitions)
- [ ] Entity markers display
- [ ] Zones render as circles
- [ ] Theme switching works
- [ ] Configuration editor functions
- [ ] Keyboard navigation works
- [ ] Screen reader announces updates

---

## Questions?

- **Issues:** [GitHub Issues](https://github.com/troykelly/lovelace-abc-emergency-map/issues)
- **Discussions:** [GitHub Discussions](https://github.com/troykelly/lovelace-abc-emergency-map/discussions)

Thank you for contributing!
