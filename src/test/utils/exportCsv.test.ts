import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportCsv } from '@/utils/exportCsv'

describe('exportCsv', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>
  let clickSpy: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => 'blob:mock-url')
    revokeObjectURLSpy = vi.fn()
    clickSpy = vi.fn()

    URL.createObjectURL = createObjectURLSpy
    URL.revokeObjectURL = revokeObjectURLSpy

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
      }
      return document.createElement(tag)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does nothing when rows array is empty', () => {
    exportCsv('test.csv', [])
    expect(createObjectURLSpy).not.toHaveBeenCalled()
  })

  it('creates a blob and triggers download for one row', () => {
    exportCsv('alerts.csv', [{ id: '1', level: 'HIGH', message: 'test' }])
    expect(createObjectURLSpy).toHaveBeenCalledOnce()
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })

  it('includes headers from the first row keys', () => {
    let capturedContent = ''
    const OrigBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[] | undefined) => {
      capturedContent = String(parts?.[0] ?? '')
      return new OrigBlob(parts)
    })
    exportCsv('out.csv', [{ name: 'Alice', score: 95 }])
    expect(capturedContent.split('\n')[0]).toBe('name,score')
  })

  it('escapes values containing commas', () => {
    let capturedContent = ''
    const OrigBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[] | undefined) => {
      capturedContent = String(parts?.[0] ?? '')
      return new OrigBlob(parts)
    })
    exportCsv('out.csv', [{ msg: 'hello, world' }])
    expect(capturedContent).toContain('"hello, world"')
  })

  it('escapes values containing double-quotes', () => {
    let capturedContent = ''
    const OrigBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[] | undefined) => {
      capturedContent = String(parts?.[0] ?? '')
      return new OrigBlob(parts)
    })
    exportCsv('out.csv', [{ msg: 'say "hi"' }])
    expect(capturedContent).toContain('"say ""hi"""')
  })

  it('handles multiple rows correctly', () => {
    let capturedContent = ''
    const OrigBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[] | undefined) => {
      capturedContent = String(parts?.[0] ?? '')
      return new OrigBlob(parts)
    })
    exportCsv('out.csv', [
      { id: '1', val: 10 },
      { id: '2', val: 20 },
    ])
    const lines = capturedContent.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('1,10')
    expect(lines[2]).toBe('2,20')
  })

  it('sets correct download filename', () => {
    const mockAnchor = { href: '', download: '', click: clickSpy }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement)
    exportCsv('my-file.csv', [{ x: 1 }])
    expect(mockAnchor.download).toBe('my-file.csv')
  })
})
