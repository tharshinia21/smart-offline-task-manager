import { describe, it, expect } from 'vitest'
import { isQuietHours, nextAllowedTime } from '../notifications/notificationManager'
import { getPriority as getPri } from './priorityEngine'
import type { Task } from '../types/task'

function makeTask(dueDate: string, dueTime: string, status: any='not_started'): Task {
  return { id: '1', title:'t', dueDate, dueTime, status, createdAt: Date.now(), updatedAt: Date.now(), version:1 } as Task
}

describe('priorityEngine per spec', ()=>{
  const now = new Date('2026-09-18T10:00:00')
  it('overdue when past deadline', ()=>{
    const t = makeTask('2026-09-16','18:00')
    expect(getPri(t, now)).toBe('overdue')
  })
  it('critical due today', ()=>{
    const t = makeTask('2026-09-18','18:00')
    expect(getPri(t, now)).toBe('critical')
  })
  it('very_high 1-2 days', ()=>{
    const t = makeTask('2026-09-19','10:00') // 1 day
    expect(getPri(t, now)).toBe('very_high')
    const t2 = makeTask('2026-09-20','10:00') // 2 days
    expect(getPri(t2, now)).toBe('very_high')
  })
  it('high 3-6 days', ()=>{
    const t = makeTask('2026-09-21','10:00') // 3
    expect(getPri(t, now)).toBe('high')
    const t2 = makeTask('2026-09-24','10:00') //6
    expect(getPri(t2, now)).toBe('high')
  })
  it('medium 7-14 days', ()=>{
    const t = makeTask('2026-09-25','10:00') //7
    expect(getPri(t, now)).toBe('medium')
    const t2 = makeTask('2026-10-02','10:00') //14
    expect(getPri(t2, now)).toBe('medium')
  })
  it('low 15+ days', ()=>{
    const t = makeTask('2026-10-03','10:00') //15
    expect(getPri(t, now)).toBe('low')
    const t2 = makeTask('2026-10-20','10:00')
    expect(getPri(t2, now)).toBe('low')
  })
})

describe('quiet hours', ()=>{
  it('23-7 quiet', ()=>{
    expect(isQuietHours(new Date('2026-09-18T02:00:00'))).toBe(true)
    expect(isQuietHours(new Date('2026-09-18T23:30:00'))).toBe(true)
    expect(isQuietHours(new Date('2026-09-18T10:00:00'))).toBe(false)
  })
  it('nextAllowed 7am', ()=>{
    const n = nextAllowedTime(new Date('2026-09-18T02:30:00'))
    expect(n.getHours()).toBe(7)
  })
})
