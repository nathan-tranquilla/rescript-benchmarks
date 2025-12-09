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

### Individual Tasks
```bash
rake build_ts     # Build TypeScript project
rake build_res    # Build ReScript project
rake clean        # Clean all build artifacts
rake reset        # Clean and regenerate test data
```

## Benchmark Configurations

The benchmark tests multiple scenarios:
- **1000 modules, 10 packages** - Baseline comparison
- **2000 modules, 10 packages** - Module scaling test
- **5000 modules, 10 packages** - Large-scale test

Each configuration runs 3 clean build trials and reports averages.