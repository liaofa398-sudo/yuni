export interface VisitorRecord {
  timestamps: number[];
  quotaDate: string;
  countToday: number;
  inFlight: boolean;
}

export interface RateCheckResult {
  allowed: boolean;
  code?: 'RATE_LIMIT_EXCEEDED' | 'DAILY_QUOTA_EXCEEDED' | 'INPUT_TOO_LONG' | 'IN_FLIGHT';
  message?: string;
  remainingToday: number;
  waitSeconds?: number;
}

export function getTodayDateString(now: number = Date.now()): string {
  const d = new Date(now);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function checkVisitorRateLimit(
  record: VisitorRecord | undefined,
  inputLength: number,
  options: {
    maxChars?: number;
    maxPerMinute?: number;
    dailyLimit?: number;
    now?: number;
  } = {}
): { updatedRecord: VisitorRecord; result: RateCheckResult } {
  const now = options.now ?? Date.now();
  const maxChars = options.maxChars ?? 800;
  const maxPerMinute = options.maxPerMinute ?? 15;
  const dailyLimit = options.dailyLimit ?? 60;
  const todayStr = getTodayDateString(now);

  const existing: VisitorRecord = record ?? {
    timestamps: [],
    quotaDate: todayStr,
    countToday: 0,
    inFlight: false,
  };

  // Reset daily count if day rolled over
  let countToday = existing.quotaDate === todayStr ? existing.countToday : 0;
  let inFlight = existing.inFlight;

  // 1. Check input length
  if (inputLength > maxChars) {
    return {
      updatedRecord: existing,
      result: {
        allowed: false,
        code: 'INPUT_TOO_LONG',
        message: `输入内容过长，请控制在 ${maxChars} 字以内（当前 ${inputLength} 字）`,
        remainingToday: Math.max(0, dailyLimit - countToday),
      },
    };
  }

  // 2. Check in flight (prevent rapid double clicking / concurrent flood)
  if (inFlight) {
    return {
      updatedRecord: existing,
      result: {
        allowed: false,
        code: 'IN_FLIGHT',
        message: '正在思考并为你回复中，请稍候片刻再发送哦~',
        remainingToday: Math.max(0, dailyLimit - countToday),
      },
    };
  }

  // 3. Check daily limit
  if (countToday >= dailyLimit) {
    return {
      updatedRecord: {
        ...existing,
        quotaDate: todayStr,
        countToday,
      },
      result: {
        allowed: false,
        code: 'DAILY_QUOTA_EXCEEDED',
        message: `今天对话额度已达上限（每日 ${dailyLimit} 条），爱弥斯明天准时在这里等你哦~`,
        remainingToday: 0,
      },
    };
  }

  // 4. Check per-minute burst rate
  const windowStart = now - 60000;
  const recentTimestamps = existing.timestamps.filter((t) => t > windowStart);

  if (recentTimestamps.length >= maxPerMinute) {
    const oldestInWindow = recentTimestamps[0];
    const waitSeconds = Math.max(1, Math.ceil((oldestInWindow + 60000 - now) / 1000));
    return {
      updatedRecord: {
        ...existing,
        timestamps: recentTimestamps,
        quotaDate: todayStr,
        countToday,
      },
      result: {
        allowed: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `回复太快啦，请慢下来，稍等 ${waitSeconds} 秒后再聊吧~`,
        remainingToday: Math.max(0, dailyLimit - countToday),
        waitSeconds,
      },
    };
  }

  // Allowed! Mark inFlight and record timestamp
  const updatedTimestamps = [...recentTimestamps, now];
  const nextCountToday = countToday + 1;

  return {
    updatedRecord: {
      timestamps: updatedTimestamps,
      quotaDate: todayStr,
      countToday: nextCountToday,
      inFlight: true,
    },
    result: {
      allowed: true,
      remainingToday: Math.max(0, dailyLimit - nextCountToday),
    },
  };
}

export function releaseVisitorInFlight(record: VisitorRecord): VisitorRecord {
  return {
    ...record,
    inFlight: false,
  };
}
