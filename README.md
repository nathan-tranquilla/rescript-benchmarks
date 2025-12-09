# ReScript vs TypeScript Compilation Benchmark

## Environment Requirements

- **Ruby**: 3.3.10+ (for Rake build automation)
- **Node.js**: 22.21.1+ (for TypeScript and ReScript compilers)
- **Platform**: Tested on macOS ARM64 (Apple Silicon)

## Flox Setup (Recommended)

1. Install flox: https://flox.dev/docs/install-flox/install/
2. `flox activate` - provides isolated environment with correct Ruby and Node.js versions

Alternatively, ensure Ruby and Node.js are installed with the versions above.

## Usage

### Quick Benchmark
```bash
rake benchmark
```