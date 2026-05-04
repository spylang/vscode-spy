import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// ---------------------------------------------------------------------------
// Formatter — pipes the document through `ruff format -` treating it as Python
// ---------------------------------------------------------------------------

class SpyFormatter implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    _options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    return new Promise((resolve, reject) => {
      const config = vscode.workspace.getConfiguration("spy");
      if (!config.get<boolean>("formatting.enabled", true)) {
        return resolve([]);
      }

      const ruffPath = this.resolveRuff(config.get<string>("formatting.ruffPath", ""));
      if (!ruffPath) {
        vscode.window.showErrorMessage(
          "SPy: could not find `ruff` executable. " +
          "Install it (`pip install ruff`) or set spy.formatting.ruffPath."
        );
        return resolve([]);
      }

      const originalText = document.getText();

      // Write to a temp .py file so ruff treats it as Python
      const tmpFile = path.join(os.tmpdir(), `spy_fmt_${Date.now()}.py`);
      fs.writeFileSync(tmpFile, originalText, "utf8");

      const proc = cp.spawn(ruffPath, ["format", "--quiet", tmpFile], {
        cwd: this.workspaceRoot(document),
      });

      let stderr = "";
      proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

      token.onCancellationRequested(() => proc.kill());

      proc.on("close", (code) => {
        if (code !== 0) {
          // Don't show an error for every syntax mistake — ruff will exit 1
          // on files with syntax errors but that's normal during editing.
          try { fs.unlinkSync(tmpFile); } catch {}
          return resolve([]);
        }

        let formatted: string;
        try {
          formatted = fs.readFileSync(tmpFile, "utf8");
          fs.unlinkSync(tmpFile);
        } catch (e) {
          return reject(e);
        }

        if (formatted === originalText) {
          return resolve([]); // nothing changed
        }

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(originalText.length)
        );
        resolve([vscode.TextEdit.replace(fullRange, formatted)]);
      });

      proc.on("error", (err) => {
        try { fs.unlinkSync(tmpFile); } catch {}
        vscode.window.showErrorMessage(`SPy formatter error: ${err.message}`);
        resolve([]);
      });
    });
  }

  private resolveRuff(configuredPath: string): string | null {
    if (configuredPath) {
      return fs.existsSync(configuredPath) ? configuredPath : null;
    }
    // Try common locations
    const candidates = ["ruff", "ruff.exe"];
    for (const c of candidates) {
      try {
        cp.execSync(`${c} --version`, { stdio: "ignore" });
        return c;
      } catch {}
    }
    return null;
  }

  private workspaceRoot(document: vscode.TextDocument): string {
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    return folder ? folder.uri.fsPath : path.dirname(document.uri.fsPath);
  }
}

// ---------------------------------------------------------------------------
// Extension entry points
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext) {
  // Register the formatter for 'spy' language
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "spy" },
      new SpyFormatter()
    )
  );

  // Handy status bar hint when a .spy file is active
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = "$(symbol-misc) SPy";
  statusBar.tooltip = "SPy file — Ruff formatting active";
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document.languageId === "spy") {
        statusBar.show();
      } else {
        statusBar.hide();
      }
    })
  );

  if (vscode.window.activeTextEditor?.document.languageId === "spy") {
    statusBar.show();
  }
}

export function deactivate() {}
