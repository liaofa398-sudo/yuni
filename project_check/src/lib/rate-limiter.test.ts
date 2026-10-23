import test from 'node:test';
import assert from 'node:assert/strict';
import { checkVisitorRateLimit, releaseVisitorInFlight, getTodayDateString } from './rate-limiter.ts';

test('rate-limiter permits valid first request within limits', () => {
  const { updatedRecord, result } = checkVisitorRateLimit(undefined, 20, {
    maxChars: 800,
    dailyLimit: 60,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remainingToday, 59);
  assert.equal(updatedRecord.countToday, 1);
  assert.equal(updatedRecord.inFlight, true);
});

test('rate-limiter rejects inputs exceeding character maximum', () => {
  const { result } = checkVisitorRateLimit(undefined, 850, {
    maxChars: 800,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.code, 'INPUT_TOO_LONG');
});

test('rate-limiter blocks concurrent requests in flight', () => {
  const initial = {
    timestamps: [Date.now()],
    quotaDate: getTodayDateString(),
    countToday: 1,
    inFlight: true,
  };

  const { result } = checkVisitorRateLimit(initial, 10);
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'IN_FLIGHT');

  const released = releaseVisitorInFlight(initial);
  assert.equal(released.inFlight, false);
});

test('rate-limiter enforces daily quota limits', () => {
  const fullRecord = {
    timestamps: [],
    quotaDate: getTodayDateString(),
    countToday: 5,
    inFlight: false,
  };

  const { result } = checkVisitorRateLimit(fullRecord, 15, { dailyLimit: 5 });
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'DAILY_QUOTA_EXCEEDED');
  assert.equal(result.remainingToday, 0);
});

test('rate-limiter blocks bursts exceeding per-minute threshold', () => {
  const now = 1000000;
  const recentTimes = [
    now - 10000,
    now - 8000,
    now - 5000,
    now - 2000,
  ];

  const record = {
    timestamps: recentTimes,
    quotaDate: getTodayDateString(now),
    countToday: 4,
    inFlight: false,
  };

  const { result } = checkVisitorRateLimit(record, 10, {
    maxPerMinute: 4,
    now,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.code, 'RATE_LIMIT_EXCEEDED');
  assert.ok((result.waitSeconds ?? 0) > 0);
});
