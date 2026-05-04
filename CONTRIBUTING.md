# Contribute to the SPy-lang VSCode extension

## Installation (development / local)

1. **Install dependencies**

   ```sh
   npm install
   npm run compile
   ```

2. **Load in VSCode**

   - Open the `vscode-spy` folder in VSCode
   - Open `src/extension.ts`
   - Press `F5` — this opens an **Extension Development Host** window with the extension active
   - Open any `.spy` file to test

3. **Package as `.vsix` for permanent install**

   ```sh
   npm install -g @vscode/vsce
   vsce package
   # produces spy-lang-0.1.0.vsix
   ```

   Then install it:

   ```sh
   code --install-extension spy-lang-0.1.0.vsix
   ```

## Publishing to the Marketplace

Run `vsce publish`
