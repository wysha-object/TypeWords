// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// WebviewPanel 管理类
class ChatPanel {
  public static currentPanel: ChatPanel | undefined
  public static readonly viewType = 'typewordsChat'

  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []

  public static createOrShow(extensionUri: vscode.Uri) {
    // 如果已经有面板，直接显示
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside)
      return
    }

    // 创建新面板，放在右侧（使用 ViewColumn.Beside 确保在右侧）
    const panel = vscode.window.createWebviewPanel(ChatPanel.viewType, '单词练习', vscode.ViewColumn.Beside, {
      enableScripts: true,
      localResourceRoots: [],
      retainContextWhenHidden: true,
    })

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri

    // 设置初始 HTML
    this._update()

    // 监听面板关闭事件
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
  }

  public dispose() {
    ChatPanel.currentPanel = undefined

    // 清理资源
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private _update() {
    const webview = this._panel.webview
    this._panel.webview.html = this._getHtmlForWebview(webview)
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const websiteUrl = 'https://typewords.cc'
    // const cdnUrl = 'https://vs.typewords.cc'
    const cdnUrl = 'http://tw.cc'

    // 生成 nonce 用于 CSP
    const nonce = Buffer.from(Date.now().toString()).toString('base64')

    // CSP 配置：允许内联脚本（使用 nonce）和外部资源
    const csp = [
      "default-src 'none'",
      `script-src 'nonce-${nonce}' ${cdnUrl} 'unsafe-inline'`,
      `style-src ${cdnUrl} 'unsafe-inline'`,
      `connect-src ${cdnUrl} ${websiteUrl}`,
      'img-src data: https:',
      'font-src data:',
    ].join('; ')

    return `<!DOCTYPE html>
<html lang="zh-CN" style="width: 100%!important; height: 100%!important;">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>单词练习</title>


  <script type="module" crossorigin src="${cdnUrl}/assets/index-x5OWSEJi.js"></script>
  <link rel="stylesheet" crossorigin href="${cdnUrl}/assets/index-C_GoA8hD.css">
</head>
<body>
    <div id="app"></div>
</body>
</html>`
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('typewords.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from TypeW123123ords!')
  })

  // 打开聊天面板命令
  const openChatDisposable = vscode.commands.registerCommand('typewords.openChat', () => {
    ChatPanel.createOrShow(context.extensionUri)
  })

  context.subscriptions.push(disposable, openChatDisposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
