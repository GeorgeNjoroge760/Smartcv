import { describe, it, expect, beforeEach } from 'vitest';
import { getDefaultData, setData, getData, undo, redo, canUndo, canRedo, createEmptyData } from '../src/store.js';

describe('Data Store', () => {
  beforeEach(() => {
    createEmptyData();
  });

  it('returns default data structure', () => {
    const d = getDefaultData();
    expect(d).toHaveProperty('fullName');
    expect(d).toHaveProperty('skills');
    expect(d).toHaveProperty('experience');
    expect(d).toHaveProperty('education');
    expect(d).toHaveProperty('certifications');
    expect(d).toHaveProperty('languages');
    expect(d).toHaveProperty('publications');
    expect(d).toHaveProperty('volunteerWork');
    expect(d).toHaveProperty('coverLetter');
    expect(d).toHaveProperty('template', 'modern');
    expect(d).toHaveProperty('clTemplate', 'modern');
    expect(d).toHaveProperty('theme', 'light');
  });

  it('creates empty data', () => {
    const d = getData();
    expect(d.fullName).toBe('');
    expect(d.skills).toEqual([]);
    expect(d.experience).toEqual([]);
  });

  it('supports undo/redo', () => {
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);

    setData({ ...getData(), fullName: 'John' });

    expect(canUndo()).toBe(true);
    expect(getData().fullName).toBe('John');

    const success = undo();
    expect(success).toBe(true);
    expect(getData().fullName).toBe('');

    const redoSuccess = redo();
    expect(redoSuccess).toBe(true);
    expect(getData().fullName).toBe('John');
  });

  it('clears redo stack on new change', () => {
    setData({ ...getData(), fullName: 'A' });
    undo();
    setData({ ...getData(), fullName: 'B' });

    expect(canRedo()).toBe(false);
  });

  it('limits undo history to 50', () => {
    for (let i = 0; i < 60; i++) {
      setData({ ...getData(), fullName: `Name ${i}` });
    }
    for (let i = 0; i < 50; i++) {
      undo();
    }
    expect(getData().fullName).toBe('Name 9');
  });
});
