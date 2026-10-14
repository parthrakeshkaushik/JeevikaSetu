import { describe, it, expect } from 'vitest';
import { WorkflowEngine } from '../src/services/workflowEngine.js';
import { REPORT_STATUS, ROLES } from '../src/config.js';

describe('WorkflowEngine and State Machine', () => {
  it('allows BDO to transition SUBMITTED to ASSIGNED_FOR_VERIFICATION', () => {
    const res = WorkflowEngine.canTransition(
      REPORT_STATUS.SUBMITTED,
      REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
      ROLES.BDO
    );
    expect(res.allowed).toBe(true);
  });

  it('allows Volunteer to record field verification (VERIFIED)', () => {
    const res = WorkflowEngine.canTransition(
      REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
      REPORT_STATUS.VERIFIED,
      ROLES.VOLUNTEER
    );
    expect(res.allowed).toBe(true);
  });

  it('prohibits Volunteer from closing a case directly', () => {
    const res = WorkflowEngine.canTransition(
      REPORT_STATUS.VERIFIED,
      REPORT_STATUS.CLOSED,
      ROLES.VOLUNTEER
    );
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('VOLUNTEER');
  });

  it('allows District Magistrate or BDO to close a verified/action recorded case', () => {
    const res = WorkflowEngine.canTransition(
      REPORT_STATUS.ACTION_RECORDED,
      REPORT_STATUS.CLOSED,
      ROLES.DM
    );
    expect(res.allowed).toBe(true);
  });

  it('rejects invalid backwards transitions without valid reopen process', () => {
    const res = WorkflowEngine.canTransition(
      REPORT_STATUS.CLOSED,
      REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
      ROLES.BDO
    );
    expect(res.allowed).toBe(false);
  });

  it('enforces block jurisdiction check for BDO', () => {
    // BDO of Nirmali trying to access Nirmali
    const allowed = WorkflowEngine.canAccessJurisdiction(
      ROLES.BDO,
      'BLOCK',
      'Nirmali',
      'Supaul',
      'Nirmali'
    );
    expect(allowed).toBe(true);

    // BDO of Nirmali trying to access Pipra
    const forbidden = WorkflowEngine.canAccessJurisdiction(
      ROLES.BDO,
      'BLOCK',
      'Nirmali',
      'Supaul',
      'Pipra'
    );
    expect(forbidden).toBe(false);
  });
});
