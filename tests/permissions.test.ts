import { describe, it, expect } from 'vitest';
import { canView, canEdit, canDelete, canShare } from '../src/lib/permissions';

describe('Server-Side Permission Matrix Rules', () => {
  it('OWNER role has full administrative permissions', () => {
    expect(canView('OWNER')).toBe(true);
    expect(canEdit('OWNER')).toBe(true);
    expect(canDelete('OWNER')).toBe(true);
    expect(canShare('OWNER')).toBe(true);
  });

  it('EDITOR role can view and edit, but cannot delete or manage shares', () => {
    expect(canView('EDITOR')).toBe(true);
    expect(canEdit('EDITOR')).toBe(true);
    expect(canDelete('EDITOR')).toBe(false);
    expect(canShare('EDITOR')).toBe(false);
  });

  it('VIEWER role can only view, and cannot edit, delete, or share', () => {
    expect(canView('VIEWER')).toBe(true);
    expect(canEdit('VIEWER')).toBe(false);
    expect(canDelete('VIEWER')).toBe(false);
    expect(canShare('VIEWER')).toBe(false);
  });

  it('NONE role has zero permissions', () => {
    expect(canView('NONE')).toBe(false);
    expect(canEdit('NONE')).toBe(false);
    expect(canDelete('NONE')).toBe(false);
    expect(canShare('NONE')).toBe(false);
  });
});
