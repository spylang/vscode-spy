# spy-lang — VSCode extension for `.spy` files

Gives `.spy` files full Python-like editing support **without** Pylance diagnostics.

## Features

|   Feature           | How it works |
| ------------------- | ------------ |
| Syntax highlighting | Inherits Python's TextMate grammar |
| Tab / Enter indentation | Python-identical `onEnterRules` + `indentationRules` |
| Comment / uncomment | `#` line comments, `"""` block comments (`Ctrl+/` / `⌘/`) |
| Ruff formatting | Pipes the file through `ruff format` on demand or on save |

## Requirements

- **Ruff** must be installed and available in `PATH`:*

  ```bash
  uv tool install ruff
  ```

  Or set the full path in settings:

  ```json
  "spy.formatting.ruffPath": "/path/to/ruff"
  ```

---

## Extension settings

| Setting | Default | Description |
|---|---|---|
| `spy.formatting.enabled` | `true` | Enable/disable Ruff formatting |
| `spy.formatting.ruffPath` | `""` | Path to `ruff` binary (leave empty to use PATH) |

---

## Recommended workspace settings

Add this to your `.vscode/settings.json`:

```json
{
  "[spy]": {
    "editor.defaultFormatter": "spy-lang.spy-language",
    "editor.formatOnSave": true,
    "editor.tabSize": 4,
    "editor.insertSpaces": true
  }
}
```
