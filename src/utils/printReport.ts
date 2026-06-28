export interface PrintSection {
  label: string
  value: string
}

export interface PrintReport {
  title: string
  subtitle?: string
  site: string
  timestamp: string
  sections: PrintSection[]
  narrative?: string
  narrativeLabel?: string
  footer?: string
}

export function printReport(report: PrintReport): void {
  const sectionRows = report.sections
    .map(
      (s) => `<tr>
        <td style="padding:4px 8px;font-weight:bold;color:#666;white-space:nowrap;width:160px">${s.label}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee">${s.value}</td>
      </tr>`
    )
    .join('')

  const narrativeHtml = report.narrative
    ? `<div style="margin-top:16px">
        <div style="font-weight:bold;font-size:11px;color:#666;margin-bottom:4px">
          ${report.narrativeLabel ?? 'Operator Narrative'}
        </div>
        <div style="border:1px solid #ccc;border-radius:4px;padding:10px;font-size:12px;min-height:80px;white-space:pre-wrap">${report.narrative}</div>
      </div>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${report.title}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:13px;color:#111;margin:0;padding:24px}
    h1{font-size:18px;margin:0 0 2px}
    .subtitle{font-size:12px;color:#555;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    @media print{body{padding:0}}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:16px">
    <div>
      <h1>IINVSYS / SIS — ${report.title}</h1>
      ${report.subtitle ? `<div class="subtitle">${report.subtitle}</div>` : ''}
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div>${report.site}</div>
      <div>${report.timestamp}</div>
    </div>
  </div>
  <table>
    <tbody>${sectionRows}</tbody>
  </table>
  ${narrativeHtml}
  ${report.footer ? `<div style="margin-top:24px;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:8px">${report.footer}</div>` : ''}
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
