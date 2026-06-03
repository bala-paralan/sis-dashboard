// Export helpers used across panels

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const lines = [headers, ...rows].map((r) =>
    r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  )
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv' }), filename)
}

export function exportKML(filename: string, placemarks: { id: string; bearing: number; ts: number }[]) {
  const marks = placemarks
    .map(
      (p) =>
        `  <Placemark><name>${p.id}</name><description>Bearing: ${p.bearing.toFixed(0)}° at ${new Date(p.ts).toISOString()}</description><Point><coordinates>0,0,0</coordinates></Point></Placemark>`
    )
    .join('\n')
  const kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>\n${marks}\n</Document></kml>`
  downloadBlob(new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' }), filename)
}

export function exportSvgAsPng(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  const img = new Image()
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svgEl.clientWidth || svgEl.width.baseVal.value
    canvas.height = svgEl.clientHeight || svgEl.height.baseVal.value
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob((b) => b && downloadBlob(b, filename), 'image/png')
  }
  img.src = url
}

export function printReport(title: string, bodyHtml: string) {
  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:monospace;font-size:12px;padding:20px;color:#000}
    h2{margin-bottom:8px}pre{white-space:pre-wrap;word-break:break-word}
    @media print{button{display:none}}</style></head>
    <body><h2>${title}</h2>${bodyHtml}
    <br/><button onclick="window.print()">🖨 Print / Save PDF</button>
    </body></html>`)
  win.document.close()
}
